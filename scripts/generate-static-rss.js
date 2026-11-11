#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { Feed } = require('feed')

const BLOG = require('../blog.config')
const { SITE_URL } = require('../lib/seo/geoPages')
const { fetchNotionSitemapEntries } = require('../lib/seo/notionEntries')

const PUBLIC_DIR = path.join(process.cwd(), 'public')
const POST_URL_PREFIX = `${BLOG.POST_URL_PREFIX ?? 'article'}`.replace(/^\/+|\/+$/g, '')

async function main() {
  const siteUrl = normalizeBaseUrl(BLOG.LINK || SITE_URL)
  const { posts } = await fetchNotionSitemapEntries()
  const rssPosts = posts.filter(post => (
    POST_URL_PREFIX &&
    post.path?.startsWith(`${POST_URL_PREFIX}/`) &&
    post.title
  ))

  const feed = new Feed({
    title: BLOG.TITLE || '外贸获客情报局',
    description: BLOG.DESCRIPTION || '外贸获客情报局专注海关数据与外贸获客。',
    id: siteUrl,
    link: siteUrl,
    language: BLOG.LANG || 'zh-CN',
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${BLOG.AUTHOR || '外贸获客情报局'}`,
    author: {
      name: BLOG.AUTHOR || '外贸获客情报局',
      link: siteUrl
    }
  })

  rssPosts.forEach(post => {
    const link = `${siteUrl}/${post.path}`
    feed.addItem({
      title: post.title,
      id: link,
      link,
      description: post.summary || '',
      date: parseDate(post.publishDate || post.lastmod)
    })
  })

  fs.mkdirSync(path.join(PUBLIC_DIR, 'rss'), { recursive: true })
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss', 'feed.xml'), feed.rss2(), 'utf8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss', 'atom.xml'), feed.atom1(), 'utf8')
  fs.writeFileSync(path.join(PUBLIC_DIR, 'rss', 'feed.json'), feed.json1(), 'utf8')
  console.log(`Wrote public/rss/feed.xml (${rssPosts.length} posts)`)
}

function normalizeBaseUrl(url) {
  return `${url || SITE_URL}`.replace(/\/+$/, '')
}

function parseDate(value) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date() : date
}

main().catch(error => {
  console.warn('[rss] 生成失败，跳过:', error.message)
})
