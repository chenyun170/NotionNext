/**
 * 站内互链：根据标签重合度和分类给文章排序，生成"相关阅读"列表。
 *
 * 目的：让每篇文章都至少被若干篇其他文章链接，
 * 帮助爬虫发现页面，也给读者一条继续读下去的路径。
 */

const SELF_LINK_FALLBACK_TAG_WEIGHT = 3
const SAME_CATEGORY_WEIGHT = 2

/**
 * @param {object} post 当前文章
 * @param {object[]} allPages 全站页面
 * @param {number} limit 返回条数
 * @returns {object[]} 相关文章（已按相关度排序）
 */
export function buildRelatedPosts(post, allPages, limit = 4) {
  if (!post || !Array.isArray(allPages) || allPages.length === 0) {
    return []
  }

  const currentTags = normalizeList(post.tags)
  const currentCategory = normalizeValue(post.category)
  const candidates = []

  allPages.forEach((candidate, index) => {
    if (!candidate || candidate.type !== 'Post') return
    if (candidate.status && candidate.status !== 'Published') return
    if (candidate.id === post.id) return
    if (candidate.slug && candidate.slug === post.slug) return

    const sharedTags = normalizeList(candidate.tags).filter(tag =>
      currentTags.includes(tag)
    ).length
    const sameCategory =
      currentCategory &&
      normalizeValue(candidate.category) === currentCategory

    if (sharedTags === 0 && !sameCategory) return

    const score =
      sharedTags * SELF_LINK_FALLBACK_TAG_WEIGHT +
      (sameCategory ? SAME_CATEGORY_WEIGHT : 0)

    candidates.push({ post: candidate, score, index })
  })

  candidates.sort((a, b) => b.score - a.score || a.index - b.index)

  const picked = candidates.slice(0, limit).map(item => item.post)

  // 同分类/同标签的文章不足时，用最新文章补齐，保证每篇都有出口链接
  if (picked.length < limit) {
    const pickedIds = new Set(picked.map(item => item.id))
    for (const candidate of allPages) {
      if (picked.length >= limit) break
      if (!candidate || candidate.type !== 'Post') continue
      if (candidate.status && candidate.status !== 'Published') continue
      if (candidate.id === post.id || pickedIds.has(candidate.id)) continue
      picked.push(candidate)
      pickedIds.add(candidate.id)
    }
  }

  return picked
}

function normalizeList(value) {
  if (Array.isArray(value)) {
    return value.map(item => normalizeValue(item)).filter(Boolean)
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => normalizeValue(item))
      .filter(Boolean)
  }
  return []
}

function normalizeValue(value) {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    return value.map(item => normalizeValue(item)).filter(Boolean).join(',')
  }
  return `${value}`.trim()
}
