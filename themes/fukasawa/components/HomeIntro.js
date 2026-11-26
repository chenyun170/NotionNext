import { useState } from 'react'
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
    href: '/foreign-trade-lead-tools.html',
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
    href: '/foreign-trade-lead-tools.html',
    preferStaticHref: true,
    icon: 'fa-envelope-open-text'
  }
]

const QUICK_PRODUCTS = ['LED 灯', '精密轴承', '太阳能板', '包装机械']

const HomeIntro = ({ categoryOptions = [] }) => {
  const topics = buildTopics(categoryOptions)
  const homeDescription = buildHomeDescription()

  const [productInput, setProductInput] = useState('')
  const [oppLoading, setOppLoading] = useState(false)
  const [oppError, setOppError] = useState('')
  const [oppResult, setOppResult] = useState(null)
  const [oppProduct, setOppProduct] = useState('')

  async function runOpportunityCheck(rawProduct) {
    const product = (rawProduct || '').trim()
    if (!product) {
      setOppError('请输入产品词，比如 LED 灯、轴承')
      setOppResult(null)
      return
    }

    setOppLoading(true)
    setOppError('')
    setOppResult(null)
    setOppProduct(product)

    try {
      const res = await fetch('/api/opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product })
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        throw new Error(data.error || '商机分析失败')
      }
      setOppResult(data.analysis)
    } catch (err) {
      setOppError(err.message || '商机分析失败，请稍后再试')
    } finally {
      setOppLoading(false)
    }
  }

  const handleOpportunitySubmit = e => {
    e.preventDefault()
    trackSiteInteraction({
      source: 'home_light_diagnosis_submit',
      sourceGroup: 'home',
      target: '/api/opportunity',
      action: 'start_opportunity_ai'
    })
    void runOpportunityCheck(productInput)
  }

  return (
    <section className='home-intro mb-6 w-full'>
      {/* Hero 双栏区：左情报定位+商机快查 / 右真实进口商信号预览卡 */}
      <div className='overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17] sm:p-7 lg:p-8'>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-center lg:gap-7'>
          <div className='min-w-0'>
            <div className='mb-3.5 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#c3d6cd] bg-[#e8f0ec] px-3 py-1 text-[11px] font-bold leading-snug tracking-[0.06em] text-[#1c5a4a] dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
              <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
              <span className='min-w-0 break-words'>123170.XYZ · 海关数据与外贸获客实战情报站</span>
            </div>

            <h1 className='break-words text-[26px] font-extrabold leading-[1.22] tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl lg:text-[2.5rem]'>
              外贸获客情报局：
              <span className='text-[#1c5a4a] dark:text-[#6bc4a6]'>
                从找客户到收货款
              </span>
            </h1>

            <p className='mt-3.5 max-w-2xl text-[15px] leading-7 text-stone-600 dark:text-stone-300'>
              {homeDescription}
            </p>

            {/* 主行动按钮（精简为主行动 + 工具工作流次入口，视觉重心更聚焦） */}
            <div className='mt-5 flex flex-wrap items-center gap-3'>
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
                className='inline-flex h-11 items-center gap-2 rounded-xl bg-[#1c5a4a] px-5 text-sm font-semibold text-white no-underline shadow-sm transition hover:bg-[#14453a]'
              >
                <i className='fas fa-database text-xs' />
                <span>免费查海关数据</span>
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
                className='inline-flex h-11 items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 no-underline transition hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-stone-600'
              >
                <i className='fas fa-route text-xs text-[#1c5a4a] dark:text-[#6bc4a6]' />
                <span>图灵搜 + 顶易云怎么配合</span>
              </SmartLink>
            </div>

            {/* 5 秒看商机 AI 快查栏 */}
            <div className='mt-6 rounded-xl border border-stone-200/90 bg-[#faf9f6] p-3.5 dark:border-stone-800 dark:bg-[#151412]'>
              <form
                onSubmit={handleOpportunitySubmit}
                className='flex flex-col gap-2.5 sm:flex-row sm:items-center'
              >
                <div className='relative min-w-0 flex-1'>
                  <i className='fas fa-bolt pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#b97a52]' />
                  <input
                    name='product'
                    type='text'
                    value={productInput}
                    onChange={e => setProductInput(e.target.value)}
                    placeholder='输入产品词（如 LED 灯、轴承），AI 5 秒判断外贸商机…'
                    className='h-10 w-full rounded-lg border border-stone-200 bg-white pl-8 pr-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
                  />
                </div>
                <button
                  type='submit'
                  disabled={oppLoading}
                  className='inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-stone-900 px-4 text-xs font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white'
                >
                  {oppLoading ? 'AI 分析中…' : '5 秒看商机'}
                </button>
              </form>

              <div className='mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400'>
                <span>试试：</span>
                {QUICK_PRODUCTS.map(sample => (
                  <button
                    key={sample}
                    type='button'
                    onClick={() => {
                      setProductInput(sample)
                      void runOpportunityCheck(sample)
                    }}
                    className='rounded-md border border-stone-200 bg-white px-2 py-0.5 font-medium text-stone-600 transition hover:border-[#1c5a4a] hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#6bc4a6] dark:hover:text-[#6bc4a6]'
                  >
                    {sample}
                  </button>
                ))}
              </div>

              {oppLoading && (
                <div className='mt-3 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400'>
                  <span className='inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#1c5a4a] border-t-transparent' />
                  正在分析「{oppProduct}」的外贸进口与获客信号…
                </div>
              )}

              {oppError && (
                <div className='mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300'>
                  {oppError}
                </div>
              )}

              {oppResult && (
                <div className='mt-3 rounded-lg border border-[#c3d6cd] bg-[#e8f0ec]/70 px-3.5 py-3 dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/20'>
                  <div className='mb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                    AI 商机速判 · {oppProduct}
                  </div>
                  <div className='whitespace-pre-wrap break-words text-[13px] leading-6 text-stone-700 dark:text-stone-200'>
                    {oppResult}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：真实海关提单信号卡片预览 */}
          <div className='min-w-0 w-full rounded-2xl border border-stone-200/90 bg-[#faf9f6] p-4 dark:border-stone-800 dark:bg-[#151412] sm:p-5'>
            <div className='mb-4 flex items-center justify-between gap-2 border-b border-stone-200/80 pb-3 dark:border-stone-800'>
              <div className='min-w-0'>
                <div className='text-[10px] font-bold uppercase tracking-[0.16em] text-stone-400'>
                  BUYER SIGNAL PREVIEW
                </div>
                <div className='mt-0.5 text-sm font-bold text-stone-900 dark:text-stone-100'>
                  先查真实进口记录，再做开发
                </div>
              </div>
              <span className='shrink-0 rounded-full bg-[#e8f0ec] px-2.5 py-1 text-[10px] font-bold text-[#1c5a4a] dark:bg-[#1c5a4a]/30 dark:text-[#6bc4a6]'>
                真实提单案例
              </span>
            </div>

            <div className='min-w-0 overflow-hidden rounded-xl border border-stone-200/80 bg-white p-3.5 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17] sm:p-4'>
              <div className='flex items-start justify-between gap-2'>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-xs font-semibold text-stone-400'>
                    美国进口商 · 商业/工业 LED 照明
                  </div>
                  <div className='mt-0.5 truncate font-mono text-sm font-bold text-stone-900 dark:text-stone-100'>
                    COOPER LIGHTING SOLUTIONS LLC
                  </div>
                </div>
                <span className='shrink-0 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'>
                  活跃买家
                </span>
              </div>

              <div className='mt-3.5 grid grid-cols-3 gap-2 border-y border-stone-100 py-3 text-center dark:border-stone-800'>
                <div className='min-w-0'>
                  <div className='text-[10px] text-stone-400'>主力 HS</div>
                  <div className='mt-0.5 font-mono text-xs font-bold tabular-nums text-stone-800 dark:text-stone-200'>
                    9405.11
                  </div>
                </div>
                <div className='min-w-0'>
                  <div className='text-[10px] text-stone-400'>近 1 年记录</div>
                  <div className='mt-0.5 font-mono text-xs font-bold tabular-nums text-[#1c5a4a] dark:text-[#6bc4a6]'>
                    1,462 条
                  </div>
                </div>
                <div className='min-w-0'>
                  <div className='text-[10px] text-stone-400'>中国占比</div>
                  <div className='mt-0.5 font-mono text-xs font-bold tabular-nums text-stone-800 dark:text-stone-200'>
                    54.49%
                  </div>
                </div>
              </div>

              {/* 口径说明：占比按 2026 年 1–10 月 1,202 条计，与上方全年 1,462 条不同期 */}
              <p className='mt-1.5 text-[9px] leading-tight text-stone-400 dark:text-stone-500'>
                中国占比按 2026 年 1–10 月 1,202 条计
              </p>

              {/* 2025-11 至 2026-10 月度提单节奏微图（峰值 217 条） */}
              <div className='mt-3'>
                <div className='mb-1.5 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-stone-400'>
                  <span>2025-11 ~ 2026-10 月度提单</span>
                  <span className='font-mono tabular-nums text-stone-500 dark:text-stone-300'>
                    月均 ~122 条
                  </span>
                </div>
                <div className='flex h-8 items-end gap-1' aria-hidden='true'>
                  {[43, 217, 168, 118, 87, 124, 122, 119, 137, 145, 46, 136].map((val, idx) => (
                    <div
                      key={idx}
                      title={`${val} 条`}
                      className={`flex-1 rounded-t-xs transition-colors ${
                        val >= 160
                          ? 'bg-[#1c5a4a] dark:bg-[#6bc4a6]'
                          : 'bg-[#1c5a4a]/35 dark:bg-[#6bc4a6]/35'
                      }`}
                      style={{ height: `${Math.max(18, Math.round((val / 217) * 100))}%` }}
                    />
                  ))}
                </div>
              </div>

              <div className='mt-3 flex items-center justify-between gap-2 border-t border-stone-100 pt-2.5 text-[11px] text-stone-500 dark:border-stone-800 dark:text-stone-400'>
                <span className='min-w-0 truncate'>供货来源 16 国 · 含整灯与零部件</span>
                <a
                  href='/cooper-lighting-solutions-customs-data.html'
                  className='shrink-0 font-semibold text-[#1c5a4a] no-underline hover:underline dark:text-[#6bc4a6]'
                >
                  看完整拆解 →
                </a>
              </div>
            </div>

            <div className='mt-4 grid grid-cols-3 gap-2 text-center'>
              {[
                { step: '01', label: '查进口商' },
                { step: '02', label: '验采购力' },
                { step: '03', label: '精准跟进' }
              ].map(s => (
                <div
                  key={s.step}
                  className='min-w-0 rounded-lg border border-stone-200/70 bg-white px-1.5 py-2 dark:border-stone-800 dark:bg-[#1c1a17] sm:px-2'
                >
                  <div className='font-mono text-[10px] font-bold text-[#b97a52]'>
                    {s.step}
                  </div>
                  <div className='mt-0.5 text-xs font-semibold text-stone-800 dark:text-stone-200'>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 列核心专题 Bento 入口 */}
      <div className='mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4'>
        {topics.map(topic => {
          const TopicLink = topic.href?.endsWith('.html') ? 'a' : SmartLink
          return (
            <TopicLink
              key={topic.name}
              href={topic.href}
              className='group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#1c5a4a]/45 hover:shadow-md dark:border-stone-800 dark:bg-[#1c1a17] dark:hover:border-[#3fa383]/50'
            >
              <div>
                <div className='mb-3 flex items-center justify-between'>
                  <span className='flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8f0ec] text-sm text-[#1c5a4a] transition-colors group-hover:bg-[#1c5a4a] group-hover:text-white dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
                    <i className={`fas ${topic.icon}`} />
                  </span>
                  {topic.count && (
                    <span className='rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-stone-500 dark:bg-stone-800 dark:text-stone-400'>
                      {topic.count} 篇
                    </span>
                  )}
                </div>
                <h2 className='text-[15px] font-bold text-stone-900 transition-colors group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6]'>
                  {topic.name}
                </h2>
                <p className='mt-1.5 text-xs leading-6 text-stone-500 dark:text-stone-400'>
                  {topic.description}
                </p>
              </div>
              <div className='mt-3 text-xs font-semibold text-stone-400 transition-colors group-hover:text-[#1c5a4a] dark:group-hover:text-[#6bc4a6]'>
                进入专题 →
              </div>
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
  '海关数据、客户开发、报价与单据、收款与风险——把外贸一线的问题拆成能直接照做的动作。先用数据找到真的在进口你产品的公司，再把单子跟到收款。'

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
