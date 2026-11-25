import Collapse from '@/components/Collapse'
import dynamic from 'next/dynamic'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useGlobal } from '@/lib/global'
import { getActiveToolPromotions } from '@/lib/promo/toolPromotions'
import {
  trackCustomsDataSkillClick,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

const SidebarTools = dynamic(() => import('./SidebarTools'), {
  ssr: false,
  loading: () => null
})

/**
 * 移动端顶部导航（含自动切换的活动/试用软推条 + 阅读进度条 + 折叠菜单与工具台）
 */
const Header = props => {
  const { isDarkMode, toggleDarkMode } = useGlobal()
  const [isOpen, changeShow] = useState(false)
  const [showToolsInMenu, setShowToolsInMenu] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [promoData, setPromoData] = useState(() => getActiveToolPromotions())
  const [isSearchActive, setSearchActive] = useState(false)
  const collapseRef = useRef(null)
  const searchInputRef = useRef(null)
  const throttleRef = useRef(null)

  useEffect(() => {
    const syncPromos = () => setPromoData(getActiveToolPromotions())
    syncPromos()
    const timer = setInterval(syncPromos, 60000)
    return () => clearInterval(timer)
  }, [])

  const updateScrollProgress = useCallback(() => {
    const currentScrollY = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    if (scrollHeight > 0) {
      setScrollProgress(Math.min((currentScrollY / scrollHeight) * 100, 100))
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (throttleRef.current) return
      throttleRef.current = true
      updateScrollProgress()
      setTimeout(() => {
        throttleRef.current = false
      }, 16)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateScrollProgress])

  const toggleMenuOpen = () => {
    const nextOpen = !isOpen
    changeShow(nextOpen)
    if (!nextOpen) {
      setSearchActive(false)
    }
  }

  const openSearch = () => {
    setSearchActive(true)
    changeShow(true)
    window.setTimeout(() => searchInputRef.current?.focus?.(), 120)
  }

  return (
    <div id='top-nav' className='sticky top-0 z-50 block lg:hidden'>
      {/* 1. 顶部活动 / 软件试用软推条 */}
      {promoData?.bannerItems?.length > 0 && (
        <div className='border-b border-stone-200/80 bg-[#f2efe9] px-3 py-1.5 text-stone-700 dark:border-stone-800 dark:bg-[#1a1815] dark:text-stone-200'>
          <div className='no-scrollbar flex items-center gap-2 overflow-x-auto'>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                promoData.hasLiveCampaign
                  ? 'bg-[#b97a52]/15 text-[#9a5833] dark:text-[#e8c9a8]'
                  : 'bg-[#1c5a4a]/10 text-[#1c5a4a] dark:text-[#6bc4a6]'
              }`}
            >
              {promoData.hasLiveCampaign ? '限时活动' : '软件试用'}
            </span>
            {promoData.bannerItems.map(item => (
              <a
                key={item.id}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'sponsored noopener noreferrer' : undefined}
                onClick={() => {
                  if (item.id === 'oraskl') {
                    trackCustomsDataSkillClick(`mobile_${item.trackSource}`)
                  } else {
                    trackToolOutboundClick({
                      source: `mobile_${item.trackSource}`,
                      target: item.href,
                      tool: item.tool,
                      sourceGroup: 'activity'
                    })
                  }
                }}
                className='inline-flex shrink-0 items-center gap-1 rounded-full border border-stone-200/90 bg-white px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 no-underline dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
              >
                <span>{item.bannerShortText}</span>
                <i className='fas fa-arrow-right text-[9px] text-[#1c5a4a] dark:text-[#6bc4a6]' />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 2. 移动端导航主体 */}
      <div
        id='sticky-nav'
        className='relative w-full border-b border-stone-200/80 bg-[#f7f5f1]/95 backdrop-blur-md dark:border-stone-800 dark:bg-[#131210]/95'
      >
        <div className='flex w-full items-center justify-between px-3.5 py-2.5'>
          <div className='flex-none'>
            <Logo {...props} compact />
          </div>
          <div className='flex items-center justify-end gap-1 dark:text-stone-200'>
            <button
              type='button'
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? '切换日间模式' : '切换夜间模式'}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 transition-colors hover:bg-stone-200/60 dark:text-stone-300 dark:hover:bg-stone-800'
            >
              <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-sm`} />
            </button>
            <button
              type='button'
              onClick={openSearch}
              aria-label='打开搜索'
              className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-stone-200/60 dark:hover:bg-stone-800 ${
                isSearchActive && isOpen
                  ? 'bg-[#e8f0ec] text-[#1c5a4a] dark:bg-[#1c5a4a]/30 dark:text-[#6bc4a6]'
                  : 'text-stone-600 dark:text-stone-200'
              }`}
            >
              <i className='fas fa-search text-sm' />
            </button>
            <button
              type='button'
              aria-label={isOpen ? '关闭菜单' : '打开菜单'}
              onClick={toggleMenuOpen}
              className='flex h-9 w-9 items-center justify-center rounded-lg text-lg text-stone-700 transition-colors hover:bg-stone-200/60 dark:text-stone-200 dark:hover:bg-stone-800'
            >
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </button>
          </div>
        </div>

        {/* 3. 阅读进度条 */}
        <div className='absolute bottom-0 left-0 h-[2px] w-full overflow-hidden bg-stone-200/60 dark:bg-stone-800'>
          <div
            className='h-full bg-[#1c5a4a] transition-all duration-150 ease-out dark:bg-[#6bc4a6]'
            style={{ width: `${scrollProgress}%`, willChange: 'width' }}
          />
        </div>

        {/* 4. 折叠菜单 */}
        <Collapse type='vertical' isOpen={isOpen} collapseRef={collapseRef}>
          <div className='max-h-[76vh] overflow-y-auto border-b border-stone-200 bg-white px-4 pb-5 pt-3 shadow-xl dark:border-stone-800 dark:bg-[#1c1a17]'>
            <div className='mb-4 rounded-xl border border-stone-200 bg-stone-50 p-2 dark:border-stone-800 dark:bg-stone-900'>
              <SearchInput {...props} cRef={searchInputRef} />
            </div>

            <div className='mb-3 flex items-center justify-between px-1'>
              <span className='text-[11px] font-bold uppercase tracking-[0.16em] text-stone-400'>
                站内导航
              </span>
              <button
                type='button'
                onClick={() => setShowToolsInMenu(prev => !prev)}
                className='inline-flex items-center gap-1 rounded-md border border-stone-200 px-2 py-1 text-[11px] font-semibold text-[#1c5a4a] dark:border-stone-700 dark:text-[#6bc4a6]'
              >
                <i className='fas fa-calculator text-[10px]' />
                {showToolsInMenu ? '收起工具台' : '外贸工具台'}
              </button>
            </div>

            {showToolsInMenu && (
              <div className='mb-4 rounded-xl border border-stone-200 bg-stone-50 p-2.5 dark:border-stone-800 dark:bg-stone-900'>
                <SidebarTools />
              </div>
            )}

            <MenuList
              {...props}
              onHeightChange={param =>
                collapseRef.current?.updateCollapseHeight(param)
              }
            />
          </div>
        </Collapse>
      </div>
    </div>
  )
}

export default Header
