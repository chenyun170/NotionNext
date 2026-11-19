'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const LINKS = [
  { label: '海关数据', href: '/customs-data.html' },
  { label: '美国进口商', href: '/us-importers.html' },
  { label: '工具导航', href: '/tools.html' },
  { label: '常见问题', href: '/faq.html' },
  { label: '关于本站', href: '/about.html' }
]

/**
 * 桌面端顶部导航：滚动后出现，避免侧栏收起后没有任何入口
 */
const DesktopTopNav = ({ reverse = false }) => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 260)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const position = reverse
    ? 'left-0 right-[var(--fuka-sidebar-w,20rem)]'
    : 'left-[var(--fuka-sidebar-w,20rem)] right-0'

  return (
    <div
      className={`fixed top-0 ${position} z-[60] hidden border-b border-stone-200/80 bg-[#f7f5f1]/92 backdrop-blur-md transition-transform duration-300 dark:border-stone-900 dark:bg-[#161412]/92 lg:block ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className='mx-auto flex h-12 w-full max-w-5xl items-center justify-between gap-6 px-6'>
        <Link
          href='/'
          className='flex items-center gap-2 text-[13px] font-black tracking-tight text-stone-900 no-underline dark:text-stone-100'
        >
          <span className='flex h-6 w-6 items-center justify-center rounded-full bg-stone-900 text-[10px] font-bold text-white dark:bg-stone-100 dark:text-stone-900'>
            获
          </span>
          外贸获客情报局
        </Link>

        <nav className='flex items-center gap-1'>
          {LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className='rounded-md px-3 py-2 text-[13px] font-medium text-stone-600 no-underline transition-colors hover:bg-stone-200/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/60 dark:hover:text-stone-50'
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default DesktopTopNav
