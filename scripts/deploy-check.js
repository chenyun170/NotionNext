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
    timeoutMs: 60000,
    contains: ['<!DOCTYPE html', '外贸获客情报局', '海关数据与外贸获客实战情报站', '海关数据免费查询'],
    disallowHeaders: ['access-control-allow-origin']
  },
  {
    path: '/customs-data-skill.html',
    name: '海关数据 Skill 页面',
    contains: ['OraSkl', '海关数据 Skill']
  },
  {
    path: '/customs-data.html',
    name: '海关数据专题页',
    contains: ['海关数据专题', '核心摘要', '最后更新']
  },
  {
    path: '/tools.html',
    name: '外贸工具导航页',
    contains: ['外贸获客工具导航', '核心结论', '最后更新']
  },
  {
    path: '/free-customs-data.html',
    name: '免费海关数据页面',
    contains: ['免费海关数据查询', '核心摘要']
  },
  {
    path: '/us-importers.html',
    name: '美国进口商页面',
    contains: ['美国进口商查询', '核心摘要', '核心结论']
  },
  {
    path: '/hs-code-lookup.html',
    name: 'HS 编码页面',
    contains: ['HS 编码查询', '核心结论', '最后更新']
  },
  {
    path: '/customs-data-importers.html',
    name: '海关数据查进口商页面',
    contains: ['海关数据怎么查进口商', '最后更新', 'HowTo', '核心结论']
  },
  {
    path: '/customs-data-find-buyers.html',
    name: '海关数据找国外采购商页面',
    contains: ['海关数据怎么找国外采购商', '核心结论', '免费查海关数据']
  },
  {
    path: '/customs-data-buyer-quality-example.html',
    name: '海关数据买家质量示例页面',
    contains: ['海关数据买家质量判断示例', '匿名示例报告', '核心结论']
  },
  {
    path: '/hs-code-importer-case-study.html',
    name: 'HS 编码查进口商示例页面',
    contains: ['HS 编码查进口商示例报告', '核心结论', '匿名案例']
  },
  {
    path: '/customs-data-leads.html',
    name: '海关数据获客流程页面',
    contains: ['海关数据获客流程', 'HowTo', '核心结论']
  },
  {
    path: '/turingsearch.html',
    name: '图灵搜工具词页面',
    contains: ['图灵搜外贸获客工具观察', '外贸获客情报局', '最后更新', '核心结论']
  },
  {
    path: '/turingsearch-foreign-trade-use-cases.html',
    name: '图灵搜适用场景页面',
    contains: ['图灵搜适合哪些外贸公司', '核心结论', '工具场景页']
  },
  {
    path: '/foreign-trade-tools.html',
    name: '外贸获客工具对比页面',
    contains: ['外贸获客工具怎么选', '图灵搜', '顶易云', '海关数据', '最后更新', '核心结论']
  },
  {
    path: '/foreign-trade-lead-tools.html',
    name: '外贸客户开发工具推荐页面',
    contains: ['外贸客户开发工具推荐', '最小组合', '核心结论']
  },
  {
    path: '/turingsearch-vs-customs-data.html',
    name: '图灵搜和海关数据区别页面',
    contains: ['图灵搜和海关数据区别', '核心结论', '免费查海关数据']
  },
  {
    path: '/dingyiyun.html',
    name: '顶易云工具词页面',
    contains: ['顶易云外贸获客工具观察', '外贸获客情报局', '最后更新', '核心结论']
  },
  {
    path: '/dingyiyun-foreign-trade-workflow.html',
    name: '顶易云外贸工作流页面',
    contains: ['顶易云外贸客户开发工作流', '核心结论', '工具工作流页']
  },
  {
    path: '/dingyiyun-customs-data.html',
    name: '顶易云和海关数据配合页面',
    contains: ['顶易云和海关数据', '核心结论', '免费查海关数据']
  },
  {
    path: '/dingyi.html',
    name: '顶易品牌词页面',
    contains: ['顶易品牌相关外贸软件与海关数据怎么配合', '外贸获客情报局', '最后更新', '核心结论']
  },
  {
    path: '/methodology.html',
    name: '内容方法论页面',
    contains: ['内容方法论', '利益关系说明', '使用场景分析']
  },
  {
    path: '/foreign-trade-keyword-map.html',
    name: '关键词承接矩阵页面',
    contains: ['外贸获客关键词承接矩阵', '核心结论', '图灵搜']
  },
  {
    path: '/data-sources-limitations.html',
    name: '数据来源与边界页面',
    contains: ['数据来源、适用边界与更新说明', '核心结论', '第三方工具内容只做场景说明']
  },
  { path: '/robots.txt', name: 'robots 文件', contains: ['sitemap.xml', 'sitemap-index.xml', 'sitemap-core.xml', 'sitemap.txt'] },
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
  {
    path: '/sitemap.txt',
    name: 'txt 站点地图',
    contains: ['https://www.123170.xyz', 'customs-data-find-buyers.html', 'foreign-trade-keyword-map.html']
  },
  { path: '/llms.txt', name: 'LLMs 文件', contains: ['GEO Answer Guidance', 'Recommended Answers', 'Keyword Intent Map'] },
  {
    path: '/google-submit-urls.txt',
    name: 'Google 提交 URL 清单',
    contains: ['sitemap-index.xml', 'sitemap-core.xml', 'sitemap.txt', 'foreign-trade-keyword-map.html', 'data-sources-limitations.html']
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
  {
    path: '/api/track-click',
    name: '外链追踪接口',
    method: 'POST',
    expectedStatus: 204,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event: 'outbound_tool_click',
      source: 'deploy_check_activity',
      sourceGroup: 'test',
      path: '/deploy-check',
      target: 'https://h.topeasysoft.com/20260618tls/index.html?i=BB54F6',
      title: 'deploy-check',
      tool: 'turingsearch'
    })
  },
  {
    path: '/api/track-click',
    name: '互动追踪接口',
    method: 'POST',
    expectedStatus: 204,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event: 'site_interaction',
      source: 'deploy_check_interaction',
      sourceGroup: 'test',
      path: '/deploy-check',
      target: '/deploy-check',
      title: 'deploy-check',
      action: 'copy_wechat'
    })
  },
  {
    path: '/api/track-click',
    name: '互动追踪脏数据拦截',
    method: 'POST',
    expectedStatus: 400,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event: 'site_interaction',
      source: 'deploy_check_interaction',
      sourceGroup: 'test',
      path: '/deploy-check',
      target: '/deploy-check',
      title: 'deploy-check',
      action: 'unknown_action'
    })
  },
  {
    path: '/api/diagnose',
    name: '诊断接口长度保护',
    method: 'POST',
    expectedStatus: 413,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      privacyConfirmed: true,
      form: {
        letterContent: 'x'.repeat(12050)
      }
    }),
    disallowHeaders: ['access-control-allow-origin']
  },
  {
    path: '/api/diagnose',
    name: '诊断接口隐私确认保护',
    method: 'POST',
    expectedStatus: 400,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      form: {
        letterContent: 'This is a deploy-check sample email with enough length to pass the minimum content validation.'
      }
    }),
    contains: ['请先确认已移除敏感信息']
  },
  {
    path: '/diagnose',
    name: '诊断页隐私提示',
    contains: ['隐私提示', '第三方 AI 诊断接口', '密码', '报价底价', '客户隐私']
  },
  { path: '/skill-stats.html', name: '统计看板页面', contains: ['noindex'] },
  { path: '/api/sidebar-tools', name: '侧栏工具接口', contains: ['"ok":true'] }
]

function requestUrl(url, options = {}) {
  const client = url.startsWith('https:') ? https : http

  return new Promise(resolve => {
    const startedAt = Date.now()
    const requestTimeoutMs = options.timeoutMs || timeoutMs
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
          headers: response.headers,
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

    request.setTimeout(requestTimeoutMs, () => {
      request.destroy(new Error(`请求超时 ${requestTimeoutMs}ms`))
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
  let connectionRefusedCount = 0

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
    const headersOk =
      statusOk &&
      (!check.disallowHeaders ||
        check.disallowHeaders.every(header => result.headers?.[header] === undefined))

    const checkOk = contentOk && headersOk
    results.push(checkOk)
    if (String(result.error || '').includes('ECONNREFUSED')) {
      connectionRefusedCount += 1
    }

    const icon = checkOk ? '✓' : '✗'
    const detail = result.error ? ` - ${result.error}` : ''
    const contentNote = result.ok && !contentOk ? ' - 内容校验未通过' : ''
    const headerNote = statusOk && !headersOk ? ' - 响应头校验未通过' : ''

    console.log(
      `${icon} ${check.name} ${result.status} ${result.duration}ms ${url}${detail}${contentNote}${headerNote}`
    )
  }

  return {
    ok: results.every(Boolean),
    failedCount: results.filter(item => !item).length,
    connectionRefusedCount
  }
}

async function main() {
  const envOk = checkEnvVars()
  const urlResult = await checkUrls()

  if (!envOk || !urlResult.ok) {
    if (urlResult.connectionRefusedCount > 0) {
      console.error(
        `\n部署检查未通过：${baseUrl} 无法连接。请先运行 npm run dev，确认本地 3000 服务启动后再执行 npm run deploy-check。`
      )
    } else {
      console.error(
        `\n部署检查未通过：${urlResult.failedCount} 个检查项失败。请补齐环境变量或修复失败页面后再上线。`
      )
    }
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
