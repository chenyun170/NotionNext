'use client'

import DarkModeButton from '@/components/DarkModeButton'
import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import CONFIG from '@/themes/fukasawa/config'
import { debounce } from 'lodash'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import Announcement from './Announcement'
import Catalog from './Catalog'
import GroupCategory from './GroupCategory'
import GroupTag from './GroupTag'
import Logo from './Logo'
import MailChimpForm from './MailChimpForm'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import SiteInfo from './SiteInfo'
import SocialButton from './SocialButton'
import Link from 'next/link'

/**
 * 侧边栏 - 精致重构版
 */
function AsideLeft(props) {
  const {
    tagOptions,
    currentTag,
    categoryOptions,
    currentCategory,
    post,
    slot,
    notice,
    latestPosts = [] 
  } = props
  const router = useRouter()
  const { fullWidth } = useGlobal()

  // --- 实时运行时间统计 ---
  const [runtime, setRuntime] = useState('')
  const START_TIME = '2024-05-01'

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(START_TIME)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setRuntime(`${days}天${hours}时${minutes}分${seconds}秒`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT =
    fullWidth ||
    siteConfig('FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT', null, CONFIG)

  const FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL = siteConfig(
    'FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL',
    false,
    CONFIG
  )

  const FUKASAWA_SIDEBAR_COLLAPSE_BUTTON = siteConfig(
    'FUKASAWA_SIDEBAR_COLLAPSE_BUTTON',
    null,
    CONFIG
  )

  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('fukasawa-sidebar-collapse') === 'true' ||
        FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT
      )
    }
    return FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT
  })

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('fukasawa-sidebar-collapse', isCollapsed)
    }
  }, [isCollapsed])

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const position = useMemo(() => {
    if (isCollapsed) {
      return isReverse ? 'right-2' : 'left-2'
    } else {
      return isReverse ? 'right-80' : 'left-80'
    }
  }, [isCollapsed])

  const toggleOpen = () => {
    setIsCollapse(!isCollapsed)
  }

  useEffect(() => {
    if (!FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL) return
    const handleResize = debounce(() => {
      if (window.innerWidth < 1366 || window.scrollY >= 1366) {
        setIsCollapse(true)
      } else {
        setIsCollapse(false)
      }
    }, 100)

    if (post) {
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize, { passive: true })
    }

    return () => {
      if (post) {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize, { passive: true })
      }
    }
  }, [])

  return (
    <div
      className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#121212] min-h-screen hidden lg:block z-20 border-r border-gray-50 dark:border-gray-900`}>
      
      {FUKASAWA_SIDEBAR_COLLAPSE_BUTTON && (
        <div
          className={`${position} hidden lg:block fixed top-4 cursor-pointer z-50 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full shadow-lg p-2.5 hover:scale-110 duration-300 dark:text-white border border-gray-100 dark:border-gray-800`}
          onClick={toggleOpen}>
          {isCollapsed ? (
            <i className='fa-solid fa-indent text-lg'></i>
          ) : (
            <i className='fas fa-chevron-left text-lg'></i>
          )}
        </div>
      )}

      <div className={`h-full ${isCollapsed ? 'hidden' : 'px-9 py-10'} flex flex-col`}>
        {/* Logo & Info */}
        <div className="shimmer-logo-wrapper mb-2">
            <Logo {...props} />
        </div>

        <section className='siteInfo dark:text-gray-400 text-[13px] italic opacity-70 leading-relaxed mb-8'>
          {siteConfig('DESCRIPTION')}
        </section>

        {/* 1. 导航菜单 (精致化) */}
        <section className='menu-nav-wrapper flex flex-col mb-8'>
          <div className='flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4'>
            <span className='mr-2'>Navigation</span>
            <div className='flex-grow border-b border-gray-50 dark:border-gray-800 opacity-50' />
          </div>
          <MenuList {...props} />
        </section>

        {/* 2. 活动公告 (圆角卡片化) */}
        <div className='announcement-wrapper mb-8 transform transition-transform hover:scale-[1.02] duration-300'>
           <Announcement post={notice} />
        </div>

        {/* 3. 热门文章 (胶囊排行版) */}
        {latestPosts && latestPosts.length > 0 && (
            <section className='flex flex-col mb-8'>
                <div className='flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4'>
                    <i className='fas fa-fire-alt mr-2 text-orange-500'></i>
                    <span>Trending Now</span>
                </div>
                <ul className='space-y-3'>
                    {latestPosts.slice(0, 5).map((p, index) => (
                        <li key={p.id} className="group">
                            <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} passHref legacyBehavior>
                                <a className='flex items-start text-[13px] text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-all duration-300'>
                                    <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-[10px] mr-3 font-bold transition-colors duration-300 ${index < 3 ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : 'bg-gray-50 text-gray-400 dark:bg-gray-800'}`}>
                                      {index + 1}
                                    </span>
                                    <span className='line-clamp-2 leading-snug group-hover:underline decoration-orange-200 underline-offset-4'>
                                        {p.title}
                                    </span>
                                </a>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        )}

        {/* 搜索 & 订阅 */}
        <section className='space-y-6 mb-8'>
          <div className='bg-gray-50 dark:bg-gray-900/40 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800'>
            <SearchInput {...props} />
          </div>
          <div className='rounded-2xl overflow-hidden shadow-sm bg-gradient-to-br from-gray-50 to-white dark:from-gray-900/40 dark:to-gray-900/20 p-2 border border-gray-100 dark:border-gray-800'>
            <MailChimpForm />
          </div>
        </section>

        {/* 广告位 */}
        <section className='mb-8 rounded-xl overflow-hidden'>
          <AdSlot type='in-article' />
        </section>

        {/* 分类 & 标签 (胶囊列表) */}
        <div className="space-y-8">
            {router.asPath !== '/tag' && (
            <section className='flex flex-col'>
                <h3 className='text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 px-1'>Popular Tags</h3>
                <GroupTag tags={tagOptions} currentTag={currentTag} />
            </section>
            )}

            {router.asPath !== '/category' && (
            <section className='flex flex-col'>
                <h3 className='text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 px-1'>Categories</h3>
                <GroupCategory
                categories={categoryOptions}
                currentCategory={currentCategory}
                />
            </section>
            )}
        </div>

        {/* 页脚 & 运行时间 */}
        <section className='mt-auto pt-10 border-t border-gray-50 dark:border-gray-900'>
          <SocialButton />
          <div className="mt-4 opacity-60">
            <SiteInfo />
          </div>
          
          <div className='mt-8 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl border border-gray-100 dark:border-gray-800'>
            <div className='flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500 mb-3 tracking-tighter uppercase font-bold'>
              <i className='fas fa-bolt mr-2 text-orange-500 animate-pulse'></i>
              <span>System Operational Status</span>
            </div>
            <div className='font-mono text-[11px] text-orange-600 dark:text-orange-500 tabular-nums text-center font-bold'>
              {runtime || 'Initializing...'}
            </div>
          </div>
          
          <div className='flex justify-center mt-6'>
            <DarkModeButton />
          </div>
        </section>

        {/* 目录悬浮 */}
        <section className='sticky top-4 pt-4 flex flex-col max-h-[80vh] overflow-y-auto no-scrollbar'>
          <Catalog toc={post?.toc} />
          <div className='mt-4'>{slot}</div>
        </section>
      </div>

      <style jsx global>{`
        /* 全局美化：侧边栏菜单 Link 悬浮效果 */
        .sideLeft .menu-nav-wrapper nav a {
          font-size: 14px;
          padding: 8px 12px;
          margin: 2px 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 10px;
          display: flex;
          align-items: center;
          color: #4b5563;
        }
        .dark .sideLeft .menu-nav-wrapper nav a { color: #9ca3af; }

        .sideLeft .menu-nav-wrapper nav a:hover {
          background: rgba(249, 115, 22, 0.08);
          color: #f97316 !important;
          transform: translateX(4px);
        }
        
        .sideLeft .menu-nav-wrapper nav a i {
          margin-right: 12px;
          font-size: 14px;
          width: 20px;
          text-align: center;
          opacity: 0.7;
        }

        /* 极简星空粒子背景 */
        body::before {
          background-image: radial-gradient(1px 1px at 20px 30px, #eee, rgba(0,0,0,0));
          opacity: 0.05;
        }
        .dark body::before { opacity: 0.15; }

        /* 隐藏滚动条 */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default AsideLeft
