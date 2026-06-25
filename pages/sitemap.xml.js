// pages/sitemap.xml.js
import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { getServerSideSitemap } from 'next-sitemap'

const STATIC_SEO_PAGES = [
  {
    slug: 'customs-data.html',
    changefreq: 'weekly',
    priority: '0.92'
  },
  {
    slug: 'customs-data-skill.html',
    changefreq: 'weekly',
    priority: '0.9'
  },
  {
    slug: 'free-customs-data.html',
    changefreq: 'weekly',
    priority: '0.86'
  },
  {
    slug: 'us-importers.html',
    changefreq: 'weekly',
    priority: '0.86'
  },
  {
    slug: 'customs-data-importers.html',
    changefreq: 'weekly',
    priority: '0.87'
  },
  {
    slug: 'hs-code-lookup.html',
    changefreq: 'weekly',
    priority: '0.84'
  },
  {
    slug: 'supplier-analysis.html',
    changefreq: 'weekly',
    priority: '0.84'
  },
  {
    slug: 'customs-data-leads.html',
    changefreq: 'weekly',
    priority: '0.85'
  },
  {
    slug: 'oraskl.html',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    slug: 'turingsearch.html',
    changefreq: 'weekly',
    priority: '0.78'
  },
  {
    slug: 'turingsearch-vs-customs-data.html',
    changefreq: 'weekly',
    priority: '0.79'
  },
  {
    slug: 'dingyiyun.html',
    changefreq: 'weekly',
    priority: '0.78'
  },
  {
    slug: 'dingyiyun-customs-data.html',
    changefreq: 'weekly',
    priority: '0.79'
  },
  {
    slug: 'dingyi.html',
    changefreq: 'weekly',
    priority: '0.78'
  },
  {
    slug: 'tools.html',
    changefreq: 'weekly',
    priority: '0.82'
  },
  {
    slug: 'foreign-trade-tools.html',
    changefreq: 'weekly',
    priority: '0.82'
  },
  {
    slug: 'foreign-trade-lead-tools.html',
    changefreq: 'weekly',
    priority: '0.81'
  },
  {
    slug: 'faq.html',
    changefreq: 'weekly',
    priority: '0.8'
  },
  {
    slug: 'about.html',
    changefreq: 'monthly',
    priority: '0.72'
  },
  {
    slug: 'methodology.html',
    changefreq: 'monthly',
    priority: '0.74'
  }
]

const SITEMAP_NOTION_TIMEOUT_MS = Number.parseInt(
  process.env.SITEMAP_NOTION_TIMEOUT_MS || '3000',
  10
)

export const getServerSideProps = async ctx => {
  let fields = []
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)
    try {
      const siteData = await withTimeout(
        fetchGlobalAllData({
          pageId: id,
          from: 'sitemap.xml'
        }),
        SITEMAP_NOTION_TIMEOUT_MS,
        `fetch Notion data for sitemap (${id})`
      )
      const link = siteConfig(
        'LINK',
        siteData?.siteInfo?.link,
        siteData?.NOTION_CONFIG
      )
      const localeFields = generateLocalesSitemap(link, siteData?.allPages, locale)
      fields = fields.concat(localeFields)
    } catch (error) {
      console.error('[sitemap.xml] Failed to fetch Notion pages:', error)
      fields = fields.concat(generateLocalesSitemap(BLOG.LINK, [], locale))
    }
  }

  fields = getUniqueFields(fields)

  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=59'
  )
  return getServerSideSitemap(ctx, fields)
}

function generateLocalesSitemap(link, allPages, locale) {
  if (!link) {
    return []
  }

  const normalizedLink = link.endsWith('/') ? link.slice(0, -1) : link
  const normalizedLocale = locale && locale.length > 0
    ? locale.indexOf('/') === 0
      ? locale
      : `/${locale}`
    : ''
  const dateNow = new Date().toISOString().split('T')[0]
  const defaultFields = [
    {
      loc: `${normalizedLink}${normalizedLocale}`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      loc: `${normalizedLink}${normalizedLocale}/archive`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      loc: `${normalizedLink}${normalizedLocale}/category`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      loc: `${normalizedLink}${normalizedLocale}/rss/feed.xml`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    },
    {
      loc: `${normalizedLink}${normalizedLocale}/tag`,
      lastmod: dateNow,
      changefreq: 'daily',
      priority: '0.7'
    }
  ]
  const postFields =
    allPages
      ?.filter(p => p?.status === BLOG.NOTION_PROPERTY_NAME.status_publish && p?.slug)
      ?.map(post => {
        const slugWithoutLeadingSlash = post.slug.startsWith('/')
          ? post.slug.slice(1)
          : post.slug
        return {
          loc: `${normalizedLink}${normalizedLocale}/${slugWithoutLeadingSlash}`,
          lastmod: formatSitemapDate(post?.lastEditedDay || post?.publishDay, dateNow),
          changefreq: 'daily',
          priority: '0.7'
        }
      }) ?? []

  const staticFields = STATIC_SEO_PAGES.map(page => ({
    loc: `${normalizedLink}/${page.slug}`,
    lastmod: dateNow,
    changefreq: page.changefreq,
    priority: page.priority
  }))

  return defaultFields.concat(postFields, staticFields)
}

function getUniqueFields(fields) {
  const uniqueFieldsMap = new Map()

  fields.forEach(field => {
    const existingField = uniqueFieldsMap.get(field.loc)

    if (!existingField || new Date(field.lastmod) > new Date(existingField.lastmod)) {
      uniqueFieldsMap.set(field.loc, field)
    }
  })

  return Array.from(uniqueFieldsMap.values())
}

function withTimeout(promise, timeoutMs, label) {
  let timeoutId

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })
  ]).finally(() => clearTimeout(timeoutId))
}

function formatSitemapDate(value, fallback) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return fallback
  }
  return date.toISOString().split('T')[0]
}

const SitemapXml = () => {}

export default SitemapXml
