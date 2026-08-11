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

const ArticleNextActions = ({ post }) => {
  if (!post) {
    return null
  }

  const categoryHref = post?.category
    ? `/category/${encodeURIComponent(post.category)}`
    : '/archive'
  const visibleResourceLinks = resourceLinks.slice(0, 8)

  return (
    <section
      className='mt-12 overflow-hidden rounded-[8px] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-amber-50 p-4 print:hidden dark:border-amber-900/50 dark:from-amber-950/30 dark:via-[#1c1917] dark:to-amber-950/20 sm:p-6'
      aria-labelledby='article-next-actions-title'>
      <div className='mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300'>
        <i className='fas fa-route' />
        <span>下一步行动</span>
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center'>
        <div>
          <h2
            id='article-next-actions-title'
            className='text-2xl font-black leading-tight text-stone-950 dark:text-stone-50'>
            把这篇文章转成可执行的获客动作
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
            如果你正在判断产品、买家或供应商，可以先看海关数据专题，再用免费查询入口验证进口商、供应商和 HS 编码线索。
          </p>
        </div>

        <div className='grid gap-2'>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('article_skill_card')}
            className='inline-flex flex-col rounded-[8px] border border-amber-200 bg-white/85 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/50'>
            <span className='text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300'>
              海关数据工具入口
            </span>
            <span className='mt-1 text-sm font-black text-stone-950 dark:text-stone-50'>
              海关数据免费查询 Skill
            </span>
          </a>
          <a
            href='/customs-data.html'
            className='inline-flex h-10 items-center justify-center rounded-[8px] bg-stone-950 px-3 text-[13px] font-bold text-white transition hover:bg-amber-700 dark:bg-white dark:text-stone-950 dark:hover:bg-amber-300 sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-layer-group mr-2 text-xs' />
            看海关数据专题
          </a>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('article_next_actions')}
            className='inline-flex h-10 items-center justify-center rounded-[8px] border border-amber-200 bg-white/80 px-3 text-[13px] font-bold text-amber-700 transition hover:border-amber-300 hover:bg-amber-50 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/50 sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-database mr-2 text-xs' />
            免费查海关数据
          </a>
          <SmartLink
            href={categoryHref}
            className='inline-flex h-10 items-center justify-center rounded-[8px] border border-stone-200 bg-white/70 px-3 text-[13px] font-bold text-stone-700 transition hover:border-stone-300 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-950/30 dark:text-stone-200 dark:hover:text-white sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-compass mr-2 text-xs' />
            继续看相关主题
          </SmartLink>
        </div>
      </div>

      <div className='mt-5 border-t border-amber-100 pt-4 dark:border-amber-900/50'>
        <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-400'>
          继续阅读
        </div>
        <div className='grid gap-2 sm:grid-cols-2'>
          {visibleResourceLinks.map(resource => (
            <a
              key={resource.href}
              href={resource.href}
              className='group rounded-[8px] border border-stone-200 bg-white/80 p-3 transition hover:border-amber-300 hover:bg-amber-50 dark:border-stone-800 dark:bg-stone-950/30 dark:hover:border-amber-700 dark:hover:bg-amber-950/30'>
              <span className='text-sm font-black text-stone-900 group-hover:text-amber-700 dark:text-stone-50 dark:group-hover:text-amber-300'>
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
