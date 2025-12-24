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
import SidebarTools from './SidebarTools'

/**
 * 侧边栏 - 极致顺序优化版（Logo 尺寸修复版）
 */
function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const { fullWidth } = useGlobal()

  // --- 实时运行时间统计 ---
  const [runtime, setRuntime] = useState('Initializing...')
  const START_TIME = '2024-05-01'

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(START_TIME)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      if (diff < 0) return
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setRuntime(`${days}天 ${hours}时 ${minutes}分 ${seconds}秒`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // --- 侧边栏折叠逻辑 ---
  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fukasawa-sidebar-collapse') === 'true'
    }
    return false
  })

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const position = useMemo(() => {
    return isCollapsed ? (isReverse ? 'right-2' : 'left-2') : (isReverse ? 'right-80' : 'left-80')
  }, [isCollapsed, isReverse])

  return (
    <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#121212] min-h-screen hidden lg:block z-20 border-r border-gray-50 dark:border-gray-900`}>
      
      {/* 折叠按钮 */}
      <div className={`${position} hidden lg:block fixed top-4 cursor-pointer z-50 bg-white/80 dark:bg-black/80 backdrop-blur rounded-full shadow-lg p-2.5 hover:scale-110 duration-300 border border-gray-100 dark:border-gray-800`} onClick={() => setIsCollapse(!isCollapsed)}>
        <i className={`fa-solid ${isCollapsed ? 'fa-indent' : 'fa-chevron-left'} text-lg dark:text-white`}></i>
      </div>

      <div className={`h-full ${isCollapsed ? 'hidden' : 'px-8 py-10'} flex flex-col no-scrollbar overflow-y-auto`}>
        
        {/* 1. Logo & 描述 - 修复尺寸控制 */}
        <div className="mb-4 flex justify-center w-full">
            <div className="w-28 h-28 relative site-logo-wrapper flex justify-center items-center">
                <Logo {...props} />
            </div>
        </div>
        
        <section className='siteInfo text-center dark:text-gray-400 text-[12px] italic opacity-70 leading-relaxed mb-6 px-2'>
          {siteConfig('DESCRIPTION')}
        </section>

        {/* 2. 特色活动区 */}
        <section className='mb-6 bg-orange-50/30 dark:bg-orange-950/10 rounded-xl p-2 border border-orange-100/50 dark:border-orange-900/20'>
           <div className='flex items-center text-[10px] font-bold text-orange-600 dark:text-orange-400 tracking-widest uppercase mb-2 px-1'>
              <i className="fas fa-bullhorn mr-2"></i>
              <span>Special Events</span>
           </div>
           <Announcement post={notice} />
        </section>

        {/* 3. 快速搜索 */}
        <section className='mb-6'>
          <div className='flex items-center text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-3 px-1'>
            <span>Quick Search</span>
            <div className='flex-grow border-b border-gray-100 dark:border-gray-800 ml-3 opacity-30' />
          </div>
          <div className='bg-gray-50 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/5'>
            <SearchInput {...props} />
          </div>
        </section>

        {/* 4. 外贸工具工作台 */}
        <section className='mb-8'>
          <div className='flex items-center text-[10px] font-bold text-blue-500 dark:text-blue-400 tracking-widest uppercase mb-3 px-1'>
            <i className='fas fa-terminal mr-2 animate-pulse'></i>
            <span>Trade Terminal</span>
          </div>
          <SidebarTools />
        </section>

        {/* 5. 导航菜单 */}
        <section className='flex flex-col mb-8'>
          <div className='flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 px-1'>
            <span>Navigation</span>
            <div className='flex-grow border-b border-gray-50 dark:border-gray-800 ml-4 opacity-50' />
          </div>
          <MenuList {...props} />
        </section>

        {/* 6. 热门文章 */}
        {latestPosts?.length > 0 && (
            <section className='flex flex-col mb-8 text-[13px]'>
                <div className='flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4 px-1'>
                    <i className='fas fa-fire-alt mr-2 text-orange-500'></i>
                    <span>Trending Now</span>
                </div>
                <ul className='space-y-3'>
                    {latestPosts.slice(0, 5).map((p, index) => (
                        <li key={p.id} className="group flex items-start">
                            <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded text-[10px] mr-3 font-bold ${index < 3 ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/30' : 'bg-gray-50 text-gray-400 dark:bg-gray-800'}`}>
                              {index + 1}
                            </span>
                            <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className='text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-all line-clamp-2 leading-snug'>
                                {p.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        )}

        {/* 7. 邮件订阅 */}
        <div className='mb-8'>
           <MailChimpForm />
        </div>

        {/* 8. 页脚系统状态 */}
        <section className='mt-auto pt-8 border-t border-gray-50 dark:border-gray-900'>
          <SocialButton />
          <div className='mt-6 p-4 bg-white/50 dark:bg-white/5 backdrop-blur-lg rounded-2xl border border-white/30 dark:border-white/10 shadow-xl text-center'>
            <div className='flex items-center justify-center text-[10px] text-gray-400 dark:text-gray-500 mb-2 tracking-widest uppercase font-bold'>
              <i className='fas fa-circle text-[6px] mr-2 text-green-500 animate-pulse'></i>
              <span>System Uptime</span>
            </div>
            <div className='font-mono text-[11px] text-blue-600 dark:text-blue-400 tabular-nums font-bold tracking-wider'>
              {runtime || 'Initializing...'}
            </div>
          </div>
        </section>

        {/* 目录 (仅文章页) */}
        {post?.toc && (
          <section className='sticky top-4 pt-4 max-h-[70vh] overflow-y-auto no-scrollbar'>
            <Catalog toc={post.toc} />
          </section>
        )}
      </div>

      <style jsx global>{`
        .sideLeft::-webkit-scrollbar { width: 0px; }
        .sideLeft nav a {
          font-size: 14px;
          padding: 10px 16px;
          margin: 4px 0;
          transition: all 0.3s ease;
          border-radius: 12px;
          display: flex;
          align-items: center;
          color: #4b5563;
        }
        .dark .sideLeft nav a { color: #9ca3af; }
        .sideLeft nav a:hover {
          background: rgba(59, 130, 246, 0.08) !important;
          color: #3b82f6 !important;
          transform: translateX(6px);
        }
        
        /* 侧边栏滚动条 */
        .sideLeft .overflow-y-auto {
          scrollbar-width: thin;
          scrollbar-color: rgba(0,0,0,0.05) transparent;
        }

        /* LOGO 尺寸强制缩减补丁 */
        .site-logo-wrapper :global(img) {
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain;
        }
        
        /* 圣诞帽缩放补丁 */
        .site-logo-wrapper :global(img[src*="hat"]),
        .site-logo-wrapper :global(.christmas-hat) {
          width: 40px !important;
          height: auto !important;
          top: -10px !important;
          left: -5px !important;
          z-index: 30;
        }

        /* 动画与悬停 */
        .sideLeft section i { transition: transform 0.3s ease; }
        .sideLeft section:hover i { transform: scale(1.2) rotate(5deg); }
        .sideLeft ul li:hover {
          background: rgba(255, 165, 0, 0.03);
          border-radius: 8px;
          padding-left: 4px;
        }
      `}</style>
    </div>
  )
}

export default AsideLeft
