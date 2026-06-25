import { CORE_SEO_PAGES, SITE_URL, UPDATED_AT } from '@/lib/seo/geoPages'

const NAV_PAGES = [
  { slug: 'archive', priority: '0.65', changefreq: 'daily' },
  { slug: 'category', priority: '0.6', changefreq: 'weekly' },
  { slug: 'tag', priority: '0.6', changefreq: 'weekly' },
  { slug: 'search', priority: '0.45', changefreq: 'monthly' }
]

export function getServerSideProps(ctx) {
  const pages = getUniquePages([...CORE_SEO_PAGES, ...NAV_PAGES])
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(page => {
      const loc = page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL
      return [
        '<url>',
        `<loc>${escapeXml(loc)}</loc>`,
        `<lastmod>${UPDATED_AT}</lastmod>`,
        `<changefreq>${page.changefreq || 'weekly'}</changefreq>`,
        `<priority>${page.priority || '0.7'}</priority>`,
        '</url>'
      ].join('')
    }),
    '</urlset>'
  ].join('\n')

  ctx.res.statusCode = 200
  ctx.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=86400, stale-while-revalidate=604800'
  )
  ctx.res.write(body)
  ctx.res.end()

  return { props: {} }
}

const getUniquePages = pages => {
  const unique = new Map()

  pages.forEach(page => {
    const slug = `${page.slug || ''}`.replace(/^\/+/, '')
    if (!unique.has(slug)) {
      unique.set(slug, {
        ...page,
        slug
      })
    }
  })

  return Array.from(unique.values())
}

const escapeXml = value =>
  `${value || ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export default function SitemapXml() {
  return null
}
