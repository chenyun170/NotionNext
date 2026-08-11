import SmartLink from '@/components/SmartLink'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const primaryLinks = [
  {
    title: '免费查海关数据',
    href: '/customs-data-skill.html',
    icon: 'fa-database',
    primary: true,
    track: 'home_featured_customs_skill'
  },
  {
    title: '图灵搜线索验证',
    href: '/turingsearch-customs-data-lead-validation.html',
    icon: 'fa-search'
  },
  {
    title: '顶易云线索验证',
    href: '/dingyiyun-customs-data-lead-validation.html',
    icon: 'fa-cloud'
  }
]

const secondaryLinks = [
  {
    title: '工具怎么搭配',
    href: '/foreign-trade-tools.html',
    icon: 'fa-route',
    showOnMobile: true
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
      <div className='flex min-w-0 flex-col gap-2 rounded-[8px] border border-stone-200 bg-white/75 px-3 py-3 shadow-sm dark:border-stone-800 dark:bg-[#1c1917]/70 sm:flex-row sm:items-center'>
        <div className='flex shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400'>
          <i className='fas fa-compass text-amber-600 dark:text-amber-300' />
          <span>接着看</span>
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
                    ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:border-amber-700'
                    : 'border-stone-200 bg-stone-50/70 text-stone-700 hover:border-amber-200 hover:bg-amber-50/70 hover:text-amber-700 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-300 dark:hover:border-amber-800 dark:hover:bg-amber-950/20 dark:hover:text-amber-300'
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
                className={`${item.showOnMobile ? 'inline-flex' : 'hidden sm:inline-flex'} h-9 shrink-0 items-center rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-stone-500 transition hover:border-amber-300 hover:text-amber-700 dark:border-stone-800 dark:bg-[#1c1917] dark:text-stone-400 dark:hover:border-amber-700 dark:hover:text-amber-300`}>
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
