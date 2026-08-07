#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { CORE_SEO_PAGES, SITE_URL, UPDATED_AT } = require('../lib/seo/geoPages')

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const SUBMIT_SITEMAP_FILES = [
  'sitemap.xml',
  'sitemap-index.xml',
  'sitemap-core.xml',
  'sitemap.txt'
]

function main() {
  const allPages = [...CORE_SEO_PAGES]

  assertStaticHtmlPagesExist(allPages)
  writeFile('sitemap.xml', buildUrlset(allPages))
  writeFile('sitemap-core.xml', buildUrlset(CORE_SEO_PAGES))
  writeFile('sitemap-index.xml', buildSitemapIndex(['sitemap-core.xml', 'sitemap.xml']))
  writeFile('sitemap.txt', buildTextSitemap(allPages))
  writeFile('google-submit-urls.txt', buildSubmitUrlList(allPages))
}

function buildUrlset(pages) {
  const urls = getUniquePages(pages).map(page => {
    const loc = page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL
    return [
      '<url>',
      `<loc>${escapeXml(loc)}</loc>`,
      `<lastmod>${UPDATED_AT}</lastmod>`,
      `<changefreq>${page.changefreq || 'weekly'}</changefreq>`,
      `<priority>${page.priority || '0.7'}</priority>`,
      '</url>'
    ].join('')
  })

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>'
  ].join('\n')
}

function buildSitemapIndex(slugs) {
  const sitemaps = slugs.map(slug =>
    [
      '<sitemap>',
      `<loc>${escapeXml(`${SITE_URL}/${slug}`)}</loc>`,
      `<lastmod>${UPDATED_AT}</lastmod>`,
      '</sitemap>'
    ].join('')
  )

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemaps,
    '</sitemapindex>'
  ].join('\n')
}

function buildTextSitemap(pages) {
  return getUniquePages(pages)
    .map(page => (page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL))
    .join('\n')
}

function buildSubmitUrlList(pages) {
  const pageUrls = getUniquePages(pages).map(page =>
    page.slug ? `${SITE_URL}/${page.slug}` : SITE_URL
  )
  const sitemapUrls = SUBMIT_SITEMAP_FILES.map(slug => `${SITE_URL}/${slug}`)
  return Array.from(new Set([SITE_URL, ...sitemapUrls, ...pageUrls])).join('\n')
}

function assertStaticHtmlPagesExist(pages) {
  const missingPages = getUniquePages(pages)
    .filter(page => page.slug.endsWith('.html'))
    .filter(page => !fs.existsSync(path.join(PUBLIC_DIR, page.slug)))
    .map(page => page.slug)

  if (missingPages.length) {
    throw new Error(`Missing static SEO pages: ${missingPages.join(', ')}`)
  }
}

function getUniquePages(pages) {
  const unique = new Map()

  pages.forEach(page => {
    const slug = `${page.slug || ''}`.replace(/^\/+/, '')
    if (!unique.has(slug)) {
      unique.set(slug, { ...page, slug })
    }
  })

  return Array.from(unique.values())
}

function writeFile(fileName, content) {
  fs.writeFileSync(path.join(PUBLIC_DIR, fileName), `${content}\n`, 'utf8')
  console.log(`Wrote public/${fileName}`)
}

function escapeXml(value) {
  return `${value || ''}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

if (require.main === module) {
  main()
}
