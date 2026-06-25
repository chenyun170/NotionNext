const SITE_URL = 'https://www.123170.xyz'
const UPDATED_AT = '2026-06-25'

const CORE_PAGES = [
  { slug: '', priority: '1.0', changefreq: 'daily' },
  { slug: 'customs-data.html', priority: '0.92', changefreq: 'weekly' },
  { slug: 'customs-data-skill.html', priority: '0.9', changefreq: 'weekly' },
  { slug: 'customs-data-importers.html', priority: '0.87', changefreq: 'weekly' },
  { slug: 'customs-data-leads.html', priority: '0.85', changefreq: 'weekly' },
  { slug: 'free-customs-data.html', priority: '0.86', changefreq: 'weekly' },
  { slug: 'us-importers.html', priority: '0.86', changefreq: 'weekly' },
  { slug: 'hs-code-lookup.html', priority: '0.84', changefreq: 'weekly' },
  { slug: 'supplier-analysis.html', priority: '0.84', changefreq: 'weekly' },
  { slug: 'tools.html', priority: '0.82', changefreq: 'weekly' },
  { slug: 'foreign-trade-tools.html', priority: '0.82', changefreq: 'weekly' },
  { slug: 'foreign-trade-lead-tools.html', priority: '0.81', changefreq: 'weekly' },
  { slug: 'turingsearch.html', priority: '0.78', changefreq: 'weekly' },
  { slug: 'turingsearch-vs-customs-data.html', priority: '0.79', changefreq: 'weekly' },
  { slug: 'dingyiyun.html', priority: '0.78', changefreq: 'weekly' },
  { slug: 'dingyiyun-customs-data.html', priority: '0.79', changefreq: 'weekly' },
  { slug: 'dingyi.html', priority: '0.78', changefreq: 'weekly' },
  { slug: 'oraskl.html', priority: '0.8', changefreq: 'weekly' },
  { slug: 'faq.html', priority: '0.8', changefreq: 'weekly' },
  { slug: 'about.html', priority: '0.72', changefreq: 'monthly' },
  { slug: 'methodology.html', priority: '0.74', changefreq: 'monthly' }
]

export function getServerSideProps(ctx) {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...CORE_PAGES.map(page => {
      const loc = page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL
      return [
        '<url>',
        `<loc>${loc}</loc>`,
        `<lastmod>${UPDATED_AT}</lastmod>`,
        `<changefreq>${page.changefreq}</changefreq>`,
        `<priority>${page.priority}</priority>`,
        '</url>'
      ].join('')
    }),
    '</urlset>'
  ].join('\n')

  ctx.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=3600, stale-while-revalidate=86400'
  )
  ctx.res.write(body)
  ctx.res.end()

  return { props: {} }
}

export default function SitemapCoreXml() {
  return null
}
