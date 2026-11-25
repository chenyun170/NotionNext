import SmartLink from '@/components/SmartLink'
import { trackCustomsDataSkillClick } from '@/lib/utils/customsDataSkillTracking'

const QUICK_ROUTES = [
  {
    title: 'OraSkl 免费查海关数据',
    href: '/customs-data-skill.html',
    icon: 'fa-database',
    highlight: true,
    track: 'home_featured_customs_skill'
  },
  {
    title: '图灵搜线索怎么验证',
    href: '/turingsearch-customs-data-lead-validation.html',
    icon: 'fa-search'
  },
  {
    title: '顶易云线索怎么验证',
    href: '/dingyiyun-customs-data-lead-validation.html',
    icon: 'fa-cloud'
  },
  {
    title: 'OraAgent 桌面 AI 专家团',
    href: '/oragent.html',
    icon: 'fa-robot'
  },
  {
    title: '买家质量判断案例',
    href: '/customs-data-buyer-quality-example.html',
    icon: 'fa-clipboard-check'
  }
]

const HomeFeaturedLinks = () => {
  return (
    <section className='mb-8 w-full'>
      <div className='flex flex-col gap-2.5 rounded-2xl border border-stone-200/80 bg-white/80 px-4 py-3 dark:border-stone-800 dark:bg-[#1c1a17]/80 sm:flex-row sm:items-center'>
        <div className='flex shrink-0 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400'>
          <i className='fas fa-compass text-[#1c5a4a] dark:text-[#6bc4a6]' />
          <span>快捷入口</span>
        </div>

        <div className='no-scrollbar flex flex-1 gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible'>
          {QUICK_ROUTES.map(item => {
            const LinkComponent = item.href?.endsWith('.html') ? 'a' : SmartLink
            const trackProps = item.track
              ? { onClick: () => trackCustomsDataSkillClick(item.track) }
              : {}

            return (
              <LinkComponent
                key={item.href}
                href={item.href}
                {...trackProps}
                className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold no-underline transition ${
                  item.highlight
                    ? 'border-[#c3d6cd] bg-[#e8f0ec] text-[#1c5a4a] hover:bg-[#1c5a4a] hover:text-white dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <i className={`fas ${item.icon} text-[10px]`} />
                <span>{item.title}</span>
              </LinkComponent>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default HomeFeaturedLinks
