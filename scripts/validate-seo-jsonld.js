#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const htmlPages = [
  'about.html',
  'customs-data.html',
  'customs-data-skill.html',
  'customs-data-importers.html',
  'customs-data-leads.html',
  'free-customs-data.html',
  'us-importers.html',
  'hs-code-lookup.html',
  'supplier-analysis.html',
  'tools.html',
  'foreign-trade-tools.html',
  'foreign-trade-lead-tools.html',
  'turingsearch.html',
  'turingsearch-vs-customs-data.html',
  'dingyiyun.html',
  'dingyiyun-customs-data.html',
  'dingyi.html',
  'oraskl.html',
  'faq.html',
  'methodology.html'
]

const publicDir = path.join(process.cwd(), 'public')
const jsonLdPattern =
  /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

let failed = false

for (const page of htmlPages) {
  const filePath = path.join(publicDir, page)

  if (!fs.existsSync(filePath)) {
    failed = true
    console.error(`✗ ${page} 文件不存在`)
    continue
  }

  const html = fs.readFileSync(filePath, 'utf8')
  const blocks = Array.from(html.matchAll(jsonLdPattern))

  if (!blocks.length) {
    failed = true
    console.error(`✗ ${page} 缺少 JSON-LD`)
    continue
  }

  blocks.forEach((block, index) => {
    const rawJson = block[1].trim()

    try {
      const parsed = JSON.parse(rawJson)
      if (!hasSchemaContext(parsed)) {
        failed = true
        console.error(`✗ ${page} JSON-LD #${index + 1} 缺少 @context`)
        return
      }
      console.log(`✓ ${page} JSON-LD #${index + 1}`)
    } catch (error) {
      failed = true
      console.error(`✗ ${page} JSON-LD #${index + 1} 无法解析：${error.message}`)
    }
  })
}

if (failed) {
  console.error('\nJSON-LD 校验未通过。')
  process.exit(1)
}

console.log('\nJSON-LD 校验通过。')

function hasSchemaContext(value) {
  if (!value) {
    return false
  }

  if (Array.isArray(value)) {
    return value.some(hasSchemaContext)
  }

  if (typeof value === 'object') {
    return Boolean(value['@context']) || hasSchemaContext(value['@graph'])
  }

  return false
}
