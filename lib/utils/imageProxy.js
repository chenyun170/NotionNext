/**
 * 图片同源代理。
 *
 * Notion 的封面和正文图最终由 img.notionusercontent.com 提供，
 * 国内网络偶尔连接重置，页面上就只剩灰块。走本站 /api/img 之后，
 * 图片和 HTML 同源、同一条线路：页面能打开，图片就能打开。
 *
 * 只对 Notion 相关域名生效，本地图片、外链图片原样返回。
 */
const PROXY_HOSTS = [
  'www.notion.so',
  'notion.so',
  'notion.site',
  'img.notionusercontent.com',
  'secure.notion-static.com',
  'prod-files-secure.s3.us-west-2.amazonaws.com',
  's3.us-west-2.amazonaws.com'
]

export const isProxiableImage = url => {
  if (!url || typeof url !== 'string') return false
  if (url.startsWith('/')) return false

  let parsed
  try {
    parsed = new URL(url)
  } catch (error) {
    return false
  }

  if (parsed.protocol !== 'https:') return false

  return PROXY_HOSTS.some(
    host => parsed.hostname === host || parsed.hostname.endsWith('.' + host)
  )
}

/**
 * Notion 的 /image/ 接口支持 width 参数，服务端按需缩图。
 * 卡片、封面在页面上通常只有 300-500px 宽，直接要原图会多传 3-5 倍字节。
 * 这里按渲染宽度取整到固定档位，既省流量，又不会让边缘缓存被零散宽度打碎。
 */
const NOTION_IMAGE_HOSTS = ['www.notion.so', 'notion.so', 'notion.site']
const NOTION_IMAGE_BUCKETS = [480, 768, 1080]

export const withNotionWidth = (url, targetWidth) => {
  if (!url || typeof url !== 'string' || !targetWidth) return url
  if (url.indexOf('/image/') === -1) return url

  let parsed
  try {
    parsed = new URL(url)
  } catch (error) {
    return url
  }

  if (!NOTION_IMAGE_HOSTS.includes(parsed.hostname)) return url
  if (!parsed.pathname.startsWith('/image/')) return url

  // 取最接近的档位，避免 400px 的卡片被抬到 1080
  const bucket = NOTION_IMAGE_BUCKETS.reduce((best, size) =>
    Math.abs(size - targetWidth) < Math.abs(best - targetWidth) ? size : best
  )

  const current = Number(parsed.searchParams.get('width') || 0)
  // 已有参数且档位接近就不动，避免同一张图产生多个缓存版本
  if (current && current <= bucket && current >= bucket * 0.9) return url

  parsed.searchParams.set('width', bucket)
  return parsed.toString()
}

export const toProxiedImageUrl = url => {
  if (!isProxiableImage(url)) return url
  return '/api/img?u=' + encodeURIComponent(url)
}
