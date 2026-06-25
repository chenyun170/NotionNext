const SITE_URL = 'https://www.123170.xyz'
const UPDATED_AT = '2026-06-25'

const SITEMAPS = ['sitemap-core.xml', 'sitemap.xml']

export function getServerSideProps(ctx) {
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...SITEMAPS.map(slug =>
      [
        '<sitemap>',
        `<loc>${SITE_URL}/${slug}</loc>`,
        `<lastmod>${UPDATED_AT}</lastmod>`,
        '</sitemap>'
      ].join('')
    ),
    '</sitemapindex>'
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

export default function SitemapIndexXml() {
  return null
}
