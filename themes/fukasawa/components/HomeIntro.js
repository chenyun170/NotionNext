import SmartLink from '@/components/SmartLink'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

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

const flagshipTopics = [
  {
    name: '海关数据',
    match: /海关|数据|进口|贸易/i,
    description: '围绕进口商、供应商、HS 编码和采购记录，判断真实买家与市场机会。',
    href: '/customs-data.html',
    preferStaticHref: true,
    icon: 'fa-database'
  },
  {
    name: '外贸获客',
    match: /外贸获客|客户开发|主动获客|找客户/i,
    description: '从线索筛选、触达话术到跟进节奏，整理可执行的 B2B 获客方法。',
    href: '/tag/%E5%A4%96%E8%B4%B8%E8%8E%B7%E5%AE%A2',
    icon: 'fa-user-plus'
  },
  {
    name: 'AI 与工具',
    match: /AI|工具|自动化|图灵搜|顶易/i,
    description: '把 AI、搜索工具和数据工具用于调研、开发信、跟进和效率提升。',
    href: '/search/AI',
    icon: 'fa-magic'
  }
]

const trustSignals = [
  {
    label: '数据线索',
    value: '海关数据 / 采购记录'
  },
  {
    label: '内容方式',
    value: '实战拆解 / 工具验证'
  },
  {
    label: '更新节奏',
    value: '持续补充外贸方法'
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
            <div className='mt-5 flex flex-wrap gap-2'>
              <SmartLink
                href='/search/%E5%A4%96%E8%B4%B8%E8%8E%B7%E5%AE%A2'
                className='inline-flex h-10 items-center rounded-[8px] bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-blue-600 dark:bg-white dark:text-zinc-950 dark:hover:bg-blue-400'>
                <i className='fas fa-search mr-2 text-xs' />
                搜索获客方法
              </SmartLink>
              <SmartLink
                href='#posts-wrapper'
                className='inline-flex h-10 items-center rounded-[8px] border border-zinc-200 px-4 text-sm font-bold text-zinc-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:text-blue-300'>
                <i className='fas fa-clock-rotate-left mr-2 text-xs' />
                查看最新文章
              </SmartLink>
              <a
                href={CUSTOMS_DATA_SKILL.href}
                onClick={() => trackCustomsDataSkillClick('home_intro_button')}
                className='inline-flex h-10 items-center rounded-[8px] border border-blue-200 bg-blue-50 px-4 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/50'>
                <i className='fas fa-database mr-2 text-xs' />
                海关数据免费查询 Skill
              </a>
            </div>
          </div>

          <div className='rounded-[8px] border border-dashed border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/50'>
            <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-400'>
              情报地图
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
            <div className='mt-4 grid gap-2 border-t border-dashed border-zinc-200 pt-4 dark:border-zinc-800'>
              {trustSignals.map(signal => (
                <div key={signal.label} className='flex items-center justify-between gap-3 text-xs'>
                  <span className='text-zinc-400'>{signal.label}</span>
                  <span className='text-right font-semibold text-zinc-700 dark:text-zinc-200'>
                    {signal.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>

        <div className='grid border-t border-zinc-200 dark:border-zinc-800 md:grid-cols-3'>
        {topics.map(topic => {
          const TopicLink = topic.href?.endsWith('.html') ? 'a' : SmartLink
          return (
            <TopicLink
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
            </TopicLink>
          )
        })}
        </div>
      </section>
  )
}

const buildTopics = categoryOptions => {
  const categories = categoryOptions?.filter(category => category?.name) || []
  const topics = flagshipTopics.map(topic => {
    const matchedCategory = categories.find(category => topic.match.test(category.name))
    return {
      name: topic.name,
      description: buildTopicDescription(matchedCategory?.name || topic.name, topic.description),
      href: matchedCategory?.name && !topic.preferStaticHref
        ? `/category/${encodeURIComponent(matchedCategory.name)}`
        : topic.href,
      icon: topic.icon,
      count: matchedCategory?.count
    }
  })

  return topics?.length ? topics : fallbackTopics
}

const buildTopicDescription = (name, fallbackDescription) => {
  if (/海关|数据|贸易/.test(name)) {
    return '围绕进口商、供应商、HS 编码和采购记录，判断真实买家与市场机会。'
  }
  if (/外贸获客|客户开发|主动获客|找客户/.test(name)) {
    return '从线索筛选、触达话术到跟进节奏，整理可执行的 B2B 获客方法。'
  }
  if (/物流|跨境|运输/.test(name)) {
    return '关注跨境链路、成本、时效和履约风险。'
  }
  if (/AI|工具|自动/.test(name)) {
    return '把 AI、搜索工具和数据工具用于调研、开发信、跟进和效率提升。'
  }
  return fallbackDescription || '按主题整理实战文章，帮助你更快找到可执行方案。'
}

export default HomeIntro
