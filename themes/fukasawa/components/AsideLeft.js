'use client'

import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Announcement from './Announcement'
import Catalog from './Catalog'
import Logo from './Logo'
import MailChimpForm from './MailChimpForm'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import SocialButton from './SocialButton'
import SidebarTools from './SidebarTools'

function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)

  // 11月至2月自动化装饰逻辑
  const now = new Date()
  const month = now.getMonth() + 1
  const showFestive = month >= 11 || month <= 2

  useEffect(() => {
    setIsCollapse(localStorage.getItem('fukasawa-sidebar-collapse') === 'true')
    const timer = setInterval(() => {
      const diff = Date.now() - new Date('2024-05-01').getTime()
      if (diff < 0) return
      setRuntime(`${Math.floor(diff / 86400000)}天 ${Math.floor((diff % 86400000) / 3600000)}时`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapse(next)
    localStorage.setItem('fukasawa-sidebar-collapse', String(next))
  }

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[18.5rem]' : 'left-[18.5rem]')

  return (
    <div className="flex">
      {/* 1. 折叠按钮 */}
      <button
        onClick={toggleCollapse}
        className={`${btnPosition} fixed top-6 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-zinc-700 transition-all duration-500 hover:scale-110 active:scale-95 group`}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-blue-500' : 'fa-chevron-left text-gray-400'} text-sm group-hover:text-blue-500 transition-colors`}></i>
      </button>

      {/* 2. 侧边栏主体 */}
      <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#09090b] min-h-screen hidden lg:block z-30 border-r border-gray-100 dark:border-zinc-900 shadow-2xl`}>
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 px-8 py-10'}`}>

          {/* Logo 区域：物理锁定容器 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-10">
            <div className="relative overflow-visible" style={{ width: '140px', minWidth: '140px' }}>
              
              {/* 底层：Logo */}
              <div className="relative z-10">
                 <Logo {...props} />
              </div>
              
              {showFestive && (
                <>
                  {/* 中层：极致微型圣诞帽 - 使用 !important 内联样式击败 Style.js */}
                  <img
                    src="https://cloudflare-imgbed-aa9.pages.dev/file/1766208503664_hat.png"
                    className="festive-hat-fixed"
                    style={{ 
                        position: 'absolute',
                        top: '-4px', 
                        left: '42px', 
                        width: '22px !important', 
                        maxWidth: '22px !important',
                        zIndex: 100,
                        pointerEvents: 'none',
                        transform: 'rotate(25deg)',
                        display: 'block'
                    }}
                    alt="Micro Hat"
                  />
                  
                  {/* 最顶层：雪花容器 (z-index 设为最高) */}
                  <div className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible" style={{ zIndex: 120 }}>
                    <span className="snowflake-anim text-[10px] absolute left-1">❄</span>
                    <span className="snowflake-anim text-[8px] absolute left-6" style={{animationDelay:'1.5s'}}>❅</span>
                    <span className="snowflake-anim text-[9px] absolute left-12" style={{animationDelay:'2.5s'}}>❆</span>
                  </div>
                </>
              )}
            </div>

            <section className="siteInfo relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 mt-5 font-light text-[11px] italic text-zinc-400 leading-relaxed opacity-80">
              {siteConfig('DESCRIPTION')}
            </section>
          </div>

          {/* 活动公告：保留活动一、二悬浮弹出功能 */}
          <section className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/30">
            <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mb-3 px-1">
              <i className="fas fa-bullhorn mr-2"></i>
              <span>活动公告 / SPECIAL EVENTS</span>
            </div>
            <Announcement post={notice} />
          </section>

          {/* 搜索 */}
          <section className="mb-8">
            <SearchInput {...props} />
          </section>

          {/* 导航菜单 */}
          <section className="flex flex-col mb-10">
            <MenuList {...props} />
          </section>

          {/* 热门文章 */}
          {latestPosts?.length > 0 && (
            <section className="flex flex-col mb-10">
              <div className="flex items-center text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-6 px-1">
                <i className="fas fa-fire-alt mr-2 text-orange-500 opacity-50"></i>
                <span>Trending Now</span>
              </div>
              <ul className="space-y-5">
                {latestPosts.slice(0, 5).map((p, index) => (
                  <li key={p.id} className="group flex items-start cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-xl transition-all">
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-[10px] mr-4 font-mono ${index < 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                      0{index + 1}
                    </span>
                    <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className="text-[13px] line-clamp-2 leading-snug">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 系统状态统计 */}
          <section className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <SocialButton />
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <div className="text-[9px] text-zinc-400 uppercase mb-2 tracking-widest">System Online</div>
              <div className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">{runtime}</div>
            </div>
          </section>

        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* 强制覆盖 Style.js 的全局图片限制 */
        .sideLeft .festive-hat-fixed {
            width: 14px !important;
            max-width: 14px !important;
            height: auto !important;
            border-radius: 0 !important;
            display: block !important;
        }

        .snowflake-anim {
          color: #fff;
          opacity: 0;
          text-shadow: 0 0 5px rgba(255,255,255,0.9);
          animation: snow-down 4s linear infinite;
        }
        @keyframes snow-down {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default AsideLeft
