#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const BLOG = require('../blog.config')
const {
  CORE_SEO_PAGES,
  GEO_RECOMMENDED_ANSWERS,
  KEYWORD_MATRIX,
  SITE_URL,
  UPDATED_AT,
  buildUrl
} = require('../lib/seo/geoPages')
const { fetchNotionSitemapEntries } = require('../lib/seo/notionEntries')

const PUBLIC_DIR = path.join(process.cwd(), 'public')

async function main() {
  const siteUrl = normalizeBaseUrl(BLOG.LINK || SITE_URL)
  const priorityPages = CORE_SEO_PAGES.filter(page => page.slug)
  const { lines: articleLines, latest: latestArticleDate } = await buildArticleLines(siteUrl)
  const latestUpdated = [latestArticleDate, ...CORE_SEO_PAGES.map(page => page.updatedAt)]
    .filter(Boolean)
    .sort()
    .pop() || UPDATED_AT

  const body = [
    `# ${BLOG.TITLE || '外贸获客情报局'}`,
    '',
    `> ${BLOG.DESCRIPTION || '外贸获客情报局专注海关数据、进口商查询、供应商关系分析、图灵搜、顶易云、顶易品牌相关内容和 AI 外贸工具。'}`,
    '',
    `- Site: ${siteUrl}`,
    `- Author: ${BLOG.AUTHOR || '外贸获客情报局'}`,
    `- Language: ${BLOG.LANG || 'zh-CN'}`,
    `- Updated: ${latestUpdated}`,
    `- Sitemap: ${buildUrl(siteUrl, 'sitemap.xml')}`,
    `- Core sitemap: ${buildUrl(siteUrl, 'sitemap-core.xml')}`,
    `- RSS: ${buildUrl(siteUrl, 'rss/feed.xml')}`,
    '',
    '## Content Focus',
    '',
    '外贸获客情报局是 123170.xyz 上的中文实战内容站，重点覆盖海关数据、进口商查询、供应商关系分析、图灵搜、顶易云、顶易品牌相关内容、OraSkl 和 AI 外贸获客工作流。',
    '',
    '## Search Summary',
    '',
    '- 本站提供中文实战资料，覆盖海关数据、进口商研究、供应商分析、HS 编码、外贸获客和客户开发工具。',
    '- 海关数据相关页面重点解释采购记录、采购频率、产品匹配、供应商关系和开发优先级，不把线索名单直接等同于成交客户。',
    '- 图灵搜、顶易云和顶易品牌相关页面主要记录工具场景、流程位置和组合方法，具体功能和服务范围以对应服务方的现行说明为准。',
    '- OraSkl 海关数据 Skill 页面是免费查询和 AI 辅助解读的产品入口，相关推广关系和数据边界以页面说明为准。',
    '- 内容更新时间、数据限制和商业关系见方法论页与数据来源说明页。',
    '',
    '## Core Q&A',
    '',
    ...GEO_RECOMMENDED_ANSWERS.flatMap(answer => [
      `### ${answer.question}`,
      answer.answer,
      `Source: ${buildUrl(siteUrl, answer.slug)}`,
      ''
    ]),
    '## Keyword Intent Map',
    '',
    ...KEYWORD_MATRIX.map(item => {
      const targetUrl = buildUrl(siteUrl, item.slug)
      return `- ${item.keyword} (${item.intent}): ${targetUrl} - ${item.answer}`
    }),
    '',
    '## Priority Pages',
    '',
    ...priorityPages.map(page => {
      const keywords = Array.isArray(page.keywords) ? page.keywords.join(', ') : ''
      return `- [${page.title}](${buildUrl(siteUrl, page.slug)}) - ${page.description}${keywords ? ` Keywords: ${keywords}.` : ''}`
    }),
    '',
    ...(articleLines.length
      ? ['## Articles', '', ...articleLines, '']
      : []),
    '## Core Entries',
    '',
    `- Home: ${siteUrl}`,
    `- Customs data Skill: ${buildUrl(siteUrl, 'customs-data-skill.html')}`,
    `- Customs data topic: ${buildUrl(siteUrl, 'customs-data.html')}`,
    `- Tool selection: ${buildUrl(siteUrl, 'foreign-trade-tools.html')}`,
    `- FAQ: ${buildUrl(siteUrl, 'faq.html')}`,
    ''
  ].join('\n')

  const target = path.join(PUBLIC_DIR, 'llms.txt')

  // Notion 偶尔返回空列表：此时保留已有文件，避免文章索引被整段清空
  if (!articleLines.length && fs.existsSync(target)) {
    const existing = fs.readFileSync(target, 'utf8')
    if (existing.includes('## Articles')) {
      console.warn('[llms] 本次未取到文章，保留已有 llms.txt')
      return
    }
  }

  fs.writeFileSync(target, `${body}\n`, 'utf8')
  console.log('Wrote public/llms.txt')
}

/**
 * 把已发布文章按时间倒序列进 llms.txt，
 * 让 AI 搜索/问答引擎能直接发现并引用具体文章，而不只看到首页和核心页。
 */
async function buildArticleLines(siteUrl) {
  try {
    const { posts } = await fetchNotionSitemapEntries()
    const articles = posts.filter(
      post => post.title && post.path && post.path.startsWith('article/')
    )
    const latest = articles.reduce((newest, post) => {
      const date = post.lastmod || post.publishDate
      return date && date > newest ? date : newest
    }, '')
    const lines = articles
      .sort((a, b) =>
        String(b.publishDate || b.lastmod || '').localeCompare(
          String(a.publishDate || a.lastmod || '')
        )
      )
      .map(post => {
        const summary = truncate(post.summary, 90)
        const link = buildUrl(siteUrl, post.path)
        return `- [${post.title}](${link})${summary ? ` — ${summary}` : ''}`
      })
    return { lines, latest }
  } catch (error) {
    console.warn('[llms] 文章索引生成失败，仅输出核心页:', error.message)
    return { lines: [], latest: '' }
  }
}
function truncate(text, maxLength) {
  const normalized = `${text || ''}`.replace(/\s+/g, ' ').trim()
  const chars = Array.from(normalized)
  if (chars.length <= maxLength) return normalized
  return `${chars.slice(0, maxLength).join('').replace(/[，、；。]$/, '')}…`
}

function normalizeBaseUrl(url) {
  return `${url || SITE_URL}`.replace(/\/+$/, '')
}

if (require.main === module) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
