#!/usr/bin/env node

const http = require('http')
const https = require('https')

const baseUrl = process.env.SEO_CHECK_BASE_URL || 'https://www.123170.xyz'
const timeoutMs = Number(process.env.SEO_CHECK_TIMEOUT_MS || 20000)
const maxAttempts = Number(process.env.SEO_CHECK_MAX_ATTEMPTS || 3)

const checks = [
  {
    path: '/robots.txt',
    name: 'robots.txt',
    contains: [
      'Sitemap: https://www.123170.xyz/sitemap.xml',
      'sitemap-index.xml'
    ]
  },
  {
    path: '/sitemap-index.xml',
    name: 'sitemap 索引',
    contains: ['<sitemapindex', 'sitemap.xml']
  },
  {
    path: '/sitemap.xml',
    name: '主 sitemap',
    contains: ['<urlset', 'customs-data-find-buyers.html', 'foreign-trade-keyword-map.html']
  },
  {
    path: '/sitemap-core.xml',
    name: '核心 sitemap',
    contains: ['<urlset', 'turingsearch-foreign-trade-use-cases.html', 'data-sources-limitations.html']
  },
  {
    path: '/sitemap.txt',
    name: 'txt sitemap',
    contains: ['https://www.123170.xyz', 'customs-data-find-buyers.html', 'foreign-trade-keyword-map.html']
  },
  {
    path: '/llms.txt',
    name: 'LLMs/GEO 文件',
    contains: ['Search Summary', 'Core Q&A', '图灵搜适合哪些外贸公司']
  },
  {
    path: '/google-submit-urls.txt',
    name: 'Google 提交 URL 清单',
    contains: [
      'customs-data-skill.html',
      'sitemap.xml',
      'foreign-trade-keyword-map.html'
    ]
  },
  {
    path: '/customs-data.html',
    name: '海关数据专题',
    contains: ['核心摘要', '最后更新']
  },
  {
    path: '/customs-data-importers.html',
    name: '海关数据查进口商',
    contains: ['核心结论', '免费查海关数据']
  },
  {
    path: '/customs-data-find-buyers.html',
    name: '海关数据找国外采购商',
    contains: ['海关数据怎么找国外采购商', '核心结论']
  },
  {
    path: '/customs-data-buyer-quality-example.html',
    name: '海关数据买家质量示例',
    contains: ['海关数据买家质量判断示例', '核心结论']
  },
  {
    path: '/hs-code-importer-case-study.html',
    name: 'HS 编码查进口商示例',
    contains: ['HS 编码查进口商示例报告', '核心结论']
  },
  {
    path: '/foreign-trade-lead-tools.html',
    name: '外贸客户开发工具推荐',
    contains: ['外贸客户开发工具推荐', '最小组合']
  },
  {
    path: '/turingsearch-vs-customs-data.html',
    name: '图灵搜和海关数据区别',
    contains: ['图灵搜和海关数据区别', '核心结论']
  },
  {
    path: '/turingsearch-foreign-trade-use-cases.html',
    name: '图灵搜适用场景',
    contains: ['图灵搜适合哪些外贸公司', '核心结论']
  },
  {
    path: '/dingyiyun-customs-data.html',
    name: '顶易云和海关数据配合',
    contains: ['顶易云和海关数据', '核心结论']
  },
  {
    path: '/dingyiyun-foreign-trade-workflow.html',
    name: '顶易云外贸工作流',
    contains: ['顶易云外贸客户开发工作流', '核心结论']
  },
  {
    path: '/methodology.html',
    name: '内容方法论',
    contains: ['内容方法论', '利益关系说明']
  },
  {
    path: '/foreign-trade-keyword-map.html',
    name: '关键词承接矩阵',
    contains: ['外贸获客关键词承接矩阵', '核心结论']
  },
  {
    path: '/data-sources-limitations.html',
    name: '数据来源与边界',
    contains: ['数据来源、适用边界与更新说明', '核心结论']
  }
]

async function main() {
  console.log(`SEO health check: ${baseUrl}`)

  const results = []
  for (const check of checks) {
    const url = new URL(check.path, baseUrl).toString()
    const result = await requestUrl(url)
    const expectedHost = baseUrl.replace(/\/+$/, '')
    const contentOk =
      result.ok &&
      check.contains.every(item =>
        result.body.includes(item.replace('https://www.123170.xyz', expectedHost))
      )

    const networkWarning = !result.ok && result.status === 'ERROR'
    results.push(networkWarning ? null : contentOk)

    const icon = contentOk ? '✓' : networkWarning ? '!' : '✗'
    const retryNote = result.attempts > 1 ? `，重试 ${result.attempts - 1} 次` : ''
    const detail = result.error ? ` - ${result.error}` : ''
    const contentNote = result.ok && !contentOk ? ' - 内容校验未通过' : ''
    console.log(`${icon} ${check.name} ${result.status} ${result.duration}ms${retryNote} ${url}${detail}${contentNote}`)
  }

  const failed = results.some(result => result === false)
  const warnings = results.filter(result => result === null).length
  if (failed) {
    console.error('\nSEO 健康检查发现 HTTP 或内容错误，请修复后再提交 sitemap。')
    process.exit(1)
  }

  if (warnings) {
    console.warn(`\nSEO 健康检查有 ${warnings} 项网络结果未能确认。其余已访问项目通过。请从可访问公网的环境复测。`)
    return
  }

  console.log('\nSEO 健康检查通过。下一步：在 Google Search Console 提交 sitemap.xml，并在 sitemap-index.xml 中确认主表可抓取。')
}

async function requestUrl(url) {
  let lastResult

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await requestOnce(url)
    result.attempts = attempt
    lastResult = result

    if (result.ok || attempt === maxAttempts) return result
    await new Promise(resolve => setTimeout(resolve, Math.min(250 * attempt, 1000)))
  }

  return lastResult
}

function requestOnce(url) {
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
