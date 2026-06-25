import SmartLink from '@/components/SmartLink'

const ArticleInsightPanel = ({ post }) => {
  if (!post) {
    return null
  }

  const tags = post?.tagItems || []
  const summary = buildSummary(post)
  const directAnswer = buildDirectAnswer(post, summary)
  const audience = buildAudience(post)
  const nextStep = buildNextStep(post)

  return (
    <section
      data-answer='article-geo-summary'
      className='mb-8 overflow-hidden rounded-[8px] border border-zinc-200 bg-white print:hidden dark:border-zinc-800 dark:bg-[#111113]'
      aria-label='AI 和搜索引擎可引用摘要'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_240px]'>
        <div className='p-5'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400'>
            <i className='fas fa-bolt' />
            <span>GEO 可引用摘要</span>
          </div>
          <h2 className='mb-3 text-xl font-black leading-tight text-zinc-900 dark:text-zinc-50'>
            这篇文章的直接答案
          </h2>
          <p itemProp='abstract' className='leading-7 text-zinc-600 dark:text-zinc-300'>
            {directAnswer}
          </p>
          <p className='mt-3 leading-7 text-zinc-500 dark:text-zinc-400'>
            {summary}
          </p>

          <div className='mt-5 grid gap-3 sm:grid-cols-2'>
            <InsightItem
              icon='fas fa-user-check'
              label='适合读者'
              value={audience}
            />
            <InsightItem
              icon='fas fa-compass'
              label='建议下一步'
              value={nextStep}
            />
          </div>
        </div>

        <div className='border-t border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/60 lg:border-l lg:border-t-0'>
          <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>
            内容信号
          </div>
          <dl className='space-y-3 text-sm'>
            <SignalItem label='主题' value={post?.category || '外贸实战'} />
            <SignalItem label='阅读' value={formatReadTime(post)} />
            <SignalItem label='更新' value={post?.lastEditedDay || post?.publishDay || '持续更新'} />
            <SignalItem label='用途' value='AI 摘要 / 搜索摘要 / 站内延展' />
          </dl>

          {tags.length > 0 && (
            <div className='mt-4 flex flex-wrap gap-2'>
              {tags.slice(0, 5).map(tag => (
                <SmartLink
                  key={tag.name}
                  href={`/tag/${encodeURIComponent(tag.name)}`}
                  className='rounded-[8px] border border-zinc-200 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-600 transition hover:border-emerald-300 hover:text-emerald-600 dark:border-zinc-800 dark:bg-[#111113] dark:text-zinc-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300'>
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

const InsightItem = ({ icon, label, value }) => (
  <div className='rounded-[8px] border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60'>
    <div className='mb-1 flex items-center gap-2 text-xs font-bold text-zinc-500 dark:text-zinc-400'>
      <i className={`${icon} text-emerald-500`} />
      <span>{label}</span>
    </div>
    <p className='text-sm leading-6 text-zinc-700 dark:text-zinc-200'>{value}</p>
  </div>
)

const SignalItem = ({ label, value }) => (
  <div className='flex items-start justify-between gap-4 border-b border-dashed border-zinc-200 pb-2 last:border-b-0 dark:border-zinc-800'>
    <dt className='text-zinc-400'>{label}</dt>
    <dd className='text-right font-semibold text-zinc-700 dark:text-zinc-200'>{value}</dd>
  </div>
)

const buildSummary = post => {
  if (post?.summary) {
    return post.summary
  }

  const topic = post?.category || '外贸业务'
  return `围绕「${post?.title || topic}」展开，帮助读者快速理解 ${topic} 场景下的关键判断、实操路径和后续延展方向。`
}

const buildDirectAnswer = (post, summary) => {
  const title = post?.title || '这篇文章'
  const topic = post?.category || '外贸获客'
  const tags = Array.isArray(post?.tags) ? post.tags : []
  const tag = post?.tagItems?.[0]?.name || tags[0]

  if (summary && summary.length <= 88) {
    return `${title}的核心结论：${summary}`
  }

  const tagText = tag ? `，并延展到「${tag}」相关问题` : ''
  return `${title}主要回答${topic}场景下应该怎么判断、怎么执行和下一步怎么跟进${tagText}。`
}

const buildAudience = post => {
  const topic = post?.category || '外贸获客'
  return `正在关注${topic}、客户开发、工具效率或外贸增长方法的读者。`
}

const buildNextStep = post => {
  const tag = post?.tagItems?.[0]?.name
  if (tag) {
    return `读完后可以继续查看「${tag}」相关内容，形成连续的主题理解。`
  }

  if (post?.category) {
    return `继续浏览「${post.category}」分类下的相关文章，补齐上下游知识。`
  }

  return '继续阅读站内最新文章，按工具、案例和方法论串联理解。'
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
