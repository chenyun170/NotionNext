import BLOG from '@/blog.config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'

export async function getServerSideProps(ctx) {
  const props = await fetchGlobalAllData({
    from: 'llms.txt',
    locale: ctx?.locale
  })

  const NOTION_CONFIG = props?.NOTION_CONFIG
  const siteUrl = normalizeBaseUrl(getConfigValue('LINK', BLOG.LINK, NOTION_CONFIG))
  const siteTitle = props?.siteInfo?.title || getConfigValue('TITLE', BLOG.TITLE, NOTION_CONFIG)
  const siteDescription =
    props?.siteInfo?.description ||
    getConfigValue('DESCRIPTION', BLOG.DESCRIPTION, NOTION_CONFIG)
  const author = getConfigValue('AUTHOR', BLOG.AUTHOR, NOTION_CONFIG)
  const lang = getConfigValue('LANG', BLOG.LANG, NOTION_CONFIG)

  const publishedPages =
    props?.allPages?.filter(
      page => page?.status === BLOG.NOTION_PROPERTY_NAME.status_publish
    ) || []

  const posts = publishedPages
    .filter(page => page?.type === 'Post')
    .slice(0, 50)

  const pages = publishedPages
    .filter(page => page?.type === 'Page')
    .slice(0, 20)

  const categories = collectCategories(posts).slice(0, 30)
  const tags = collectTags(posts).slice(0, 50)

  const body = [
    `# ${siteTitle}`,
    '',
    `> ${siteDescription || ''}`,
    '',
    `- Site: ${siteUrl}`,
    `- Author: ${author}`,
    `- Language: ${lang}`,
    `- Sitemap: ${buildUrl(siteUrl, 'sitemap.xml')}`,
    `- RSS: ${buildUrl(siteUrl, 'rss/feed.xml')}`,
    '',
    '## Content Focus',
    '',
    'This site publishes practical articles about foreign trade, customs data, customer development, cross-border logistics, AI tools, and digital growth workflows.',
    '',
    '## Key Sections',
    '',
    `- Archive: ${buildUrl(siteUrl, 'archive')}`,
    `- Categories: ${buildUrl(siteUrl, 'category')}`,
    `- Tags: ${buildUrl(siteUrl, 'tag')}`,
    `- Search: ${buildUrl(siteUrl, 'search')}`,
    '',
    '## Categories',
    '',
    ...formatList(categories, item => `- ${item.name}: ${buildUrl(siteUrl, 'category', item.name)} (${item.count})`),
    '',
    '## Tags',
    '',
    ...formatList(tags, item => `- ${item.name}: ${buildUrl(siteUrl, 'tag', item.name)} (${item.count})`),
    '',
    '## Recent Posts',
    '',
    ...formatList(posts, post => {
      const summary = post.summary ? ` - ${sanitizeLine(post.summary)}` : ''
      return `- [${sanitizeLine(post.title)}](${buildUrl(siteUrl, post.slug)})${summary}`
    }),
    '',
    '## Pages',
    '',
    ...formatList(pages, page => `- [${sanitizeLine(page.title)}](${buildUrl(siteUrl, page.slug)})`),
    ''
  ].join('\n')

  ctx.res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=86400'
  )
  ctx.res.write(body)
  ctx.res.end()

  return {
    props: {}
  }
}

const normalizeBaseUrl = url => `${url || ''}`.replace(/\/+$/, '')

const getConfigValue = (key, fallback, config = {}) => config?.[key] ?? fallback

const trimSlashes = value => `${value || ''}`.replace(/^\/+|\/+$/g, '')

const buildUrl = (baseUrl, ...paths) => {
  const path = paths.map(trimSlashes).filter(Boolean).join('/')
  return path ? `${normalizeBaseUrl(baseUrl)}/${path}` : normalizeBaseUrl(baseUrl)
}

const sanitizeLine = value =>
  `${value || ''}`.replace(/\s+/g, ' ').replace(/[\[\]\(\)]/g, '').trim()

const formatList = (items, formatter) =>
  items?.length ? items.map(formatter) : ['- Not available yet']

const collectCategories = posts => {
  const counter = new Map()
  posts.forEach(post => {
    const categories = Array.isArray(post.category) ? post.category : [post.category]
    categories.filter(Boolean).forEach(category => {
      counter.set(category, (counter.get(category) || 0) + 1)
    })
  })
  return sortCounter(counter)
}

const collectTags = posts => {
  const counter = new Map()
  posts.forEach(post => {
    const tags = Array.isArray(post.tags) ? post.tags : [post.tags]
    tags.filter(Boolean).forEach(tag => {
      counter.set(tag, (counter.get(tag) || 0) + 1)
    })
  })
  return sortCounter(counter)
}

const sortCounter = counter =>
  Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

export default function LlmsTxt() {
  return null
}
