/**
 * 站内互链：为每篇文章生成"相关阅读"列表。
 *
 * 目标有两个，缺一不可：
 * 1. 相关：优先推荐标签相近、分类相同、选题相近的文章；
 * 2. 覆盖：保证每篇文章都能被别处链到，不能出现孤岛。
 *
 * 逐篇独立推荐时，少数"枢纽文章"会被所有人引用，其余文章入链为 0。
 * 所以这里做全站一次性分配：按相关度排序，同时对已获得较多入链的文章扣分。
 */

const SAME_CATEGORY_WEIGHT = 2
const TEXT_SIMILARITY_WEIGHT = 6
const IN_DEGREE_PENALTY = 1.2
const RELATED_COUNT = 4

const STOP_WORDS = new Set([
  '外贸', '客户', '如何', '怎么', '什么', '这些', '那些',
  '我们', '他们', '一个', '这个', '可以', '不要'
])

const graphCache = { key: '', value: new Map() }

/**
 * @param {object} post 当前文章
 * @param {object[]} allPages 全站页面
 * @param {number} limit 返回条数
 * @returns {object[]} 相关文章
 */
export function buildRelatedPosts(post, allPages, limit = RELATED_COUNT) {
  if (!post || !Array.isArray(allPages) || allPages.length === 0) {
    return []
  }

  const graph = getGlobalGraph(allPages, limit)
  return (graph.get(post.id || post.slug) || [])
    .map(item => item.candidate)
    .filter(Boolean)
}

function getGlobalGraph(allPages, limit) {
  const cacheKey = [
    allPages.length,
    allPages[0]?.slug || '',
    allPages[allPages.length - 1]?.slug || '',
    limit
  ].join('|')

  if (graphCache.key === cacheKey) {
    return graphCache.value
  }

  const posts = allPages.filter(
    item =>
      item &&
      item.type === 'Post' &&
      (!item.status || item.status === 'Published')
  )

  const tagFrequency = countTagFrequency(posts)
  const totalPosts = posts.length || 1
  const fingerprints = new Map()
  posts.forEach(item => {
    fingerprints.set(item.id || item.slug, buildTextFingerprint(item))
  })

  const scoredById = new Map()
  posts.forEach(current => {
    const currentKey = current.id || current.slug
    const currentTags = normalizeList(current.tags)
    const currentCategory = normalizeValue(current.category)
    const currentFingerprint = fingerprints.get(currentKey)
    const scored = []

    posts.forEach((candidate, index) => {
      const candidateKey = candidate.id || candidate.slug
      if (candidateKey === currentKey) return

      const sharedTags = normalizeList(candidate.tags)
        .filter(tag => currentTags.includes(tag))
        .map(tag => tagIdfWeight(tagFrequency.get(tag) || 1, totalPosts))
        .reduce((sum, weight) => sum + weight, 0)

      const sameCategory =
        currentCategory &&
        normalizeValue(candidate.category) === currentCategory

      const textSimilarity = jaccard(
        currentFingerprint,
        fingerprints.get(candidateKey)
      )

      const score =
        sharedTags +
        (sameCategory ? SAME_CATEGORY_WEIGHT : 0) +
        textSimilarity * TEXT_SIMILARITY_WEIGHT

      if (score <= 0) return
      scored.push({ candidate, score, index })
    })

    scored.sort((a, b) => b.score - a.score || a.index - b.index)
    scoredById.set(currentKey, scored)
  })

  // 按 key 稳定排序，保证每次构建得到相同结果
  const orderedKeys = posts
    .map(item => item.id || item.slug)
    .sort((a, b) => String(a).localeCompare(String(b)))

  const inDegree = new Map(orderedKeys.map(key => [key, 0]))
  const graph = new Map()

  orderedKeys.forEach(key => {
    const ranked = (scoredById.get(key) || [])
      .map(item => ({
        ...item,
        adjusted:
          item.score -
          IN_DEGREE_PENALTY * (inDegree.get(item.candidate.id || item.candidate.slug) || 0)
      }))
      .sort((a, b) => b.adjusted - a.adjusted || a.index - b.index)
      .slice(0, Math.max(limit, 0))
      .map(item => ({ candidate: item.candidate, score: item.score }))

    graph.set(key, ranked)
    ranked.forEach(item => {
      const targetKey = item.candidate.id || item.candidate.slug
      inDegree.set(targetKey, (inDegree.get(targetKey) || 0) + 1)
    })
  })

  const candidateByKey = new Map(posts.map(item => [item.id || item.slug, item]))
  repairOrphans(graph, scoredById, orderedKeys, inDegree, limit, candidateByKey)

  graphCache.key = cacheKey
  graphCache.value = graph
  return graph
}

/**
 * 兜底补链：任何文章都不允许零入链。
 *
 * 极少数文章和全站都没有共同标签、不同分类、标题摘要也毫无重叠，
 * 打分阶段它们进不了任何人的候选列表。这里按"最小损失"插链：
 * 把孤儿塞进最能容纳它的来源，必要时替换掉该来源里最不相关的一条。
 * 被替换掉的文章会在下一轮重新补链，直到全员至少有一条入链。
 */
function repairOrphans(graph, scoredById, orderedKeys, inDegree, limit, candidateByKey) {
  if (limit <= 0) return

  const scoreOf = (fromKey, toKey) => {
    const scored = scoredById.get(fromKey) || []
    const hit = scored.find(item => (item.candidate.id || item.candidate.slug) === toKey)
    return hit ? hit.score : 0
  }

  for (let round = 0; round < orderedKeys.length; round++) {
    const orphans = orderedKeys.filter(key => (inDegree.get(key) || 0) === 0)
    if (orphans.length === 0) return

    orphans.forEach(orphanKey => {
      let bestSource = ''
      let bestGain = -Infinity
      let bestDropIndex = -1

      orderedKeys.forEach(sourceKey => {
        if (sourceKey === orphanKey) return
        const links = graph.get(sourceKey) || []
        if (links.some(item => (item.candidate.id || item.candidate.slug) === orphanKey)) {
          return
        }
        const score = scoreOf(sourceKey, orphanKey)
        const full = links.length >= limit
        const dropIndex = full ? links.length - 1 : -1
        const weakest = full ? links[dropIndex].score : 0
        // 满员时用孤儿替换掉最弱的一条；只有更相关才换
        if (full && score <= weakest) return
        const gain = full ? score - weakest : score
        if (
          gain > bestGain ||
          (gain === bestGain && sourceKey.localeCompare(bestSource) < 0)
        ) {
          bestGain = gain
          bestSource = sourceKey
          bestDropIndex = dropIndex
        }
      })

      if (!bestSource) return
      const links = graph.get(bestSource)
      const entry = {
        candidate: candidateByKey.get(orphanKey),
        score: scoreOf(bestSource, orphanKey)
      }
      if (!entry.candidate) return

      let dropped = null
      if (bestDropIndex >= 0) {
        dropped = links[bestDropIndex]
        links.splice(bestDropIndex, 1)
      }
      links.push(entry)
      links.sort((a, b) => b.score - a.score)

      inDegree.set(orphanKey, (inDegree.get(orphanKey) || 0) + 1)
      if (dropped) {
        const droppedKey = dropped.candidate.id || dropped.candidate.slug
        inDegree.set(droppedKey, Math.max(0, (inDegree.get(droppedKey) || 0) - 1))
      }
    })
  }
}

function countTagFrequency(pages) {
  const frequency = new Map()
  pages.forEach(page => {
    normalizeList(page?.tags).forEach(tag => {
      frequency.set(tag, (frequency.get(tag) || 0) + 1)
    })
  })
  return frequency
}

/**
 * 标签稀有度权重："外贸"这类全站通吃的标签权重接近 0，
 * "海关数据""外贸话术"这种窄标签才能真正说明主题接近。
 */
function tagIdfWeight(frequency, totalPosts) {
  return Math.max(
    0.05,
    Math.min(4, Math.log(1 + totalPosts / Math.max(1, frequency)))
  )
}

/**
 * 用标题 + 摘要的字二元组做指纹，比标签更能反映两篇是否在讲同一件事。
 */
function buildTextFingerprint(post) {
  const raw = `${post?.title || ''} ${post?.summary || ''}`.replace(
    /[\s，。、；：！？"'（）()《》【】[\]—\-·,.;:!?/|]/g,
    ''
  )
  const grams = new Set()
  for (let i = 0; i < raw.length - 1; i++) {
    const gram = raw.slice(i, i + 2)
    if (!STOP_WORDS.has(gram)) grams.add(gram)
  }
  return grams
}

function jaccard(a, b) {
  if (!a || !b || !a.size || !b.size) return 0
  let intersection = 0
  const [small, large] = a.size <= b.size ? [a, b] : [b, a]
  small.forEach(item => {
    if (large.has(item)) intersection++
  })
  return intersection / (a.size + b.size - intersection)
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

