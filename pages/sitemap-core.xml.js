import { CORE_SEO_PAGES, SITE_URL, UPDATED_AT } from '@/lib/seo/geoPages'

export function getServerSideProps(ctx) {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...CORE_SEO_PAGES.map(page => {
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
