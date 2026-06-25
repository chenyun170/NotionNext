#!/usr/bin/env node

const http = require('http')
const https = require('https')

const baseUrl = process.env.SEO_CHECK_BASE_URL || 'https://www.123170.xyz'
const timeoutMs = Number(process.env.SEO_CHECK_TIMEOUT_MS || 20000)

const checks = [
  {
    path: '/robots.txt',
    name: 'robots.txt',
    contains: [
      'Sitemap: https://www.123170.xyz/sitemap.xml',
      'sitemap-index.xml',
      'sitemap-core.xml'
    ]
  },
  {
    path: '/sitemap-index.xml',
    name: 'sitemap 索引',
    contains: ['<sitemapindex', 'sitemap-core.xml', 'sitemap.xml']
  },
  {
    path: '/sitemap.xml',
    name: '主 sitemap',
    contains: ['<urlset', 'customs-data-importers.html', 'foreign-trade-tools.html']
  },
  {
    path: '/sitemap-core.xml',
    name: '核心 sitemap',
    contains: ['<urlset', 'turingsearch-vs-customs-data.html', 'methodology.html']
  },
  {
    path: '/llms.txt',
    name: 'LLMs/GEO 文件',
    contains: ['Recommended Answers', '图灵搜和海关数据有什么区别', '内容方法论']
  },
  {
    path: '/google-submit-urls.txt',
    name: 'Google 提交 URL 清单',
    contains: [
      'customs-data-skill.html',
      'sitemap-index.xml',
      'sitemap-core.xml',
      'foreign-trade-lead-tools.html'
    ]
  },
  {
    path: '/customs-data.html',
    name: '海关数据专题',
    contains: ['AI 可引用摘要', '最后更新']
  },
  {
    path: '/customs-data-importers.html',
    name: '海关数据查进口商',
    contains: ['AI 可引用答案', '免费查海关数据']
  },
  {
    path: '/foreign-trade-lead-tools.html',
    name: '外贸客户开发工具推荐',
    contains: ['外贸客户开发工具推荐', '最小组合']
  },
  {
    path: '/turingsearch-vs-customs-data.html',
    name: '图灵搜和海关数据区别',
    contains: ['图灵搜和海关数据区别', 'AI 可引用答案']
  },
  {
    path: '/dingyiyun-customs-data.html',
    name: '顶易云和海关数据配合',
    contains: ['顶易云和海关数据', 'AI 可引用答案']
  },
  {
    path: '/methodology.html',
    name: '内容方法论',
    contains: ['内容方法论', '利益关系说明']
  }
]

async function main() {
  console.log(`SEO health check: ${baseUrl}`)

  const results = []
  for (const check of checks) {
    const url = new URL(check.path, baseUrl).toString()
    const result = await requestUrl(url)
    const contentOk =
      result.ok && check.contains.every(item => result.body.includes(item))

    results.push(contentOk)

    const icon = contentOk ? '✓' : '✗'
    const detail = result.error ? ` - ${result.error}` : ''
    const contentNote = result.ok && !contentOk ? ' - 内容校验未通过' : ''
    console.log(`${icon} ${check.name} ${result.status} ${result.duration}ms ${url}${detail}${contentNote}`)
  }

  const failed = results.filter(Boolean).length !== results.length
  if (failed) {
    console.error('\nSEO 健康检查未通过：请先修复失败项，再去 Search Console 重新提交 sitemap 和核心 URL。')
    process.exit(1)
  }

  console.log('\nSEO 健康检查通过。下一步：在 Google Search Console 提交 sitemap-index.xml、sitemap.xml、sitemap-core.xml，并按 google-submit-urls.txt 检查核心 URL。')
}

function requestUrl(url) {
  const client = url.startsWith('https:') ? https : http

  return new Promise(resolve => {
    const startedAt = Date.now()
    const request = client.get(url, response => {
      const chunks = []

      response.on('data', chunk => chunks.push(chunk))
      response.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')
        resolve({
          body,
          ok: response.statusCode >= 200 && response.statusCode < 400,
          status: response.statusCode,
          duration: Date.now() - startedAt
        })
      })
    })

    request.on('error', error => {
      resolve({
        body: '',
        ok: false,
        status: 'ERROR',
        duration: Date.now() - startedAt,
        error: error.message
      })
    })

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`请求超时 ${timeoutMs}ms`))
    })
  })
}

if (require.main === module) {
  main().catch(error => {
    console.error(`SEO 健康检查异常：${error.message}`)
    process.exit(1)
  })
}
