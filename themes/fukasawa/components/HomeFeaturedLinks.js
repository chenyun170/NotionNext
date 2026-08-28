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
      <div className='flex min-w-0 flex-col gap-2 rounded-[8px] border border-stone-200 bg-white/75 px-3 py-3 shadow-sm dark:border-stone-800 dark:bg-stone-900/85 sm:flex-row sm:items-center'>
        <div className='flex shrink-0 items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400'>
          <i className='fas fa-compass text-stone-400 dark:text-stone-500' />
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
                    ? 'border-stone-200 bg-stone-100 text-stone-700 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/60 dark:text-stone-300 dark:hover:border-stone-700'
                    : 'border-stone-200 bg-transparent text-stone-700 hover:border-stone-300 hover:bg-white hover:text-stone-900 dark:border-stone-800 dark:bg-transparent dark:text-stone-300 dark:hover:border-stone-600 dark:hover:bg-transparent dark:hover:text-stone-100'
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
                className={`${item.showOnMobile ? 'inline-flex' : 'hidden sm:inline-flex'} h-9 shrink-0 items-center rounded-full border border-stone-200 bg-white px-3 text-xs font-bold text-stone-500 transition hover:border-stone-300 hover:text-stone-900 dark:border-stone-800 dark:bg-transparent dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-stone-100`}>
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
