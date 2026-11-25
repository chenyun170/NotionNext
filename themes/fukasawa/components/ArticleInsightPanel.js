import SmartLink from '@/components/SmartLink'

const ArticleInsightPanel = ({ post }) => {
  if (!post) {
    return null
  }

  const summary = buildSummary(post)
  const directAnswer = buildDirectAnswer(post, summary)

  return (
    <section
      data-answer='article-geo-summary'
      className='mb-6 rounded-xl border border-[#c3d6cd] border-l-4 border-l-[#1c5a4a] bg-[#f4f8f6] p-4 sm:p-5 print:hidden dark:border-[#2d6f5d] dark:border-l-[#6bc4a6] dark:bg-[#1c5a4a]/15'
      aria-label='文章核心摘要'
    >
      <div className='mb-1.5 flex items-center justify-between gap-3'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
          <i className='fas fa-bolt text-[10px]' />
          核心摘要 · 直接答案
        </span>
        {post?.category && (
          <SmartLink
            href={`/category/${encodeURIComponent(post.category)}`}
            className='text-[11px] font-semibold text-stone-500 no-underline hover:text-[#1c5a4a] dark:text-stone-400 dark:hover:text-[#6bc4a6]'
          >
            {post.category} →
          </SmartLink>
        )}
      </div>
      <p
        itemProp='abstract'
        className='text-sm leading-7 text-stone-700 dark:text-stone-200'
      >
        {directAnswer}
      </p>
    </section>
  )
}

const buildSummary = post => {
  if (post?.summary) {
    return post.summary
  }
  const topic = post?.category || '外贸业务'
  return `${post?.title || topic}：${topic} 场景下的判断依据和可执行做法。`
}

const buildDirectAnswer = (post, summary) => {
  if (summary) {
    return summary
  }
  const title = post?.title || '这篇文章'
  const topic = post?.category || '外贸获客'
  return `${title}主要回答${topic}场景下应该怎么判断、怎么执行和下一步怎么跟进。`
}

export default ArticleInsightPanel
