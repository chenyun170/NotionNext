import SmartLink from '@/components/SmartLink'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const primaryLinks = [
  {
    title: '海关数据免费查询',
    description: '先查谁在进口你的产品，再判断采购量、采购频率和供应商关系。',
    href: '/customs-data-skill.html',
    icon: 'fa-database',
    primary: true,
    track: 'home_featured_customs_skill'
  },
  {
    title: '图灵搜 + 海关数据',
    description: '图灵搜找到客户后，用海关数据判断谁值得优先开发。',
    href: '/turingsearch-customs-data-lead-validation.html',
    icon: 'fa-search'
  },
  {
    title: '顶易云 + 海关数据',
    description: '把线索管理、采购验证和开发跟进放到同一条流程里。',
    href: '/dingyiyun-customs-data-lead-validation.html',
    icon: 'fa-cloud'
  }
]

const secondaryLinks = [
  {
    title: '工具怎么选',
    href: '/foreign-trade-tools.html',
    icon: 'fa-route'
  },
  {
    title: '买家质量判断案例',
    href: '/customs-data-buyer-quality-example.html',
    icon: 'fa-clipboard-check'
  },
  {
    title: '关于本站',
    href: '/about.html',
    icon: 'fa-info-circle'
  }
]

const HomeFeaturedLinks = () => {
  return (
    <section className='mx-auto mb-8 w-full max-w-[calc(100vw-2rem)] sm:max-w-full'>
      <div className='mb-4 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-300'>
            Start Here
          </div>
          <h2 className='mt-1 break-words text-xl font-black leading-tight text-zinc-950 dark:text-zinc-50'>
            先从 3 条路径开始
          </h2>
        </div>
        <p className='max-w-md text-sm font-medium leading-6 text-zinc-600 dark:text-zinc-400'>
          新访客先走主路径，其他内容放到轻量入口里继续看。
        </p>
      </div>

      <div className='grid gap-3 lg:grid-cols-3'>
        {primaryLinks.map(item => {
          const LinkComponent = item.href?.endsWith('.html') ? 'a' : SmartLink
          const trackProps = item.track
            ? { onClick: () => trackCustomsDataSkillClick(item.track) }
            : {}

          return (
            <LinkComponent
              key={item.href}
              href={item.href}
              {...trackProps}
              className={`group flex min-h-[118px] min-w-0 gap-3 rounded-[8px] border p-4 transition ${
                item.primary
                  ? 'border-blue-200 bg-blue-50 hover:border-blue-300 dark:border-blue-900/60 dark:bg-blue-950/20 dark:hover:border-blue-700'
                  : 'border-zinc-200 bg-zinc-50/70 hover:border-blue-200 hover:bg-blue-50/70 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-blue-800 dark:hover:bg-blue-950/20'
              }`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] text-sm transition ${
                item.primary
                  ? 'bg-blue-700 text-white dark:bg-blue-400 dark:text-zinc-950'
                  : 'bg-white text-zinc-700 group-hover:bg-blue-700 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-300'
              }`}>
                <i className={`fas ${item.icon}`} />
              </span>
              <span className='min-w-0 max-w-[calc(100vw-7rem)] sm:max-w-none'>
                <strong className='block break-words text-base font-black leading-snug text-zinc-950 [overflow-wrap:anywhere] group-hover:text-blue-800 dark:text-zinc-50 dark:group-hover:text-blue-300'>
                  {item.title}
                </strong>
                <span className='mt-2 block break-all text-sm font-medium leading-6 text-zinc-600 [overflow-wrap:anywhere] dark:text-zinc-400'>
                  {item.description}
                </span>
              </span>
            </LinkComponent>
          )
        })}
      </div>

      <div className='mt-3 flex flex-wrap gap-2'>
        {secondaryLinks.map(item => {
          const LinkComponent = item.href?.endsWith('.html') ? 'a' : SmartLink

          return (
            <LinkComponent
              key={item.href}
              href={item.href}
              className='inline-flex h-9 items-center rounded-[8px] border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-600 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-[#111113] dark:text-zinc-300 dark:hover:border-blue-700 dark:hover:text-blue-300'>
              <i className={`fas ${item.icon} mr-2 text-[11px]`} />
              {item.title}
            </LinkComponent>
          )
        })}
      </div>
    </section>
  )
}

export default HomeFeaturedLinks
