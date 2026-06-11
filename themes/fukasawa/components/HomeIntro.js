import SmartLink from '@/components/SmartLink'

const fallbackTopics = [
  {
    name: '海关数据',
    description: '用贸易记录判断客户、市场和采购节奏。',
    href: '/search?s=%E6%B5%B7%E5%85%B3%E6%95%B0%E6%8D%AE',
    icon: 'fa-chart-line'
  },
  {
    name: '客户开发',
    description: '从线索挖掘到触达跟进的外贸增长方法。',
    href: '/search?s=%E5%AE%A2%E6%88%B7%E5%BC%80%E5%8F%91',
    icon: 'fa-user-plus'
  },
  {
    name: 'AI 外贸工具',
    description: '把 AI 用到调研、邮件、跟进和自动化流程。',
    href: '/search?s=AI',
    icon: 'fa-magic'
  }
]

const HomeIntro = ({
  siteInfo,
  postCount = 0,
  categoryOptions = []
}) => {
  const topics = buildTopics(categoryOptions)

  return (
    <section className='mb-8 overflow-hidden rounded-[8px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#111113]'>
      <div className='px-5 py-6 sm:px-7 sm:py-8'>
        <div className='mb-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400'>
          <span className='h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400' />
          <span>Foreign Trade Intelligence</span>
        </div>

        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end'>
          <div>
            <h1 className='max-w-3xl text-2xl font-black leading-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl'>
              {siteInfo?.title || '外贸获客情报局'}
            </h1>
            <p className='mt-3 max-w-2xl text-sm leading-7 text-zinc-600 dark:text-zinc-300'>
              {siteInfo?.description ||
                '聚焦海关数据、客户开发、跨境工具和 AI 外贸自动化，整理可落地的获客方法与工具实战。'}
            </p>
          </div>

          <div className='rounded-[8px] border border-dashed border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50'>
            <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400'>
              Content Map
            </div>
            <div className='mt-3 flex items-end gap-4'>
              <div>
                <div className='text-3xl font-black text-zinc-950 dark:text-zinc-50'>
                  {postCount || 0}
                </div>
                <div className='text-xs text-zinc-500 dark:text-zinc-400'>
                  篇实战文章
                </div>
              </div>
              <div className='pb-1 text-xs leading-6 text-zinc-500 dark:text-zinc-400'>
                搜索、热门文章和标签已收纳到侧栏，这里只保留首页主线。
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid border-t border-zinc-200 dark:border-zinc-800 md:grid-cols-3'>
        {topics.map(topic => (
          <SmartLink
            key={topic.name}
            href={topic.href}
            className='group min-h-[126px] border-b border-zinc-200 p-5 transition hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-blue-950/20 md:border-b-0 md:border-r last:md:border-r-0'>
            <div className='mb-4 flex items-center justify-between'>
              <span className='flex h-9 w-9 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-300'>
                <i className={`fas ${topic.icon}`} />
              </span>
              {topic.count && (
                <span className='text-xs font-semibold text-zinc-400'>
                  {topic.count} 篇
                </span>
              )}
            </div>
            <h2 className='text-base font-black text-zinc-900 group-hover:text-blue-700 dark:text-zinc-50 dark:group-hover:text-blue-300'>
              {topic.name}
            </h2>
            <p className='mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
              {topic.description}
            </p>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

const buildTopics = categoryOptions => {
  const categories = categoryOptions
    ?.filter(category => category?.name)
    ?.slice(0, 3)
    ?.map((category, index) => ({
      name: category.name,
      description: buildTopicDescription(category.name),
      href: `/category/${encodeURIComponent(category.name)}`,
      icon: ['fa-chart-line', 'fa-user-plus', 'fa-truck'][index] || 'fa-folder-open',
      count: category.count
    }))

  return categories?.length ? categories : fallbackTopics
}

const buildTopicDescription = name => {
  if (/海关|数据|贸易/.test(name)) {
    return '围绕贸易数据、采购记录和市场信号做客户判断。'
  }
  if (/物流|跨境|运输/.test(name)) {
    return '关注跨境链路、成本、时效和履约风险。'
  }
  if (/AI|工具|自动/.test(name)) {
    return '用工具和自动化提高调研、触达和跟进效率。'
  }
  return '按主题整理实战文章，帮助你更快找到可执行方案。'
}

export default HomeIntro
