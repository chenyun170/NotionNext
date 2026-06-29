import SmartLink from '@/components/SmartLink'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const fallbackTopics = [
  {
    name: '海关数据专题',
    description: '从产品、HS 编码、进口商和供应商关系开始判断市场机会。',
    href: '/customs-data.html',
    icon: 'fa-database'
  },
  {
    name: '美国进口商查询',
    description: '用美国进口数据筛选持续采购、近期活跃的真实买家。',
    href: '/us-importers.html',
    icon: 'fa-building-user'
  },
  {
    name: '供应商关系分析',
    description: '反查供应商服务过哪些客户，判断竞品和渠道关系。',
    href: '/supplier-analysis.html',
    icon: 'fa-project-diagram'
  }
]

const flagshipTopics = [
  {
    name: '海关数据专题',
    match: /海关|数据|进口|贸易/i,
    description: '围绕进口商、供应商、HS 编码和采购记录，判断真实买家与市场机会。',
    href: '/customs-data.html',
    preferStaticHref: true,
    icon: 'fa-database'
  },
  {
    name: '美国进口商查询',
    match: /美国|进口商|买家|采购商/i,
    description: '用美国进口记录筛选持续采购、近期活跃、产品匹配的潜在客户。',
    href: '/us-importers.html',
    preferStaticHref: true,
    icon: 'fa-building-user'
  },
  {
    name: '供应商关系分析',
    match: /供应商|竞品|关系|渠道/i,
    description: '反查供应商客户网络，把竞品供应链转成可验证的开发线索。',
    href: '/supplier-analysis.html',
    preferStaticHref: true,
    icon: 'fa-project-diagram'
  }
]

const acquisitionSteps = [
  {
    label: '01 查进口商',
    value: '谁在进口你的产品'
  },
  {
    label: '02 验采购力',
    value: '采购量 / 频率 / 供应商'
  },
  {
    label: '03 做跟进',
    value: '开发信 / 社媒 / 复盘'
  }
]

const quickLinks = [
  {
    name: '海关数据',
    href: '/customs-data.html'
  },
  {
    name: '图灵搜',
    href: '/turingsearch.html'
  },
  {
    name: '顶易云',
    href: '/dingyiyun.html'
  },
  {
    name: '顶易软件选型',
    href: '/dingyi.html',
    title: '顶易偏外贸客户开发软件和工具选型，用来看线索发现、客户管理、触达跟进和海关数据如何组合。'
  },
  {
    name: '工具对比',
    href: '/foreign-trade-tools.html'
  }
]

const HomeIntro = ({
  categoryOptions = []
}) => {
  const topics = buildTopics(categoryOptions)
  const homeDescription = buildHomeDescription()

  return (
    <section className='mx-auto mb-8 w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-[8px] border border-zinc-300 bg-white shadow-sm shadow-zinc-200/60 dark:border-zinc-800 dark:bg-[#111113] dark:shadow-none sm:max-w-full'>
      <div className='px-5 py-6 sm:px-7 sm:py-8'>
        <div className='mb-4 flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 dark:text-blue-300 sm:text-[11px] sm:tracking-[0.18em]'>
          <span className='h-2 w-2 rounded-full bg-blue-700 dark:bg-blue-300' />
          <span className='min-w-0 break-words leading-5'>123170.xyz · Foreign Trade Intelligence</span>
        </div>

        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center'>
          <div className='min-w-0 max-w-[326px] sm:max-w-none'>
            <h1 className='max-w-3xl break-words text-[22px] font-black leading-tight text-zinc-950 [overflow-wrap:anywhere] dark:text-zinc-50 sm:text-3xl'>
              外贸获客情报局：查谁在进口你的产品
            </h1>
            <p className='mt-3 max-w-2xl break-words text-sm font-medium leading-7 text-zinc-700 dark:text-zinc-300'>
              {homeDescription}
            </p>
            <div className='mt-5 flex w-full min-w-0 flex-wrap gap-2'>
              <a
                href={CUSTOMS_DATA_SKILL.href}
                onClick={() => trackCustomsDataSkillClick('home_intro_primary')}
                className='inline-flex h-10 w-full max-w-full items-center justify-center rounded-[8px] bg-blue-700 px-4 text-sm font-bold text-white shadow-sm shadow-blue-900/20 transition hover:bg-blue-800 dark:bg-blue-400 dark:text-zinc-950 dark:hover:bg-blue-300 sm:w-auto'>
                <i className='fas fa-database mr-2 text-xs' />
                免费查海关数据
              </a>
              <SmartLink
                href='/foreign-trade-tools.html'
                className='inline-flex h-10 w-full max-w-full items-center justify-center rounded-[8px] border border-zinc-300 bg-white px-4 text-sm font-bold text-zinc-800 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:text-blue-300 sm:w-auto'>
                <i className='fas fa-route mr-2 text-xs' />
                看工具怎么选
              </SmartLink>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-600 dark:text-zinc-400'>
              <span className='font-bold text-zinc-800 dark:text-zinc-300'>常用入口</span>
              {quickLinks.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  title={item.title || item.name}
                  className='font-semibold text-zinc-600 transition hover:text-blue-700 dark:text-zinc-400 dark:hover:text-blue-300'>
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className='min-w-0 max-w-[326px] rounded-[8px] border border-zinc-300 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/50 sm:max-w-none'>
            <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>
              获客主线
            </div>
            <div className='mt-3'>
              <div className='break-words text-2xl font-black leading-tight text-zinc-950 dark:text-zinc-50'>
                查客户 / 验采购 / 做跟进
              </div>
              <div className='text-xs font-medium text-zinc-600 dark:text-zinc-400'>
                先判断客户值不值得开发
              </div>
            </div>
            <div className='mt-4 grid gap-2 border-t border-dashed border-zinc-300 pt-4 dark:border-zinc-800'>
              {acquisitionSteps.map(signal => (
                <div key={signal.label} className='flex min-w-0 flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
                  <span className='font-medium text-zinc-500 dark:text-zinc-400'>{signal.label}</span>
                  <span className='break-words font-bold text-zinc-800 dark:text-zinc-200 sm:text-right'>
                    {signal.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='grid border-t border-zinc-300 dark:border-zinc-800 md:grid-cols-3'>
        {topics.map(topic => {
          const TopicLink = topic.href?.endsWith('.html') ? 'a' : SmartLink
          return (
            <TopicLink
              key={topic.name}
              href={topic.href}
              className='group block min-h-[112px] min-w-0 border-b border-zinc-300 p-4 transition hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-blue-950/20 md:border-b-0 md:border-r last:md:border-r-0'>
              <div className='mb-3 flex items-center justify-between'>
                <span className='flex h-8 w-8 items-center justify-center rounded-[8px] bg-zinc-100 text-sm text-zinc-700 transition group-hover:bg-blue-700 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-300'>
                  <i className={`fas ${topic.icon}`} />
                </span>
                {topic.count && (
                  <span className='text-xs font-semibold text-zinc-500 dark:text-zinc-400'>
                    {topic.count} 篇
                  </span>
                )}
              </div>
              <h2 className='break-words text-base font-black text-zinc-950 [overflow-wrap:anywhere] group-hover:text-blue-800 dark:text-zinc-50 dark:group-hover:text-blue-300'>
                {topic.name}
              </h2>
              <p className='mt-2 max-w-[calc(100vw-4rem)] break-all text-sm font-medium leading-6 text-zinc-600 [overflow-wrap:anywhere] dark:text-zinc-400 sm:max-w-none'>
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

const buildHomeDescription = () =>
  '用海关数据判断买家是谁、从哪进口、采购量多少、采购频率如何，再把线索变成可执行的客户开发路径。'

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
