#!/usr/bin/env node

/**
 * IndexNow 推送脚本
 *
 * 用途：把新增或更新过的网址主动推给 Bing / Yandex / Seznam / Naver，
 * 省掉在站长平台逐个提交。Google 不支持 IndexNow，仍需在 Search Console 手动提交。
 *
 * 用法：
 *   node scripts/indexnow-push.js                                   # 推送 sitemap 里 lastmod 为今天的文章
 *   node scripts/indexnow-push.js https://www.123170.xyz/article/x   # 推送指定网址
 *   node scripts/indexnow-push.js --dry-run                          # 只打印，不发请求
 */

const fs = require('fs')
const path = require('path')

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const SITE_URL = 'https://www.123170.xyz'
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS_PER_REQUEST = 10000

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const explicitUrls = args.filter(arg => !arg.startsWith('--'))

  const key = process.env.INDEXNOW_KEY || readKeyFromPublicDir()
  if (!key) {
    console.error('[indexnow] 未找到密钥文件，请确认 public/<key>.txt 存在')
    process.exit(1)
  }

  const urls = explicitUrls.length ? explicitUrls : collectTodaysUrls()
  if (!urls.length) {
    console.log('[indexnow] 今天没有新文章，跳过')
    return
  }

  const payload = {
    host: new URL(SITE_URL).host,
    key,
    keyLocation: `${SITE_URL}/${key}.txt`,
    urlList: urls.slice(0, MAX_URLS_PER_REQUEST)
  }

  if (dryRun) {
    console.log('[indexnow] dry-run，将推送', urls.length, '条')
    urls.forEach(url => console.log('  ', url))
    return
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  })

  // IndexNow 成功返回 200 或 202，正文可能为空
  if (response.status === 200 || response.status === 202) {
    console.log(`[indexnow] 推送成功 ${response.status}，共 ${urls.length} 条`)
    urls.forEach(url => console.log('  ', url))
    return
  }

  const body = await response.text()
  console.error(`[indexnow] 推送失败 ${response.status}: ${body.slice(0, 300)}`)
  process.exit(1)
}

function readKeyFromPublicDir() {
  if (!fs.existsSync(PUBLIC_DIR)) return ''

  const candidate = fs
    .readdirSync(PUBLIC_DIR)
    .find(name => {
      if (!/^[a-f0-9]{8,128}\.txt$/i.test(name)) return false
      const key = name.replace(/\.txt$/i, '')
      const content = fs.readFileSync(path.join(PUBLIC_DIR, name), 'utf8').trim()
      return content === key
    })

  return candidate ? candidate.replace(/\.txt$/i, '') : ''
}

function collectTodaysUrls() {
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml')
  if (!fs.existsSync(sitemapPath)) {
    console.warn('[indexnow] 未找到 public/sitemap.xml，请先运行 npm run sitemap:generate')
    return []
  }

  const today = new Date().toISOString().slice(0, 10)
  const xml = fs.readFileSync(sitemapPath, 'utf8')
  const entries = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(match => ({
    loc: (match[1].match(/<loc>([^<]+)<\/loc>/) || [])[1] || '',
    lastmod: (match[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || ''
  }))

  // 只推文章，分类/标签页变动不单独推，避免浪费配额
  return entries
    .filter(entry => entry.loc.includes('/article/') && entry.lastmod.startsWith(today))
    .map(entry => entry.loc)
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
