#!/usr/bin/env node

const http = require('http')
const https = require('https')

const baseUrl = process.env.HEALTH_CHECK_BASE_URL || 'http://127.0.0.1:3000'
const timeoutMs = Number(process.env.HEALTH_CHECK_TIMEOUT_MS || 15000)

const checks = [
  { path: '/', name: '首页' },
  { path: '/customs-data-skill.html', name: '海关数据 Skill 页面' },
  { path: '/article/waimao-qiantu', name: '文章详情页' }
]

function requestUrl(url) {
  const client = url.startsWith('https:') ? https : http

  return new Promise(resolve => {
    const startedAt = Date.now()
    const request = client.get(url, response => {
      response.resume()
      response.on('end', () => {
        resolve({
          ok: response.statusCode >= 200 && response.statusCode < 400,
          status: response.statusCode,
          duration: Date.now() - startedAt
        })
      })
    })

    request.on('error', error => {
      resolve({
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

async function main() {
  console.log(`检查本地站点：${baseUrl}`)

  const results = []

  for (const check of checks) {
    const url = new URL(check.path, baseUrl).toString()
    const result = await requestUrl(url)
    results.push({ ...check, url, ...result })

    const icon = result.ok ? '✓' : '✗'
    const detail = result.error ? ` - ${result.error}` : ''
    console.log(
      `${icon} ${check.name} ${result.status} ${result.duration}ms ${url}${detail}`
    )
  }

  const failed = results.filter(result => !result.ok)

  if (failed.length > 0) {
    console.error('\n健康检查未通过：请确认 npm run dev 已启动，且页面没有 404/500。')
    process.exit(1)
  }

  console.log('\n健康检查通过：关键页面都能正常访问。')
}

if (require.main === module) {
  main().catch(error => {
    console.error(`健康检查异常：${error.message}`)
    process.exit(1)
  })
}
