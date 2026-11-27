'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'
import { CUSTOMS_DATA_SKILL } from '@/lib/utils/customsDataSkill'
import { getActiveToolPromotions } from '@/lib/promo/toolPromotions'
import {
  trackCustomsDataSkillClick,
  trackSiteInteraction,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'
import Logo from './Logo'
import SearchInput from './SearchInput'

const SidebarTools = dynamic(() => import('./SidebarTools'), {
  ssr: false,
  loading: () => (
    <div className='flex h-36 items-center justify-center text-xs text-stone-400'>
      工具台加载中…
    </div>
  )
})

const TOP_BANNER_DISMISS_KEY = 'fukasawa_top_promo_dismissed_at'
const TOP_BANNER_DISMISS_MS = 24 * 60 * 60 * 1000

const NAV_LINKS = [
  { label: '首页', href: '/' },
  { label: '海关数据', href: '/customs-data.html' },
  { label: '工具导航', href: '/tools.html' },
  { label: 'OraAgent', href: '/oragent.html' },
  { label: '轻诊断', href: '/diagnose' },
  { label: '归档', href: '/archive' }
]

/**
 * 桌面端常驻顶部导航栏（含活动/试用软推通知条 + 外贸工具箱弹出面板 + 搜索）
 */
const DesktopTopNav = props => {
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [promoData, setPromoData] = useState(() => getActiveToolPromotions())
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const toolsRef = useRef(null)
  const searchBoxRef = useRef(null)
  const searchInputRef = useRef(null)

  useEffect(() => {
    try {
      const dismissedAt = Number(
        window.localStorage.getItem(TOP_BANNER_DISMISS_KEY)
      )
      if (dismissedAt && Date.now() - dismissedAt < TOP_BANNER_DISMISS_MS) {
        setBannerDismissed(true)
      }
    } catch {
      // ignore storage errors
    }

    const syncPromos = () => setPromoData(getActiveToolPromotions())
    const timer = setInterval(syncPromos, 60000)
    return () => clearInterval(timer)
  }, [])

  // 点击外部关闭工具箱或搜索弹层；支持 Cmd/Ctrl+K 快速打开搜索
  useEffect(() => {
    const onClickOutside = e => {
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false)
      }
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    const onKeyDown = e => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(prev => {
          const next = !prev
          if (next) {
            setTimeout(() => searchInputRef.current?.focus?.(), 60)
          }
          return next
        })
      }
      if (e.key === 'Escape') {
        setToolsOpen(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', onClickOutside)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const dismissBanner = () => {
    setBannerDismissed(true)
    trackSiteInteraction({
      source: 'top_promo_dismiss',
      sourceGroup: 'activity',
      action: 'dismiss_activity_ad'
    })
    try {
      window.localStorage.setItem(TOP_BANNER_DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore storage errors
    }
  }

  const toggleSearch = () => {
    setToolsOpen(false)
    setSearchOpen(prev => {
      const next = !prev
      if (next) {
        setTimeout(() => searchInputRef.current?.focus?.(), 60)
      }
      return next
    })
  }

  return (
    <header className='sticky top-0 z-[60] hidden w-full md:block'>
      {/* 1. 顶部活动/试用软推通知条（自动随截止时间切换） */}
      {!bannerDismissed && promoData?.bannerItems?.length > 0 && (
        <div className='border-b border-stone-200/80 bg-[#f2efe9] text-xs text-stone-700 dark:border-stone-800 dark:bg-[#1a1815] dark:text-stone-300'>
          <div className='mx-auto flex h-8 max-w-6xl items-center justify-between gap-4 px-6'>
            <div className='flex min-w-0 items-center gap-3 overflow-hidden'>
              <span
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  promoData.hasLiveCampaign
                    ? 'bg-[#b97a52]/15 text-[#9a5833] dark:bg-[#d29a63]/20 dark:text-[#e8c9a8]'
                    : 'bg-[#1c5a4a]/10 text-[#1c5a4a] dark:bg-[#1c5a4a]/30 dark:text-[#6bc4a6]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    promoData.hasLiveCampaign ? 'bg-[#b97a52]' : 'bg-[#1c5a4a]'
                  }`}
                />
                {promoData.hasLiveCampaign ? '限时活动' : '软件试用'}
              </span>

              <div className='flex min-w-0 items-center gap-4 truncate'>
                {promoData.bannerItems.map((item, idx) => (
                  <a
                    key={item.id}
                    href={item.href}
                    target={item.isExternal ? '_blank' : undefined}
                    rel={item.isExternal ? 'sponsored noopener noreferrer' : undefined}
                    onClick={() => {
                      if (item.id === 'oraskl') {
                        trackCustomsDataSkillClick(item.trackSource)
                      } else {
                        trackToolOutboundClick({
                          source: item.trackSource,
                          target: item.href,
                          tool: item.tool,
                          sourceGroup: 'activity'
                        })
                      }
                    }}
                    className='inline-flex items-center gap-1.5 truncate font-medium text-stone-700 no-underline transition-colors hover:text-[#1c5a4a] dark:text-stone-300 dark:hover:text-[#6bc4a6]'
                  >
                    {idx > 0 && (
                      <span className='mr-2 text-stone-300 dark:text-stone-700'>|</span>
                    )}
                    <span className='truncate'>{item.bannerText}</span>
                    <span className='shrink-0 font-semibold text-[#1c5a4a] dark:text-[#6bc4a6]'>
                      {item.cta} →
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <button
              type='button'
              onClick={dismissBanner}
              aria-label='关闭顶部推荐条'
              className='shrink-0 rounded p-1 text-stone-400 transition hover:bg-stone-200/70 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200'
            >
              <i className='fas fa-times text-[10px]' />
            </button>
          </div>
        </div>
      )}

      {/* 2. 主导航栏 */}
      <div className='border-b border-stone-200/80 bg-[#f7f5f1]/90 backdrop-blur-md dark:border-stone-800/80 dark:bg-[#131210]/90'>
        <div className='mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 lg:gap-4 lg:px-6'>
          <div className='shrink-0'>
            <Logo {...props} />
          </div>

          <nav aria-label='主导航' className='flex flex-nowrap items-center gap-0.5 lg:gap-1'>
            {NAV_LINKS.map(item => {
              const isHtml = item.href.endsWith('.html')
              const Comp = isHtml ? 'a' : Link
              return (
                <Comp
                  key={item.href}
                  href={item.href}
                  className='whitespace-nowrap rounded-lg px-2 py-1.5 text-[13px] font-medium text-stone-600 no-underline transition-colors hover:bg-stone-200/60 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800/70 dark:hover:text-stone-50 lg:px-3 lg:py-2 lg:text-[13.5px]'
                >
                  {item.label}
                </Comp>
              )
            })}
          </nav>

          <div className='flex shrink-0 items-center gap-1.5 lg:gap-2'>
            {/* 搜索按钮 + 弹出搜索框 */}
            <div ref={searchBoxRef} className='relative'>
              <button
                type='button'
                onClick={toggleSearch}
                aria-label='站内搜索'
                className='inline-flex h-9 items-center gap-2 rounded-lg border border-stone-200/90 bg-white/80 px-2.5 text-xs font-medium text-stone-500 transition hover:border-stone-300 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-100'
              >
                <i className='fas fa-search text-[11px]' />
                <span className='hidden xl:inline'>搜索</span>
                <kbd className='hidden rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-400 dark:border-stone-700 dark:bg-stone-800 xl:inline'>
                  ⌘K
                </kbd>
              </button>

              {searchOpen && (
                <div className='absolute right-0 top-11 z-50 w-80 rounded-xl border border-stone-200 bg-white p-3 shadow-xl dark:border-stone-800 dark:bg-stone-900'>
                  <SearchInput {...props} cRef={searchInputRef} />
                </div>
              )}
            </div>

            {/* 外贸工具台弹出抽屉 */}
            <div ref={toolsRef} className='relative'>
              <button
                type='button'
                onClick={() => {
                  setSearchOpen(false)
                  setToolsOpen(prev => !prev)
                }}
                className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition ${
                  toolsOpen
                    ? 'border-[#1c5a4a] bg-[#e8f0ec] text-[#1c5a4a] dark:border-[#3fa383] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
                    : 'border-stone-200/90 bg-white/80 text-stone-700 hover:border-stone-300 hover:text-stone-950 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-300 dark:hover:border-stone-700'
                }`}
              >
                <i className='fas fa-calculator text-[11px]' />
                <span className='hidden lg:inline'>外贸工具台</span>
              </button>

              {toolsOpen && (
                <div className='absolute right-0 top-11 z-50 w-80 rounded-2xl border border-stone-200 bg-white p-3 shadow-2xl dark:border-stone-800 dark:bg-stone-900'>
                  <div className='mb-2 flex items-center justify-between px-1'>
                    <span className='text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                      外贸效率工具台
                    </span>
                    <button
                      type='button'
                      onClick={() => setToolsOpen(false)}
                      aria-label='关闭工具台'
                      className='text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                    >
                      <i className='fas fa-times text-xs' />
                    </button>
                  </div>
                  <SidebarTools />
                </div>
              )}
            </div>

            {/* 深浅模式切换 */}
            <button
              type='button'
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? '切换到日间模式' : '切换到夜间模式'}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200/90 bg-white/80 text-stone-500 transition hover:border-stone-300 hover:text-stone-900 dark:border-stone-800 dark:bg-stone-900/70 dark:text-stone-400 dark:hover:border-stone-700 dark:hover:text-stone-100'
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xs`} />
            </button>

            {/* 主 CTA */}
            <SmartLink
              href={CUSTOMS_DATA_SKILL.href}
              onClick={() => trackCustomsDataSkillClick('desktop_top_nav_cta')}
              className='inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-[#1c5a4a] px-2.5 text-xs font-semibold text-white no-underline shadow-xs transition hover:bg-[#14453a] lg:px-3.5'
            >
              <i className='fas fa-database text-[11px]' />
              <span className='hidden lg:inline'>免费查海关数据</span>
              <span className='lg:hidden'>查数据</span>
            </SmartLink>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DesktopTopNav
