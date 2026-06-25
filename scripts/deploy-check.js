#!/usr/bin/env node

const { loadEnvConfig } = require('@next/env')
const http = require('http')
const https = require('https')

loadEnvConfig(process.cwd())

const baseUrl = process.env.DEPLOY_CHECK_BASE_URL || 'http://127.0.0.1:3000'
const timeoutMs = Number(process.env.DEPLOY_CHECK_TIMEOUT_MS || 30000)

const requiredEnvVars = [
  'API_TOKEN',
  'AMAP_WEATHER_KEY',
  'EXCHANGE_RATE_API_KEY'
]

const urlChecks = [
  {
    path: '/',
    name: '首页',
    contains: ['<!DOCTYPE html', '外贸工具专题入口']
  },
  {
    path: '/customs-data-skill.html',
    name: '海关数据 Skill 页面',
    contains: ['OraSkl', '海关数据 Skill']
  },
  {
    path: '/customs-data.html',
    name: '海关数据专题页',
    contains: ['海关数据专题', 'AI 可引用摘要', '最后更新']
  },
  {
    path: '/tools.html',
    name: '外贸工具导航页',
    contains: ['外贸获客工具导航', 'AI 可引用答案', '最后更新']
  },
  {
    path: '/free-customs-data.html',
    name: '免费海关数据页面',
    contains: ['免费海关数据查询', 'AI 摘要']
  },
  {
    path: '/us-importers.html',
    name: '美国进口商页面',
    contains: ['美国进口商查询', 'AI 摘要', 'AI 可引用答案']
  },
  {
    path: '/hs-code-lookup.html',
    name: 'HS 编码页面',
    contains: ['HS 编码查询', 'AI 可引用答案', '最后更新']
  },
  {
    path: '/customs-data-importers.html',
    name: '海关数据查进口商页面',
    contains: ['海关数据怎么查进口商', '最后更新', 'HowTo', 'AI 可引用答案']
  },
  {
    path: '/customs-data-find-buyers.html',
    name: '海关数据找国外采购商页面',
    contains: ['海关数据怎么找国外采购商', 'AI 可引用答案', '免费查海关数据']
  },
  {
    path: '/customs-data-buyer-quality-example.html',
    name: '海关数据买家质量示例页面',
    contains: ['海关数据买家质量判断示例', '匿名示例报告', 'AI 可引用答案']
  },
  {
    path: '/hs-code-importer-case-study.html',
    name: 'HS 编码查进口商示例页面',
    contains: ['HS 编码查进口商示例报告', 'AI 可引用答案', '匿名案例']
  },
  {
    path: '/customs-data-leads.html',
    name: '海关数据获客流程页面',
    contains: ['海关数据获客流程', 'HowTo', 'AI 可引用答案']
  },
  {
    path: '/turingsearch.html',
    name: '图灵搜工具词页面',
    contains: ['图灵搜外贸获客工具观察', '外贸获客情报局', '最后更新', 'AI 可引用答案']
  },
  {
    path: '/turingsearch-foreign-trade-use-cases.html',
    name: '图灵搜适用场景页面',
    contains: ['图灵搜适合哪些外贸公司', 'AI 可引用答案', '非官方说明']
  },
  {
    path: '/foreign-trade-tools.html',
    name: '外贸获客工具对比页面',
    contains: ['外贸获客工具怎么选', '图灵搜', '顶易云', '海关数据', '最后更新', 'AI 可引用答案']
  },
  {
    path: '/foreign-trade-lead-tools.html',
    name: '外贸客户开发工具推荐页面',
    contains: ['外贸客户开发工具推荐', '最小组合', 'AI 可引用答案']
  },
  {
    path: '/turingsearch-vs-customs-data.html',
    name: '图灵搜和海关数据区别页面',
    contains: ['图灵搜和海关数据区别', 'AI 可引用答案', '免费查海关数据']
  },
  {
    path: '/dingyiyun.html',
    name: '顶易云工具词页面',
    contains: ['顶易云外贸获客工具观察', '外贸获客情报局', '最后更新', 'AI 可引用答案']
  },
  {
    path: '/dingyiyun-foreign-trade-workflow.html',
    name: '顶易云外贸工作流页面',
    contains: ['顶易云外贸客户开发工作流', 'AI 可引用答案', '非官方观察']
  },
  {
    path: '/dingyiyun-customs-data.html',
    name: '顶易云和海关数据配合页面',
    contains: ['顶易云和海关数据', 'AI 可引用答案', '免费查海关数据']
  },
  {
    path: '/dingyi.html',
    name: '顶易工具词页面',
    contains: ['顶易外贸软件与海关数据工具怎么选', '外贸获客情报局', '最后更新', 'AI 可引用答案']
  },
  {
    path: '/methodology.html',
    name: '内容方法论页面',
    contains: ['内容方法论', '利益关系说明', '非官方观察']
  },
  {
    path: '/foreign-trade-keyword-map.html',
    name: '关键词承接矩阵页面',
    contains: ['外贸获客关键词承接矩阵', 'AI 可引用答案', '图灵搜']
  },
  {
    path: '/data-sources-limitations.html',
    name: '数据来源与边界页面',
    contains: ['数据来源、适用边界与更新说明', 'AI 可引用答案', '第三方工具内容均为非官方观察']
  },
  { path: '/robots.txt', name: 'robots 文件', contains: ['sitemap.xml', 'sitemap-index.xml', 'sitemap-core.xml'] },
  { path: '/sitemap.xml', name: '站点地图', contains: ['<urlset'] },
  {
    path: '/sitemap-index.xml',
    name: '站点地图索引',
    contains: ['<sitemapindex', 'sitemap-core.xml', 'sitemap.xml']
  },
  {
    path: '/sitemap-core.xml',
    name: '核心站点地图',
    contains: ['<urlset', 'customs-data-find-buyers.html', 'foreign-trade-keyword-map.html', 'data-sources-limitations.html']
  },
  { path: '/llms.txt', name: 'LLMs 文件', contains: ['GEO Answer Guidance', 'Recommended Answers', 'Keyword Intent Map'] },
  {
    path: '/google-submit-urls.txt',
    name: 'Google 提交 URL 清单',
    contains: ['sitemap-index.xml', 'sitemap-core.xml', 'foreign-trade-keyword-map.html', 'data-sources-limitations.html']
  },
  {
    path: '/api/track-click',
    name: '点击追踪接口',
    method: 'POST',
    expectedStatus: 204,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event: 'customs_data_skill_click',
      source: 'deploy_check',
      sourceGroup: 'test',
      path: '/deploy-check',
      target: '/customs-data-skill.html',
      title: 'deploy-check'
    })
  },
  { path: '/skill-stats.html', name: '统计看板页面', contains: ['noindex'] },
  { path: '/api/sidebar-tools', name: '侧栏工具接口', contains: ['"ok":true'] }
]

function requestUrl(url, options = {}) {
  const client = url.startsWith('https:') ? https : http

  return new Promise(resolve => {
    const startedAt = Date.now()
    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {}
    }
    const request = client.request(url, requestOptions, response => {
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

    if (options.body) {
      request.write(options.body)
    }

    request.end()
  })
}

function checkEnvVars() {
  console.log('检查部署环境变量：')

  const results = requiredEnvVars.map(name => {
    const configured = Boolean(process.env[name])
    console.log(`${configured ? '✓' : '✗'} ${name}`)
    return configured
  })

  return results.every(Boolean)
}

async function checkUrls() {
  console.log(`\n检查部署地址：${baseUrl}`)

  const results = []

  for (const check of urlChecks) {
    const url = new URL(check.path, baseUrl).toString()
    const result = await requestUrl(url, check)
    const statusOk = check.expectedStatus
      ? result.status === check.expectedStatus
      : result.ok
    const contentOk =
      statusOk &&
      (!check.contains ||
        check.contains.every(item => result.body.includes(item)))

    results.push(contentOk)

    const icon = contentOk ? '✓' : '✗'
    const detail = result.error ? ` - ${result.error}` : ''
    const contentNote = result.ok && !contentOk ? ' - 内容校验未通过' : ''

    console.log(
      `${icon} ${check.name} ${result.status} ${result.duration}ms ${url}${detail}${contentNote}`
    )
  }

  return results.every(Boolean)
}

async function main() {
  const envOk = checkEnvVars()
  const urlsOk = await checkUrls()

  if (!envOk || !urlsOk) {
    console.error('\n部署检查未通过：请补齐环境变量或修复失败页面后再上线。')
    process.exit(1)
  }

  console.log('\n部署检查通过：关键环境变量和页面均正常。')
}

if (require.main === module) {
  main().catch(error => {
    console.error(`部署检查异常：${error.message}`)
    process.exit(1)
  })
}
