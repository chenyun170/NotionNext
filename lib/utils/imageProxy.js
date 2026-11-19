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

export const toProxiedImageUrl = url => {
  if (!isProxiableImage(url)) return url
  return '/api/img?u=' + encodeURIComponent(url)
}
