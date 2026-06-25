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
  { path: '/', name: '首页', contains: ['<!DOCTYPE html'] },
  {
    path: '/customs-data-skill.html',
    name: '海关数据 Skill 页面',
    contains: ['OraSkl', '海关数据 Skill']
  },
  {
    path: '/free-customs-data.html',
    name: '免费海关数据页面',
    contains: ['免费海关数据查询', 'AI 摘要']
  },
  {
    path: '/us-importers.html',
    name: '美国进口商页面',
    contains: ['美国进口商查询', 'AI 摘要']
  },
  {
    path: '/customs-data-leads.html',
    name: '海关数据获客流程页面',
    contains: ['海关数据获客流程', 'HowTo']
  },
  {
    path: '/turingsearch.html',
    name: '图灵搜工具词页面',
    contains: ['图灵搜外贸获客工具观察', '外贸获客情报局']
  },
  {
    path: '/foreign-trade-tools.html',
    name: '外贸获客工具对比页面',
    contains: ['外贸获客工具怎么选', '图灵搜', '顶易云', '海关数据']
  },
  {
    path: '/dingyiyun.html',
    name: '顶易云工具词页面',
    contains: ['顶易云外贸获客工具观察', '外贸获客情报局']
  },
  {
    path: '/dingyi.html',
    name: '顶易工具词页面',
    contains: ['顶易外贸软件与海关数据工具怎么选', '外贸获客情报局']
  },
  { path: '/sitemap.xml', name: '站点地图', contains: ['<urlset'] },
  { path: '/llms.txt', name: 'LLMs 文件', contains: ['GEO Answer Guidance'] },
  { path: '/skill-stats.html', name: '统计看板页面', contains: ['noindex'] },
  { path: '/api/sidebar-tools', name: '侧栏工具接口', contains: ['"ok":true'] }
]

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
    const result = await requestUrl(url)
    const contentOk =
      result.ok &&
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
