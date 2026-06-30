#!/usr/bin/env node

const { loadEnvConfig } = require('@next/env')
const http = require('http')
const https = require('https')

loadEnvConfig(process.cwd())

const baseUrl = trimTrailingSlash(
  process.env.WARMUP_BASE_URL ||
    process.env.DEPLOY_CHECK_BASE_URL ||
    'http://127.0.0.1:3000'
)
const timeoutMs = readPositiveInteger('WARMUP_TIMEOUT_MS', 60000)
const concurrency = readPositiveInteger('WARMUP_CONCURRENCY', 3)
const overridePaths = parsePathList(process.env.WARMUP_PATHS)
const extraPaths = parsePathList(process.env.WARMUP_EXTRA_PATHS)

const defaultPaths = [
  '/',
  '/customs-data-skill.html',
  '/customs-data.html',
  '/tools.html',
  '/free-customs-data.html',
  '/customs-data-importers.html',
  '/customs-data-find-buyers.html',
  '/foreign-trade-tools.html',
  '/foreign-trade-lead-tools.html',
  '/turingsearch-vs-customs-data.html',
  '/dingyiyun-customs-data.html',
  '/category/海关数据',
  '/category/外贸获客',
  '/tag/海关数据',
  '/tag/外贸',
  '/page/2'
]

async function main() {
  const paths = uniquePaths(
    overridePaths.length > 0 ? overridePaths : [...defaultPaths, ...extraPaths]
  )
  console.log(`ISR 预热地址：${baseUrl}`)
  console.log(`预热路径数：${paths.length}，并发：${concurrency}`)
  if (overridePaths.length > 0) {
    console.log('预热模式：使用 WARMUP_PATHS 覆盖默认清单')
  }

  const results = await runWithConcurrency(paths, concurrency, warmupPath)
  const failed = results.filter(result => !result.ok)

  results.forEach(result => {
    const icon = result.ok ? '✓' : '✗'
    const detail = result.error ? ` - ${result.error}` : ''
    console.log(
      `${icon} ${result.status} ${result.duration}ms ${result.path}${detail}`
    )
  })

  if (failed.length > 0) {
    console.error(`\nISR 预热失败：${failed.length} 个路径未通过。`)
    process.exit(1)
  }

  console.log('\nISR 预热完成：核心路径均可访问。')
}

async function warmupPath(path) {
  const startedAt = Date.now()
  const url = toUrl(path)

  try {
    const result = await requestUrl(url)
    return {
      path,
      status: result.status,
      duration: Date.now() - startedAt,
      ok: result.status >= 200 && result.status < 400
    }
  } catch (error) {
    return {
      path,
      status: 'ERROR',
      duration: Date.now() - startedAt,
      ok: false,
      error: error.message
    }
  }
}

function requestUrl(url) {
  const client = url.startsWith('https:') ? https : http

  return new Promise((resolve, reject) => {
    const request = client.get(url, response => {
      response.resume()
      response.on('end', () => {
        resolve({ status: response.statusCode || 0 })
      })
    })

    request.setTimeout(timeoutMs, () => {
      request.destroy(new Error(`请求超时 ${timeoutMs}ms`))
    })

    request.on('error', reject)
  })
}

async function runWithConcurrency(items, limit, worker) {
  const results = []
  let nextIndex = 0

  const workers = Array.from({ length: Math.min(limit, items.length) }).map(
    async () => {
      while (nextIndex < items.length) {
        const currentIndex = nextIndex
        nextIndex += 1
        results[currentIndex] = await worker(items[currentIndex])
      }
    }
  )

  await Promise.all(workers)
  return results
}

function toUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return encodeURI(path)
  }

  return encodeURI(`${baseUrl}${path.startsWith('/') ? path : `/${path}`}`)
}

function uniquePaths(paths) {
  return Array.from(new Set(paths.map(normalizePath).filter(Boolean)))
}

function parsePathList(value) {
  return String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizePath(path) {
  const value = String(path || '').trim()

  if (!value) {
    return ''
  }

  if (/^https?:\/\//i.test(value)) {
    return value
  }

  return value.startsWith('/') ? value : `/${value}`
}

function readPositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

main().catch(error => {
  console.error(`ISR 预热异常：${error.message}`)
  process.exit(1)
})
