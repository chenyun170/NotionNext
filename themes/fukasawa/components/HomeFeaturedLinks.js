import SmartLink from '@/components/SmartLink'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const primaryLinks = [
  {
    title: '海关数据免费查询',
    href: '/customs-data-skill.html',
    icon: 'fa-database',
    primary: true,
    track: 'home_featured_customs_skill'
  },
  {
    title: '图灵搜 + 海关数据',
    href: '/turingsearch-customs-data-lead-validation.html',
    icon: 'fa-search'
  },
  {
    title: '顶易云 + 海关数据',
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
    <section className='mx-auto mb-5 w-full max-w-[calc(100vw-2rem)] sm:max-w-full'>
      <div className='flex min-w-0 flex-col gap-2 rounded-[8px] border border-zinc-200 bg-white/75 px-3 py-3 shadow-sm dark:border-zinc-800 dark:bg-[#111113]/70 sm:flex-row sm:items-center'>
        <div className='flex shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400'>
          <i className='fas fa-compass text-blue-600 dark:text-blue-300' />
          <span>延伸路径</span>
        </div>

        <div className='flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0'>
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
                className={`group inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-3 text-xs font-bold transition ${
                  item.primary
                    ? 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:border-blue-700'
                    : 'border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:border-blue-200 hover:bg-blue-50/70 hover:text-blue-700 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/20 dark:hover:text-blue-300'
                }`}
              >
                <i className={`fas ${item.icon} text-[11px]`} />
                {item.title}
              </LinkComponent>
            )
          })}

          {secondaryLinks.map(item => {
            const LinkComponent = item.href?.endsWith('.html') ? 'a' : SmartLink

            return (
              <LinkComponent
                key={item.href}
                href={item.href}
                className='inline-flex h-9 shrink-0 items-center rounded-full border border-zinc-200 bg-white px-3 text-xs font-bold text-zinc-500 transition hover:border-blue-300 hover:text-blue-700 dark:border-zinc-800 dark:bg-[#111113] dark:text-zinc-400 dark:hover:border-blue-700 dark:hover:text-blue-300'>
                <i className={`fas ${item.icon} mr-2 text-[11px]`} />
                {item.title}
              </LinkComponent>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HomeFeaturedLinks
