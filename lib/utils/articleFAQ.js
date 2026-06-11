export const buildArticleFAQs = (postOrMeta = {}) => {
  const title = postOrMeta?.title || '这篇文章'
  const category = normalizeCategory(postOrMeta?.category) || '外贸实战'
  const tags = normalizeTags(postOrMeta?.tagItems || postOrMeta?.tags)
  const summary = cleanText(postOrMeta?.summary || postOrMeta?.description)
  const primaryTag = tags[0]

  return [
    {
      question: `这篇文章主要讲什么？`,
      answer:
        summary ||
        `这篇文章围绕「${title}」展开，帮助读者理解 ${category} 场景下的关键判断、实操路径和延展阅读方向。`
    },
    {
      question: `这篇文章适合谁阅读？`,
      answer: `适合正在关注${category}、外贸获客、客户开发、工具效率或跨境业务增长的读者。`
    },
    {
      question: `读完这篇文章后，下一步应该看什么？`,
      answer: primaryTag
        ? `建议继续阅读「${primaryTag}」相关内容，把这篇文章和同主题案例、工具方法串联起来。`
        : `建议继续浏览「${category}」分类下的相关文章，补齐上下游知识和实操细节。`
    }
  ]
}

const normalizeCategory = category => {
  if (Array.isArray(category)) {
    return category.filter(Boolean)[0]
  }

  return category
}

const normalizeTags = tags => {
  if (!Array.isArray(tags)) {
    return []
  }

  return tags
    .map(tag => {
      if (typeof tag === 'string') {
        return tag
      }

      return tag?.name
    })
    .filter(Boolean)
}

const cleanText = value => {
  if (!value) {
    return ''
  }

  return `${value}`.replace(/\s+/g, ' ').trim()
}
