/**
 * 构建期从 Notion 读取可收录的页面列表，供 sitemap 生成脚本使用。
 * 说明：这里只做最轻量的属性解析，不渲染正文，避免拖慢构建。
 */
const { NotionAPI } = require('notion-client')
const { idToUuid, getTextContent, getDateValue } = require('notion-utils')
const BLOG = require('../../blog.config')

const POST_URL_PREFIX = `${BLOG.POST_URL_PREFIX ?? 'article'}`.replace(/^\/+|\/+$/g, '')

const LOW_VALUE_SITEMAP_TERMS = new Set([
  '活动',
  '工具',
  '推荐',
  '开发',
  '顶易软件',
  'facebooks找开客户'
])

/**
 * Notion 新版接口会在 block/collection/value 外层多包一层，这里统一剥掉
 */
function unwrap(entry) {
  let current = entry
  for (let i = 0; i < 5; i++) {
    if (!current || typeof current !== 'object') return null
    if (current.type || current.properties || current.schema) return current
    if (current.value && typeof current.value === 'object') {
      current = current.value
      continue
    }
    return current
  }
  return current
}

function toDateString(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10)
}

async function fetchSiteRows() {
  const pageIds = `${BLOG.NOTION_PAGE_ID || ''}`.split(',').map(item => item.trim()).filter(Boolean)
  const rootPageId = pageIds[0]
  if (!rootPageId) return []

  const api = new NotionAPI({ apiBaseUrl: BLOG.API_BASE_URL })
  const recordMap = await api.getPage(rootPageId)
  const rootId = idToUuid(rootPageId)
  const root = unwrap(recordMap.block[rootId])
  if (!root || !root.collection_id) {
    throw new Error(`Notion 根页面 ${rootPageId} 不是数据库`)
  }

  const collection = unwrap(recordMap.collection[root.collection_id]) || {}
  const schema = collection.schema || {}
  const views = recordMap.collection_view || {}
  const viewIds = Array.isArray(root.view_ids) ? root.view_ids : []

  // 站点排序视图优先，取不到再回退到任意视图
  const preferredViewId = viewIds[Number(BLOG.NOTION_INDEX) || 0] || viewIds[0]
  const preferredView = unwrap(views[preferredViewId])
  const rowIds = []
  const seen = new Set()
  const pushIds = ids => {
    if (!Array.isArray(ids)) return
    ids.forEach(id => {
      if (id && !seen.has(id)) {
        seen.add(id)
        rowIds.push(id)
      }
    })
  }
  pushIds(preferredView && preferredView.page_sort)
  if (rowIds.length === 0) {
    Object.values(views).forEach(entry => {
      const view = unwrap(entry)
      pushIds(view && view.page_sort)
    })
  }

  // 通过 API 新建的页面不会写入 page_sort，这里补一次 collection 查询
  if (preferredView) {
    try {
      const queried = await api.getCollectionData(
        root.collection_id,
        preferredViewId,
        preferredView,
        { limit: 1000, spaceId: root.space_id }
      )
      pushIds(
        queried?.result?.blockIds ||
          queried?.result?.reducerResults?.collection_group_results?.blockIds
      )
    } catch (error) {
      console.warn('[sitemap] collection 查询失败，仅使用 page_sort:', error.message)
    }
  }

  const blocks = recordMap.block || {}
  const missingIds = rowIds.filter(id => !unwrap(blocks[id]))
  for (let i = 0; i < missingIds.length; i += 100) {
    try {
      const res = await api.getBlocks(missingIds.slice(i, i + 100))
      Object.assign(blocks, (res && res.recordMap && res.recordMap.block) || {})
    } catch (error) {
      console.warn('[sitemap] 补拉 Notion 块失败，跳过该批次:', error.message)
    }
  }

  const rows = []
  rowIds.forEach(id => {
    const value = unwrap(blocks[id])
    if (!value || !value.properties) return

    const props = {}
    Object.entries(value.properties).forEach(([key, val]) => {
      const field = schema[key]
      if (!field) return
      if (field.type === 'date') {
        const dateValue = getDateValue(val)
        props[field.name] = dateValue && dateValue.start_date
      } else {
        props[field.name] = getTextContent(val)
      }
    })

    if (!props.slug) return
    rows.push({
      slug: props.slug,
      title: props.title,
      summary: props.summary,
      type: props.type,
      status: props.status,
      category: props.category,
      tags: props.tags,
      password: props.password,
      publishDate: props.date,
      lastEdited: toDateString(value.last_edited_time) || toDateString(props.date)
    })
  })

  return rows
}

function buildPostPath(slug) {
  if (/^https?:\/\//i.test(slug)) return null
  const normalized = `${slug}`.replace(/^\/+/, '')
  if (POST_URL_PREFIX && !normalized.startsWith(`${POST_URL_PREFIX}/`)) {
    return `${POST_URL_PREFIX}/${normalized}`
  }
  return normalized
}

async function fetchNotionSitemapEntries() {
  const rows = await fetchSiteRows()
  const posts = []
  const tagSet = new Set()
  const categorySet = new Set()

  rows.forEach(row => {
    if (row.status !== 'Published') return
    if (row.password) return

    if (row.type === 'Post') {
      const path = buildPostPath(row.slug)
      if (!path) return
      posts.push({
        path,
        title: row.title,
        summary: row.summary,
        lastmod: row.lastEdited,
        publishDate: row.publishDate,
        category: row.category,
        tags: row.tags
      })
      ;`${row.tags || ''}`.split(',').map(tag => tag.trim()).filter(Boolean).forEach(tag => {
        if (!LOW_VALUE_SITEMAP_TERMS.has(tag)) tagSet.add(tag)
      })
      if (row.category) {
        const category = `${row.category}`.trim()
        if (!LOW_VALUE_SITEMAP_TERMS.has(category)) categorySet.add(category)
      }
      return
    }

    if (row.type === 'Page') {
      const path = `${row.slug}`.replace(/^\/+/, '')
      if (!path || /^https?:\/\//i.test(path)) return
      posts.push({ path, lastmod: row.lastEdited })
    }
  })

  return {
    posts,
    tags: Array.from(tagSet),
    categories: Array.from(categorySet).filter(Boolean)
  }
}

module.exports = { fetchNotionSitemapEntries }
