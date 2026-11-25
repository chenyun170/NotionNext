import BLOG from '@/blog.config'
import Link from 'next/link'
import SocialButton from './SocialButton'

const SECTIONS = [
  {
    title: '核心专题',
    links: [
      { label: '海关数据专题', href: '/customs-data.html' },
      { label: '美国进口商查询', href: '/us-importers.html' },
      { label: '供应商关系分析', href: '/supplier-analysis.html' },
      { label: '工具搭配与对比', href: '/foreign-trade-tools.html' }
    ]
  },
  {
    title: '实用入口',
    links: [
      { label: '外贸工具导航', href: '/tools.html' },
      { label: 'OraAgent 桌面端', href: '/oragent.html' },
      { label: '开发信轻诊断', href: '/diagnose' },
      { label: '时间归档', href: '/archive' }
    ]
  },
  {
    title: '关于本站',
    links: [
      { label: '关于我们', href: '/about.html' },
      { label: '常见问题', href: '/faq.html' },
      { label: '内容方法', href: '/methodology.html' },
      { label: '站点地图', href: '/sitemap.xml' }
    ]
  }
]

const SiteFooter = () => {
  const since = BLOG.SINCE || '2021'
  const year = new Date().getFullYear()

  return (
    <footer className='mt-16 w-full border-t border-stone-200/80 bg-[#f2efe9]/60 dark:border-stone-800/80 dark:bg-[#161412]'>
      <div className='mx-auto w-full max-w-6xl px-4 pb-24 pt-12 sm:px-6 lg:pb-14'>
        <div className='flex flex-col gap-10 md:flex-row md:items-start md:justify-between'>
          <div className='max-w-xs'>
            <Link
              href='/'
              className='inline-flex items-center gap-2 text-base font-bold tracking-tight text-stone-900 no-underline dark:text-stone-100'
            >
              <span className='h-2 w-2 rounded-full bg-[#1c5a4a]' />
              外贸获客情报局
            </Link>
            <p className='mt-3 text-xs leading-6 text-stone-500 dark:text-stone-400'>
              用海关数据、进口商记录和供应商关系，判断谁真的在采购，再把精力放在能成交的客户上。
            </p>
            <div className='mt-4 flex justify-start'>
              <SocialButton />
            </div>
          </div>

          <div className='grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-3'>
            {SECTIONS.map(section => (
              <div key={section.title}>
                <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400 dark:text-stone-500'>
                  {section.title}
                </div>
                <ul className='space-y-2'>
                  {section.links.map(link => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className='block text-[13px] leading-5 text-stone-600 no-underline transition-colors hover:text-[#1c5a4a] dark:text-stone-400 dark:hover:text-[#6bc4a6]'
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className='mt-10 flex flex-col gap-2 border-t border-stone-200/80 pt-6 text-xs text-stone-400 dark:border-stone-800 dark:text-stone-500 sm:flex-row sm:items-center sm:justify-between'>
          <span>
            © {since}–{year} 外贸获客情报局 · 123170.xyz
          </span>
          <div className='flex items-center gap-5'>
            <a
              href='/rss/feed.xml'
              className='no-underline transition-colors hover:text-stone-700 dark:hover:text-stone-200'
            >
              RSS 订阅
            </a>
            <a
              href='/llms.txt'
              className='no-underline transition-colors hover:text-stone-700 dark:hover:text-stone-200'
            >
              llms.txt
            </a>
            <a
              href='/sitemap.xml'
              className='no-underline transition-colors hover:text-stone-700 dark:hover:text-stone-200'
            >
              站点地图
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default SiteFooter
