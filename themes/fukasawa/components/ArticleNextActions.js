import SmartLink from '@/components/SmartLink'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const ArticleNextActions = ({ post }) => {
  if (!post) {
    return null
  }

  const categoryHref = post?.category
    ? `/category/${encodeURIComponent(post.category)}`
    : '/archive'

  return (
    <section
      className='mt-12 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 print:hidden dark:border-blue-900/50 dark:from-blue-950/30 dark:via-[#111113] dark:to-cyan-950/20 sm:p-6'
      aria-labelledby='article-next-actions-title'>
      <div className='mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300'>
        <i className='fas fa-route' />
        <span>下一步行动</span>
      </div>

      <div className='grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center'>
        <div>
          <h2
            id='article-next-actions-title'
            className='text-2xl font-black leading-tight text-zinc-950 dark:text-zinc-50'>
            把这篇文章转成可执行的获客动作
          </h2>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300'>
            如果你正在判断产品、买家或供应商，可以先看海关数据专题，再用免费查询入口验证进口商、供应商和 HS 编码线索。
          </p>
        </div>

        <div className='grid gap-2'>
          <a
            href='/customs-data.html'
            className='inline-flex h-10 items-center justify-center rounded-[10px] bg-zinc-950 px-3 text-[13px] font-bold text-white transition hover:bg-blue-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-blue-300 sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-layer-group mr-2 text-xs' />
            看海关数据专题
          </a>
          <a
            href={CUSTOMS_DATA_SKILL.href}
            onClick={() => trackCustomsDataSkillClick('article_next_actions')}
            className='inline-flex h-10 items-center justify-center rounded-[10px] border border-blue-200 bg-white/80 px-3 text-[13px] font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 dark:border-blue-900/70 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/50 sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-database mr-2 text-xs' />
            免费查海关数据
          </a>
          <SmartLink
            href={categoryHref}
            className='inline-flex h-10 items-center justify-center rounded-[10px] border border-zinc-200 bg-white/70 px-3 text-[13px] font-bold text-zinc-700 transition hover:border-zinc-300 hover:text-zinc-950 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-200 dark:hover:text-white sm:h-11 sm:px-4 sm:text-sm'>
            <i className='fas fa-compass mr-2 text-xs' />
            继续看相关主题
          </SmartLink>
        </div>
      </div>
    </section>
  )
}

export default ArticleNextActions
