#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const {
  CORE_SEO_PAGES,
  SITE_URL,
  buildUrl,
  getHtmlSeoPages
} = require('../lib/seo/geoPages')

const publicDir = path.join(process.cwd(), 'public')

const sectionHubs = {
  海关数据: 'customs-data.html',
  外贸工具: 'foreign-trade-tools.html',
  工具观察: 'foreign-trade-tools.html',
  案例示例: 'customs-data.html',
  搜索矩阵: 'foreign-trade-keyword-map.html',
  信任说明: 'methodology.html',
  品牌入口: 'oraskl.html'
}

const dataBreadcrumbPattern =
  /\n?\s*<script\b[^>]*data-geo-breadcrumb[^>]*>[\s\S]*?<\/script>/i
const anyBreadcrumbPattern = /"@type"\s*:\s*"BreadcrumbList"/

let changedCount = 0

for (const page of getHtmlSeoPages()) {
  const filePath = path.join(publicDir, page.slug)

  if (!fs.existsSync(filePath)) {
    console.warn(`skip missing ${page.slug}`)
    continue
  }

  let html = fs.readFileSync(filePath, 'utf8')
  const withoutOldGenerated = html.replace(dataBreadcrumbPattern, '')

  if (anyBreadcrumbPattern.test(withoutOldGenerated)) {
    if (withoutOldGenerated !== html) {
      fs.writeFileSync(filePath, withoutOldGenerated, 'utf8')
      changedCount += 1
    }
    continue
  }

  const breadcrumbScript = buildBreadcrumbScript(page)
  const nextHtml = withoutOldGenerated.replace(
    '</head>',
    `  ${breadcrumbScript}\n</head>`
  )

  if (nextHtml !== html) {
    fs.writeFileSync(filePath, nextHtml, 'utf8')
    changedCount += 1
  }
}

console.log(`Static breadcrumbs updated: ${changedCount}`)

function buildBreadcrumbScript(page) {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: '外贸获客情报局',
      item: SITE_URL
    }
  ]

  const hubSlug = sectionHubs[page.section]
  const hubPage = hubSlug
    ? CORE_SEO_PAGES.find(item => item.slug === hubSlug)
    : null

  if (hubPage && hubPage.slug !== page.slug) {
    itemListElement.push({
      '@type': 'ListItem',
      position: itemListElement.length + 1,
      name: page.section,
      item: buildUrl(SITE_URL, hubPage.slug)
    })
  }

  itemListElement.push({
    '@type': 'ListItem',
    position: itemListElement.length + 1,
    name: page.title,
    item: buildUrl(SITE_URL, page.slug)
  })

  return `<script type="application/ld+json" data-geo-breadcrumb>
    ${JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement
      },
      null,
      2
    )
      .split('\n')
      .join('\n    ')}
  </script>`
}
