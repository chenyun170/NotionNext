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

/**
 * AsideLeft - 视觉极致优化版
 * 1. 圣诞帽缩小 50% (w-3.5)，定位更精准
 * 2. 雪花 z-index 设为最高，飘在所有元素前方
 * 3. 完整保留活动一、活动二悬浮弹出功能
 */
function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const { fullWidth } = useGlobal()
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)

  // 圣诞氛围逻辑 (11月-2月)
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

          {/* Logo 区域 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-10">
            <div className="relative w-[140px] group">
              {/* 底层：Logo 组件 */}
              <div className="relative z-10">
                 <Logo {...props} />
              </div>
              
              {showFestive && (
                <>
                  {/* 中层：极致微型圣诞帽 (w-2 约 8px) */}
                  <img
                    src="https://cloudflare-imgbed-aa9.pages.dev/file/1766208503664_hat.png"
                    className="absolute -top-1 left-[18px] w-3.5 z-20 pointer-events-none rotate-[10deg] drop-shadow-sm"
                    alt="Micro Hat"
                  />
                  
                  {/* 最顶层：雪花容器 (z-50) 飘在最前面 */}
                  <div className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible z-50">
                    <span className="snowflake-top text-[10px] absolute left-1" style={{animationDelay:'0s'}}>❄</span>
                    <span className="snowflake-top text-[8px] absolute left-6" style={{animationDelay:'1.2s'}}>❅</span>
                    <span className="snowflake-top text-[9px] absolute left-10" style={{animationDelay:'2.5s'}}>❆</span>
                    <span className="snowflake-top text-[7px] absolute left-14" style={{animationDelay:'0.8s'}}>❄</span>
                  </div>
                </>
              )}
            </div>

            <section className="siteInfo relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 mt-5 font-light text-[11px] italic text-zinc-400 leading-relaxed opacity-80">
              {siteConfig('DESCRIPTION')}
            </section>
          </div>

          {/* 活动面板：保持悬浮与弹出功能 */}
          <section className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/30">
            <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mb-3 px-1">
              <i className="fas fa-bullhorn mr-2"></i>
              <span>活动公告 / SPECIAL EVENTS</span>
            </div>
            <Announcement post={notice} />
          </section>

          {/* 搜索、菜单、热门文章、系统状态等后续模块保持不变... */}
          <section className="mb-8">
            <SearchInput {...props} />
          </section>

          <section className="flex flex-col mb-10">
            <MenuList {...props} />
          </section>

          {latestPosts?.length > 0 && (
            <section className="flex flex-col mb-10">
              <div className="flex items-center text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-6 px-1">
                <span>Trending Now</span>
              </div>
              <ul className="space-y-4">
                {latestPosts.slice(0, 5).map((p, index) => (
                  <li key={p.id} className="group flex items-start p-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 rounded-lg transition-all">
                    <span className="mr-3 text-blue-600 font-mono text-xs">0{index + 1}</span>
                    <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className="text-[13px] line-clamp-2">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-auto pt-10">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl text-center border dark:border-zinc-800">
              <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1 font-bold">System Online</div>
              <div className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">{runtime}</div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* 雪花置顶下落动画 */
        .snowflake-top {
          color: #fff;
          opacity: 0;
          text-shadow: 0 0 5px rgba(255,255,255,0.9);
          animation: snow-fall-front 4s linear infinite;
          filter: drop-shadow(0 0 2px rgba(0,0,0,0.1));
        }
        @keyframes snow-fall-front {
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
