import SmartLink from '@/components/SmartLink'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import {
  trackCustomsDataSkillClick,
  trackSiteInteraction
} from '@/lib/utils/customsDataSkillTracking'

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
  },
  {
    name: '开发信与触达',
    description: '拿到目标客户后，怎么写开发信、社媒话术和跟进节奏。',
    href: '/client-development.html',
    icon: 'fa-envelope-open-text'
  }
]

const flagshipTopics = [
  {
    name: '海关数据专题',
    match: /海关|数据|进口|贸易/i,
    description:
      '围绕进口商、供应商、HS 编码和采购记录，判断真实买家与市场机会。',
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
  },
  {
    name: '开发信与触达',
    match: /开发信|触达|话术|跟进邮件|社媒|接洽/i,
    description: '拿到目标客户后，怎么写开发信、社媒话术和跟进节奏。',
    href: '/client-development.html',
    preferStaticHref: true,
    icon: 'fa-envelope-open-text'
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

const HomeIntro = ({ categoryOptions = [] }) => {
  const topics = buildTopics(categoryOptions)
  const homeDescription = buildHomeDescription()

  return (
    <section className='home-intro mx-auto mb-10 w-full max-w-[calc(100vw-2rem)] sm:max-w-full'>
      <div className='px-1 py-2 sm:px-2 sm:py-4 sm:pb-8'>
        <div className='mb-8 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-stone-500'>
          <span className='h-px w-8 bg-stone-300 dark:bg-stone-700' />
          <span>123170.xyz · Foreign Trade Intelligence</span>
        </div>

        <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-center'>
          <div className='min-w-0 max-w-[326px] sm:max-w-none'>
            <h1 className='max-w-3xl break-words text-[30px] font-bold leading-[1.15] tracking-[-0.02em] text-stone-950 [overflow-wrap:anywhere] dark:text-stone-50 sm:text-[44px] sm:leading-[1.08]'>
              外贸获客情报局：查谁在进口你的产品
            </h1>
            <p className='mt-5 max-w-2xl break-words text-[15px] font-normal leading-8 text-stone-500 dark:text-stone-400'>
              {homeDescription}
            </p>
            <div className='mt-5 flex w-full min-w-0 flex-wrap gap-2'>
              <a
                href={CUSTOMS_DATA_SKILL.href}
                onClick={() => {
                  trackCustomsDataSkillClick('home_intro_primary')
                  trackSiteInteraction({
                    source: 'home_primary_cta',
                    sourceGroup: 'home',
                    target: CUSTOMS_DATA_SKILL.href,
                    action: 'click_customs_data'
                  })
                }}
                className='brand-btn brand-btn-primary h-10 w-full max-w-full px-4 text-sm sm:w-auto'
              >
                <i className='fas fa-database mr-2 text-xs' />
                免费查：谁在进口你的产品
              </a>
              <SmartLink
                href='/foreign-trade-tools.html'
                onClick={() =>
                  trackSiteInteraction({
                    source: 'home_secondary_cta',
                    sourceGroup: 'home',
                    target: '/foreign-trade-tools.html',
                    action: 'click_tool_workflow'
                  })
                }
                className='brand-btn brand-btn-secondary h-10 w-full max-w-full px-4 text-sm sm:w-auto'
              >
                <i className='fas fa-route mr-2 text-xs' />
                图灵搜 + 顶易云 + 海关数据怎么用
              </SmartLink>
            </div>

            <form
              action='/diagnose'
              method='get'
              onSubmit={() =>
                trackSiteInteraction({
                  source: 'home_light_diagnosis_submit',
                  sourceGroup: 'home',
                  target: '/diagnose',
                  action: 'start_light_diagnosis'
                })
              }
              className='home-diagnosis mt-4 flex min-w-0 flex-col gap-2 rounded-[8px] border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-900 sm:flex-row sm:items-center'
            >
              <label className='min-w-0 flex-1 text-xs font-bold leading-5 text-stone-700 dark:text-stone-300'>
                输入产品词，看这个品类还有没有商机
                <input
                  name='product'
                  type='text'
                  placeholder='比如 LED 灯、轴承、太阳能板'
                  className='mt-2 h-9 w-full rounded-[8px] border border-stone-200 bg-white px-3 text-xs font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-stone-400 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:placeholder:text-stone-500'
                />
              </label>
              <button
                type='submit'
                className='brand-btn brand-btn-accent h-9 shrink-0 px-3 text-xs'
              >
                5 秒看商机
              </button>
            </form>
          </div>

          <div className='home-signal-panel min-w-0 max-w-[326px] border-l border-stone-200 pl-4 dark:border-stone-800 sm:max-w-none sm:pl-6'>
            <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
              获客主线
            </div>
            <div className='mt-3'>
              <div className='break-words text-2xl font-black leading-tight text-stone-950 dark:text-stone-50'>
                查客户 / 验采购 / 做跟进
              </div>
              <div className='text-xs font-medium text-stone-600 dark:text-stone-400'>
                把精力先放在真正买过的人身上
              </div>
            </div>
            <div className='mt-4 grid gap-2 border-t border-dashed border-stone-300 pt-4 dark:border-stone-800'>
              {acquisitionSteps.map(signal => (
                <div
                  key={signal.label}
                  className='flex min-w-0 flex-col gap-1 text-xs sm:flex-row sm:items-center sm:justify-between sm:gap-3'
                >
                  <span className='font-medium text-stone-500 dark:text-stone-400'>
                    {signal.label}
                  </span>
                  <span className='break-words font-bold text-stone-800 dark:text-stone-200 sm:text-right'>
                    {signal.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className='mt-10 grid border-t border-stone-200 dark:border-stone-800 md:grid-cols-4'>
        {topics.map(topic => {
          const TopicLink = topic.href?.endsWith('.html') ? 'a' : SmartLink
          return (
            <TopicLink
              key={topic.name}
              href={topic.href}
              className='group block min-h-[112px] min-w-0 border-b border-stone-200 py-5 pr-4 transition-colors dark:border-stone-800 md:border-b-0 md:border-r last:md:border-r-0'
            >
              <div className='mb-3 flex items-center justify-between'>
                <span className='flex h-8 w-8 items-center justify-center text-sm text-stone-400 transition-colors group-hover:text-stone-800 dark:text-stone-500 dark:group-hover:text-stone-200'>
                  <i className={`fas ${topic.icon}`} />
                </span>
                {topic.count && (
                  <span className='text-xs font-semibold text-stone-500 dark:text-stone-400'>
                    {topic.count} 篇
                  </span>
                )}
              </div>
              <h2 className='break-words text-[15px] font-semibold text-stone-900 [overflow-wrap:anywhere] transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300'>
                {topic.name}
              </h2>
              <p className='mt-2 max-w-[calc(100vw-4rem)] break-all text-sm font-medium leading-6 text-stone-600 [overflow-wrap:anywhere] dark:text-stone-400 sm:max-w-none'>
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
    const matchedCategory = categories.find(category =>
      topic.match.test(category.name)
    )
    return {
      name: topic.name,
      description: buildTopicDescription(
        matchedCategory?.name || topic.name,
        topic.description
      ),
      href:
        matchedCategory?.name && !topic.preferStaticHref
          ? `/category/${encodeURIComponent(matchedCategory.name)}`
          : topic.href,
      icon: topic.icon,
      count: matchedCategory?.count
    }
  })

  return topics?.length ? topics : fallbackTopics
}

const buildHomeDescription = () =>
  '海关数据 + 图灵搜 + 顶易云怎么配合：先用海关数据找到真的在进口你产品的公司，再看采购量和频率，最后决定谁值得优先跟进。'

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
