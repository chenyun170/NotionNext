import SmartLink from '@/components/SmartLink'

const ArticleInsightPanel = ({ post }) => {
  if (!post) {
    return null
  }

  const tags = post?.tagItems || []
  const summary = buildSummary(post)
  const directAnswer = buildDirectAnswer(post, summary)

  return (
    <section
      data-answer='article-geo-summary'
      className='mb-6 overflow-hidden rounded-[8px] border border-stone-200 bg-white sm:mb-8 print:hidden dark:border-stone-800 dark:bg-stone-900'
      aria-label='文章核心摘要'>
      <div className='grid gap-0 xl:grid-cols-[minmax(0,1fr)_240px]'>
        <div className='p-4 sm:p-5'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
            <i className='fas fa-bolt' />
            <span>摘要</span>
          </div>
          <h2 className='mb-3 text-xl font-black leading-tight text-stone-900 dark:text-stone-50'>
            这篇文章的直接答案
          </h2>
          <p itemProp='abstract' className='leading-7 text-stone-600 dark:text-stone-300'>
            {directAnswer}
          </p>

        </div>

        <div className='hidden border-l border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950/60 xl:block'>
          <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
            内容信号
          </div>
          <dl className='space-y-3 text-sm'>
            <SignalItem label='主题' value={post?.category || '外贸实战'} />
            <SignalItem label='阅读' value={formatReadTime(post)} />
            <SignalItem label='更新' value={post?.lastEditedDay || post?.publishDay || '持续更新'} />
          </dl>

          {tags.length > 0 && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {tags.slice(0, 5).map(tag => (
                <SmartLink
                  key={tag.name}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className='rounded-[8px] border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-600 transition hover:border-stone-400 hover:text-stone-800 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600 dark:hover:text-stone-100'>
                  #{tag.name}
                </SmartLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

const SignalItem = ({ label, value }) => (
  <div className='flex items-start justify-between gap-4 border-b border-dashed border-stone-200 pb-2 last:border-b-0 dark:border-stone-800'>
    <dt className='text-stone-400'>{label}</dt>
    <dd className='text-right font-semibold text-stone-700 dark:text-stone-200'>{value}</dd>
  </div>
)

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
  const tags = Array.isArray(post?.tags) ? post.tags : []
  const tag = post?.tagItems?.[0]?.name || tags[0]
  const tagText = tag ? `，并延展到「${tag}」相关问题` : ''
  return `${title}主要回答${topic}场景下应该怎么判断、怎么执行和下一步怎么跟进${tagText}。`
}

const formatReadTime = post => {
  if (post?.readTime) {
    return `${post.readTime} 分钟`
  }

  if (post?.wordCount) {
    return `${post.wordCount} 字`
  }

  return '约 3-6 分钟'
}

export default ArticleInsightPanel
