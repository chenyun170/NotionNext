import SmartLink from '@/components/SmartLink'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const resourceLinks = [
  {
    title: '外贸工具对比',
    href: '/foreign-trade-tools.html',
    description: '图灵搜、顶易云、顶易相关产品服务和海关数据怎么配合。'
  },
  {
    title: '客户开发工具推荐',
    href: '/foreign-trade-lead-tools.html',
    description: '按线索、验证、触达和跟进搭建最小工具组合。'
  },
  {
    title: '海关数据找采购商',
    href: '/customs-data-find-buyers.html',
    description: '从关键词、HS 编码和供应商关系筛国外采购商。'
  },
  {
    title: '买家质量判断示例',
    href: '/customs-data-buyer-quality-example.html',
    description: '用匿名样例判断进口商是否值得开发。'
  },
  {
    title: '图灵搜工具观察',
    href: '/turingsearch.html',
    description: '把图灵搜放到线索发现和客户验证流程里看。'
  },
  {
    title: '图灵搜适用场景',
    href: '/turingsearch-foreign-trade-use-cases.html',
    description: '判断哪些外贸团队适合先用图灵搜扩展客户池。'
  },
  {
    title: '图灵搜和海关数据区别',
    href: '/turingsearch-vs-customs-data.html',
    description: '一个找线索，一个验证真实采购。'
  },
  {
    title: '图灵搜线索验证',
    href: '/turingsearch-customs-data-lead-validation.html',
    description: '图灵搜找到客户后，用海关数据判断开发优先级。'
  },
  {
    title: '顶易云工具观察',
    href: '/dingyiyun.html',
    description: '看顶易云如何配合海关数据和跟进流程。'
  },
  {
    title: '顶易云工作流',
    href: '/dingyiyun-foreign-trade-workflow.html',
    description: '把线索管理、海关验证和跟进复盘接起来。'
  },
  {
    title: '顶易云线索验证',
    href: '/dingyiyun-customs-data-lead-validation.html',
    description: '把顶易云客户池接上海关数据，再回流到跟进流程。'
  },
  {
    title: '顶易品牌观察',
    href: '/dingyi.html',
    description: '从品牌相关软件、客户开发和数据验证角度判断。'
  },
  {
    title: '数据来源与边界',
    href: '/data-sources-limitations.html',
    description: '说明海关数据和第三方工具观察的适用边界。'
  }
]

const getCategory = post =>
  Array.isArray(post?.category) ? post.category[0] : post?.category

const buildFocus = post => {
  const text = `${getCategory(post) || ''} ${post?.title || ''}`

  if (/海关|数据|进口|采购/.test(text)) {
    return {
      title: '下一步：把线索落到真实采购记录上',
      intro: '先确认这家公司是否真的在进口相关产品，再决定开发顺序。',
      showCustomsCta: true
    }
  }

  if (/物流|货代|运费|账单|单据|信用证|收款|报关|清关|电放|退税|收汇|核销/.test(text)) {
    return {
      title: '下一步：把这篇的节点对到自己的单子上',
      intro: '单据、费用和责任边界，最好在下一票货、下一笔款之前逐条核对。',
      showCustomsCta: false
    }
  }

  if (/政策|关税|合规|认证|反倾销/.test(text)) {
    return {
      title: '下一步：确认这条规则是否适用于你的产品',
      intro: '政策变化先落到 HS 编码、目的国和生效时间三件事上。',
      showCustomsCta: false
    }
  }

  if (/验货|质检|验厂|返工|不良|抽检|包装|唛头/.test(text)) {
    return {
      title: '下一步：把这批货的验收标准写进订单',
      intro: 'AQL、抽检比例、重验由谁出钱，最好在下单前和客户确认清楚。',
      showCustomsCta: false
    }
  }

  if (/报价|账期|付款|结算|议价|谈判|涨价|折扣|模具|开模|MOQ|定金/.test(text)) {
    return {
      title: '下一步：把这笔生意的条件逐条写下来',
      intro: '价格、账期、模具归属和交期，口头谈完就散了，落到报价单和合同才算数。',
      showCustomsCta: false
    }
  }

  if (/开发信|邮件|跟进|客户|获客|询盘|报价|样品/.test(text)) {
    return {
      title: '下一步：挑一个客户，本周走完一遍',
      intro: '选一个正在跟的客户，把文章里的做法套进去，看哪一步会卡住。',
      showCustomsCta: true
    }
  }

  return {
    title: '下一步',
    intro: '把文章里的判断标准对着自己的业务过一遍，留下能直接执行的部分。',
    showCustomsCta: false
  }
}

const rotateLinks = (post, limit = 4) => {
  const seed = `${post?.slug || ''}${post?.title || ''}`
  const offset = seed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % resourceLinks.length
  return Array.from({ length: Math.min(limit, resourceLinks.length) }, (_, index) =>
    resourceLinks[(offset + index) % resourceLinks.length]
  )
}

const ArticleNextActions = ({ post }) => {
  if (!post) {
    return null
  }

  const category = getCategory(post)
  const categoryHref = category
    ? `/category/${encodeURIComponent(category)}`
    : '/archive'
  const focus = buildFocus(post)
  const visibleResourceLinks = rotateLinks(post)

  return (
    <section
      className='mt-12 overflow-hidden rounded-[8px] border border-stone-200 bg-stone-50 p-4 print:hidden dark:border-stone-800 dark:bg-stone-900/40 sm:p-6'
      aria-labelledby='article-next-actions-title'>
      <div className='mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
        <i className='fas fa-route' />
        <span>下一步行动</span>
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center'>
        <div>
          <h2
            id='article-next-actions-title'
            className='text-2xl font-black leading-tight text-stone-950 dark:text-stone-50'>
            {focus.title}
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
            {focus.intro}
          </p>
        </div>

        <div className='grid gap-2'>
          {focus.showCustomsCta ? (
            <>
              <a
                href={CUSTOMS_DATA_SKILL.href}
                onClick={() => trackCustomsDataSkillClick('article_skill_card')}
                className='inline-flex flex-col rounded-[8px] border border-stone-200 bg-white px-4 py-3 text-left transition hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-950/40 dark:hover:bg-stone-800/70'>
                <span className='text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
                  海关数据工具入口
                </span>
                <span className='mt-1 text-sm font-black text-stone-950 dark:text-stone-50'>
                  海关数据免费查询 Skill
                </span>
              </a>
              <a
                href='/customs-data.html'
                className='inline-flex h-10 items-center justify-center rounded-xl bg-[#1c5a4a] px-3 text-[13px] font-semibold text-white no-underline transition hover:bg-[#14453a] sm:h-11 sm:px-4 sm:text-sm'>
                <i className='fas fa-layer-group mr-2 text-xs' />
                看海关数据专题
              </a>
              <a
                href={CUSTOMS_DATA_SKILL.href}
                onClick={() => trackCustomsDataSkillClick('article_next_actions')}
                className='inline-flex h-10 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-[13px] font-semibold text-stone-800 no-underline transition hover:border-[#1c5a4a] hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 sm:h-11 sm:px-4 sm:text-sm'>
                <i className='fas fa-database mr-2 text-xs' />
                免费查海关数据
              </a>
            </>
          ) : (
            <>
              <SmartLink
                href={categoryHref}
                className='inline-flex h-10 items-center justify-center rounded-xl bg-[#1c5a4a] px-3 text-[13px] font-semibold text-white no-underline transition hover:bg-[#14453a] sm:h-11 sm:px-4 sm:text-sm'>
                <i className='fas fa-compass mr-2 text-xs' />
                继续看{category || '这个'}主题
              </SmartLink>
              <SmartLink
                href='/archive'
                className='inline-flex h-10 items-center justify-center rounded-[8px] border border-stone-200 bg-white/70 px-3 text-[13px] font-bold text-stone-700 transition hover:border-stone-300 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-950/30 dark:text-stone-200 dark:hover:text-white sm:h-11 sm:px-4 sm:text-sm'>
                <i className='fas fa-list mr-2 text-xs' />
                浏览全部文章
              </SmartLink>
            </>
          )}
        </div>
      </div>

      {focus.showCustomsCta && (
        <p className='mt-3 text-[11px] leading-5 text-stone-400 dark:text-stone-500'>
          推广说明：海关数据入口页含带推荐码的推广链接，通过它注册本站可能获得佣金，不影响文章里的判断标准。
        </p>
      )}

      <div className='mt-5 border-t border-stone-200 pt-4 dark:border-stone-800'>
        <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400'>
          相关专题
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {visibleResourceLinks.map(resource => (
            <a
              key={resource.href}
              href={resource.href}
              className='group rounded-[8px] border border-stone-200 bg-white p-3 transition hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-950/40 dark:hover:bg-stone-800/70'>
              <span className='text-sm font-black text-stone-900 group-hover:text-stone-800 dark:text-stone-50 dark:group-hover:text-stone-200'>
                {resource.title}
              </span>
              <span className='mt-1 block text-xs leading-5 text-stone-500 dark:text-stone-400'>
                {resource.description}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ArticleNextActions
