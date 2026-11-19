#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const { CORE_SEO_PAGES, SITE_URL, UPDATED_AT } = require('../lib/seo/geoPages')
const { fetchNotionSitemapEntries } = require('../lib/seo/notionEntries')

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const SUBMIT_SITEMAP_FILES = [
  'sitemap.xml',
  'sitemap-index.xml'
]

async function main() {
  let dynamicPages = []
  let notionFailed = false
  try {
    const notionEntries = await fetchNotionSitemapEntries()
    dynamicPages = [
      ...notionEntries.posts.map(post => ({ slug: post.path, lastmod: post.lastmod })),
      ...notionEntries.tags.map(tag => ({
        slug: `tag/${tag.name}`,
        lastmod: tag.lastmod,
        changefreq: 'weekly'
      })),
      ...notionEntries.categories.map(category => ({
        slug: `category/${category.name}`,
        lastmod: category.lastmod,
        changefreq: 'weekly'
      }))
    ]
  } catch (error) {
    notionFailed = true
    console.warn('[sitemap] Notion 数据拉取失败，仅生成静态页 sitemap:', error.message)
  }

  // 保护：Notion 抖动或返回 0 篇文章时，绝不能把已上线的 sitemap 覆盖成
  // 只有静态页的版本，否则 Google 会一次性丢掉全站文章。宁可保持旧文件。
  const articleCount = dynamicPages.filter(page => page.slug?.startsWith('article/')).length
  const previousCount = countArticlesIn('sitemap.xml')
  if (articleCount === 0 && previousCount > 0) {
    console.warn(
      `[sitemap] 本次抓到 0 篇文章（上次 ${previousCount} 篇，Notion 拉取${notionFailed ? '失败' : '为空'}），` +
        '保留现有 sitemap 不覆盖。请检查 NOTION_TOKEN 与网络后重跑。'
    )
    writeFile('sitemap-core.xml', buildUrlset(CORE_SEO_PAGES))
    // 已有索引文件时不要重写：重写会把 lastmod 拉回旧日期，
    // 等于告诉 Google「sitemap 没更新」，反而降低重抓频率。
    if (!fs.existsSync(path.join(PUBLIC_DIR, 'sitemap-index.xml'))) {
      writeFile('sitemap-index.xml', buildSitemapIndex(['sitemap.xml']))
    }
    return
  }

  const allPages = [...CORE_SEO_PAGES, ...dynamicPages]
  // 索引的 lastmod 取全站最新一页，否则新增文章后索引仍显示旧日期，
  // Google 会认为 sitemap 没变，降低重抓频率。
  const latestLastmod = allPages.reduce(
    (latest, page) => (page.lastmod && page.lastmod > latest ? page.lastmod : latest),
    UPDATED_AT
  )

  assertStaticHtmlPagesExist(allPages)
  writeFile('sitemap.xml', buildUrlset(allPages))
  writeFile('sitemap-core.xml', buildUrlset(CORE_SEO_PAGES))
  // 索引只收录主表 sitemap.xml，避免 core 与 xml 内容重复导致 Google 判无法抓取
  writeFile('sitemap-index.xml', buildSitemapIndex(['sitemap.xml'], latestLastmod))
  writeFile('sitemap.txt', buildTextSitemap(allPages))
  writeFile('google-submit-urls.txt', buildSubmitUrlList(allPages))
}

function countArticlesIn(fileName) {
  const filePath = path.join(PUBLIC_DIR, fileName)
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    return (content.match(/\/article\//g) || []).length
  } catch (error) {
    return 0
  }
}

function buildUrlset(pages) {
  const urls = getUniquePages(pages).map(page => {
    const loc = page.slug ? `${SITE_URL}/${encodePath(page.slug)}` : SITE_URL
    return [
      '<url>',
      `<loc>${escapeXml(loc)}</loc>`,
      `<lastmod>${page.lastmod || UPDATED_AT}</lastmod>`,
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

/**
 * 中文标签/分类的 slug 必须做百分号编码，才能和页面 canonical 完全一致。
 * sitemap 里出现未编码的中文时，Google 视作另一条 URL，会和 canonical 对不上。
 */
function encodePath(slug) {
  return `${slug || ''}`
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
}

function buildSitemapIndex(slugs, lastmod = UPDATED_AT) {
  const sitemaps = slugs.map(slug =>
    [
      '<sitemap>',
      `<loc>${escapeXml(`${SITE_URL}/${slug}`)}</loc>`,
      `<lastmod>${lastmod}</lastmod>`,
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
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
