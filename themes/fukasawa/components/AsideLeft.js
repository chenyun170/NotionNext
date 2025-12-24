'use client'

import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useMemo, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Transition } from '@headlessui/react'

// 组件导入
import Announcement from './Announcement'
import Catalog from './Catalog'
import Logo from './Logo'
import MailChimpForm from './MailChimpForm'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import SocialButton from './SocialButton'
import SidebarTools from './SidebarTools'

/**
 * AsideLeft - 极致视觉 & 交互升级版
 */
function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const { fullWidth } = useGlobal()
  const scrollRef = useRef(null)

  // --- 实时运行时间统计 (增加 Page Visibility API 优化) ---
  const [runtime, setRuntime] = useState('')
  const START_TIME = siteConfig('SINCE', '2024-05-01')

  useEffect(() => {
    const updateTime = () => {
      const start = new Date(START_TIME)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      if (diff < 0) return
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      setRuntime(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }

    updateTime()
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') updateTime()
    }, 1000)
    
    return () => clearInterval(timer)
  }, [START_TIME])

  // --- 侧边栏折叠逻辑 ---
  const [isCollapsed, setIsCollapse] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('fukasawa-sidebar-collapse') === 'true'
    setIsCollapse(saved)
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapse(newState)
    localStorage.setItem('fukasawa-sidebar-collapse', newState)
  }

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  
  // 按钮位置计算
  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[20rem]' : 'left-[20rem]')

  return (
    <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#09090b] min-h-screen hidden lg:block z-30 border-r border-gray-100 dark:border-zinc-900 shadow-2xl shadow-gray-200/50 dark:shadow-none`}>
      
      {/* 1. 折叠按钮 - 悬浮胶囊设计 */}
      <button 
        title={isCollapsed ? '展开' : '收起'}
        className={`${btnPosition} fixed top-6 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg border border-gray-100 dark:border-zinc-700 transition-all duration-500 hover:scale-110 active:scale-95 group`}
        onClick={toggleCollapse}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-blue-500' : 'fa-chevron-left text-gray-400'} text-sm transition-transform group-hover:text-blue-500`}></i>
      </button>

      {/* 2. 主体内容容器 */}
      <div 
        ref={scrollRef}
        className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100 px-8 py-10'}`}
      >
        
        {/* --- 顶部 Logo & 简介 --- */}
        <section className="mb-8 transform hover:translate-x-1 transition-transform">
          <div className="mb-3 transform hover:scale-105 origin-left transition-transform duration-500">
            <Logo {...props} />
          </div>
          <div className='siteInfo relative pl-4 border-l-2 border-blue-500/30 dark:border-blue-500/20'>
             <p className='text-gray-500 dark:text-zinc-400 text-xs italic leading-relaxed opacity-80'>
               {siteConfig('DESCRIPTION')}
             </p>
          </div>
        </section>

        {/* --- 搜索区块 --- */}
        <section className='mb-8 group'>
          <div className='flex items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest uppercase mb-3 px-1 group-hover:text-blue-500 transition-colors'>
            <span>Quick Access</span>
            <div className='flex-grow border-b border-gray-100 dark:border-zinc-800 ml-4 opacity-30' />
          </div>
          <div className='bg-gray-50 dark:bg-zinc-900/50 p-1 rounded-xl border border-gray-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500/20 transition-all'>
            <SearchInput {...props} />
          </div>
        </section>

        {/* --- 核心导航 --- */}
        <section className='mb-10'>
          <div className='flex items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest uppercase mb-4 px-1'>
            <span>Navigation</span>
          </div>
          <MenuList {...props} />
        </section>

        {/* --- 业务工具 (Trade Terminal) --- */}
        <section className='mb-10 p-4 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/10 rounded-2xl border border-blue-100/50 dark:border-blue-900/20'>
          <div className='flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-widest uppercase mb-4'>
            <i className='fas fa-terminal mr-2 animate-pulse'></i>
            <span>Trade Terminal</span>
          </div>
          <SidebarTools />
        </section>

        {/* --- 公告区块 --- */}
        {notice && (
          <section className='mb-10 p-4 bg-orange-50/30 dark:bg-orange-950/10 rounded-2xl border border-orange-100/50 dark:border-orange-900/20'>
            <div className='flex items-center text-[10px] font-bold text-orange-600 dark:text-orange-400 tracking-widest uppercase mb-3'>
              <i className="fas fa-bullhorn mr-2"></i>
              <span>Special Events</span>
            </div>
            <Announcement post={notice} />
          </section>
        )}

        {/* --- 热门文章排行 --- */}
        {latestPosts?.length > 0 && (
          <section className='mb-10'>
            <div className='flex items-center text-[10px] font-bold text-gray-400 dark:text-zinc-500 tracking-widest uppercase mb-5 px-1'>
              <i className='fas fa-fire-alt mr-2 text-orange-500'></i>
              <span>Trending Now</span>
            </div>
            <ul className='space-y-4'>
              {latestPosts.slice(0, 5).map((p, index) => (
                <li key={p.id} className="group flex items-start cursor-pointer">
                  <span className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md text-[10px] mr-3 font-mono font-bold transition-all group-hover:rotate-12 ${index < 3 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-400 dark:bg-zinc-800'}`}>
                    {index + 1}
                  </span>
                  <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className='text-[13px] text-gray-600 dark:text-zinc-400 group-hover:text-blue-500 transition-all line-clamp-2 leading-snug'>
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --- 底部状态 & 社交 --- */}
        <section className='mt-auto pt-10 border-t border-gray-100 dark:border-zinc-900'>
          <SocialButton />
          
          <div className='mt-8 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-gray-100 dark:border-zinc-800 relative overflow-hidden group'>
            <div className='flex items-center justify-center text-[9px] text-gray-400 dark:text-zinc-500 mb-2 tracking-[0.2em] uppercase font-black'>
              <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-ping" />
              <span>System Uptime</span>
            </div>
            <div className='font-mono text-[11px] text-blue-600 dark:text-blue-400 font-bold tracking-tighter text-center'>
              {runtime || 'SYNCING...'}
            </div>
            {/* 背景装饰动效 */}
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20 transform translate-x-full group-hover:translate-x-[-100%] transition-transform duration-[3000ms] ease-linear" />
          </div>
        </section>

        {/* 目录 (仅在文章阅读页显示) */}
        {post?.toc && (
          <section className='sticky top-4 mt-8 pt-6 max-h-[60vh] overflow-y-auto no-scrollbar border-t border-gray-100 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-sm'>
             <div className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4'>Catalog</div>
             <Catalog toc={post.toc} />
          </section>
        )}
      </div>

      <style jsx global>{`
        /* 隐藏滚动条但保留滚动功能 */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* 菜单项精致化 */
        .sideLeft nav a {
          font-size: 14px;
          padding: 12px 16px;
          margin: 4px 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 12px;
          color: #64748b;
        }
        .dark .sideLeft nav a { color: #94a3b8; }
        .sideLeft nav a:hover {
          background: rgba(59, 130, 246, 0.06);
          color: #3b82f6 !important;
          transform: translateX(5px);
          box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.08);
        }
        .sideLeft nav a i {
          margin-right: 12px;
          width: 16px;
          text-align: center;
          transition: transform 0.3s ease;
        }
        .sideLeft nav a:hover i { transform: scale(1.2); }
      `}</style>
    </div>
  )
}

export default AsideLeft
