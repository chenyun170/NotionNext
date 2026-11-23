/**
 * Notion 图片同源代理。
 *
 * 为什么需要：封面和正文图最终从 img.notionusercontent.com 加载，
 * 国内网络偶发连接重置，图片位置只剩灰块。改成 /api/img 之后图片与
 * HTML 同源，页面能打开图片就能打开。
 *
 * 成本控制：
 * - 只代理 Notion 相关域名，不做通用图床；
 * - 响应带一年 s-maxage，命中的边缘缓存不会再调用函数；
 * - 上游失败或文件超过 4MB 时不硬扛，返回占位图或让浏览器直连。
 */

const ALLOWED_HOSTS = [
  'www.notion.so',
  'notion.so',
  'notion.site',
  'img.notionusercontent.com',
  'secure.notion-static.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3.us-west-2.amazonaws.com'
]

const LONG_CACHE =
  'public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=604800, immutable'
const SHORT_CACHE = 'public, max-age=60, s-maxage=60'

// Vercel 函数响应体的硬上限，超过就交给浏览器直连
const MAX_BYTES = 4 * 1024 * 1024
const MAX_REDIRECTS = 3
const SAFE_IMAGE_TYPES = new Set([
  'image/avif',
  'image/webp',
  'image/apng',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/bmp',
  'image/x-icon',
  'image/vnd.microsoft.icon'
])
const IMAGE_CSP = "default-src 'none'; sandbox;"

const FALLBACK_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">',
  '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">',
  '<stop offset="0" stop-color="#f7f5f1"/><stop offset="1" stop-color="#ece8e2"/>',
  '</linearGradient></defs>',
  '<rect width="1200" height="675" fill="url(#g)"/>',
  '<g fill="#d6d0c7">',
  '<rect x="470" y="286" width="260" height="8" rx="4"/>',
  '<rect x="512" y="316" width="176" height="8" rx="4"/>',
  '</g>',
  '<g fill="none" stroke="#c9c2b8" stroke-width="3" transform="translate(552 364)">',
  '<rect x="0" y="0" width="96" height="68" rx="8"/>',
  '<path d="M8 12l40 30 40-30"/>',
  '</g>',
  '</svg>'
].join('')

const isAllowedHost = hostname =>
  ALLOWED_HOSTS.some(host => hostname === host || hostname.endsWith('.' + host))

const sendFallback = res => {
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', SHORT_CACHE)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Content-Security-Policy', IMAGE_CSP)
  res.status(200).send(FALLBACK_SVG)
}

const redirectToSource = (res, target) => {
  res.setHeader('Cache-Control', SHORT_CACHE)
  res.redirect(302, target.toString())
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    return res.status(405).end()
  }

  const raw = req.query && req.query.u
  if (!raw || typeof raw !== 'string') {
    return sendFallback(res)
  }

  let target
  try {
    target = new URL(raw)
  } catch (error) {
    return sendFallback(res)
  }

  if (target.protocol !== 'https:' || !isAllowedHost(target.hostname)) {
    return sendFallback(res)
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 9000)

  try {
    let upstream
    for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
      if (
        target.protocol !== 'https:' ||
        !isAllowedHost(target.hostname) ||
        target.username ||
        target.password ||
        (target.port && target.port !== '443')
      ) {
        return sendFallback(res)
      }

      upstream = await fetch(target.toString(), {
        headers: {
          Accept: 'image/avif,image/webp,image/apng,image/png,image/*;q=0.8',
          Referer: 'https://www.notion.so/',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
        },
        redirect: 'manual',
        signal: controller.signal
      })

      if (![301, 302, 303, 307, 308].includes(upstream.status)) break

      const location = upstream.headers.get('location')
      await upstream.body?.cancel()
      if (!location || redirects === MAX_REDIRECTS) return sendFallback(res)
      target = new URL(location, target)
    }

    if (!upstream.ok) {
      await upstream.body?.cancel()
      return sendFallback(res)
    }

    const contentType = (upstream.headers.get('content-type') || '')
      .split(';')[0]
      .trim()
      .toLowerCase()
    if (!SAFE_IMAGE_TYPES.has(contentType)) {
      await upstream.body?.cancel()
      return sendFallback(res)
    }

    const declared = Number(upstream.headers.get('content-length') || 0)
    if (declared > MAX_BYTES) {
      await upstream.body?.cancel()
      return redirectToSource(res, target)
    }

    if (!upstream.body) return sendFallback(res)

    const reader = upstream.body.getReader()
    const chunks = []
    let totalBytes = 0
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        totalBytes += value.byteLength
        if (totalBytes > MAX_BYTES) {
          await reader.cancel()
          return redirectToSource(res, target)
        }
        chunks.push(Buffer.from(value))
      }
    } finally {
      reader.releaseLock()
    }

    if (!totalBytes) return sendFallback(res)
    const buffer = Buffer.concat(chunks, totalBytes)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', LONG_CACHE)
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Content-Security-Policy', IMAGE_CSP)

    if (req.method === 'HEAD') {
      return res.status(200).end()
    }

    return res.status(200).send(buffer)
  } catch (error) {
    return sendFallback(res)
  } finally {
    clearTimeout(timer)
  }
}
