/**
 * 只输出作者显式提供的 FAQ（post.faq 数组）。
 *
 * 之前按模板给每篇文章生成同样三个问题（"这篇文章主要讲什么"等），
 * 全站几十篇回答一字不差，正文里读者也点不出新增信息，
 * 这类问答既没有内容增量，也不适合作为 FAQPage 结构化数据提交。
 */
export const buildArticleFAQs = (postOrMeta = {}) => {
  const explicit = Array.isArray(postOrMeta?.faq) ? postOrMeta.faq : []

  return explicit
    .map(item => ({
      question: cleanText(item?.question),
      answer: cleanText(item?.answer)
    }))
    .filter(item => item.question && item.answer)
}

const cleanText = value => {
  if (!value) {
    return ''
  }

  return `${value}`.replace(/\s+/g, ' ').trim()
}
