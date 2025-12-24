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
 * AsideLeft - 最终解耦修复版
 * 1. 物理锁定 Logo 容器宽度，彻底解决 Logo 变大问题
 * 2. 统一管理圣诞挂件逻辑，避免 Logo.js 冲突产生重影
 * 3. 完整保留活动一、活动二悬浮弹出功能
 * 4. 包含热门文章、运行时间、搜索等所有模块
 */
function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const { fullWidth } = useGlobal()
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)

  // 季节性挂件控制逻辑 (11月-2月)
  const now = new Date()
  const month = now.getMonth() + 1
  const showFestive = month >= 11 || month <= 2

  useEffect(() => {
    // 初始化折叠状态
    const saved = localStorage.getItem('fukasawa-sidebar-collapse') === 'true'
    setIsCollapse(saved)

    // 运行时间统计逻辑
    const timer = setInterval(() => {
      const start = new Date('2024-05-01')
      const diff = Date.now() - start.getTime()
      if (diff < 0) return
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const minutes = Math.floor((diff % 3600000) / 60000)
      setRuntime(`${days}天 ${hours}时 ${minutes}分`)
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
        
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 px-8 py-10'}`}>

          {/* Logo 区域：通过 items-start 和 w-[140px] 彻底锁定尺寸 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-10">
            <div className="relative w-[140px] group">
              {/* 这里调用 Logo.js（建议配合纯净版 Logo.js 使用） */}
              <Logo {...props} />
              
              {/* 在此处统一管理圣诞帽装饰，避免重复渲染 */}
              {showFestive && (
                <img
                  src="https://cloudflare-imgbed-aa9.pages.dev/file/1766208503664_hat.png"
                  className="absolute -top-3 -right-4 w-9 z-30 pointer-events-none rotate-[15deg]"
                  alt="Christmas Hat"
                />
              )}
            </div>

            {/* 站点描述文字 */}
            <section className="siteInfo relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 mt-5 font-light text-[11px] italic text-zinc-400 leading-relaxed opacity-80">
              {siteConfig('DESCRIPTION')}
            </section>
          </div>

          {/* 活动功能区：活动一和活动二（保留悬浮弹出逻辑） */}
          <section className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/30 shadow-sm">
            <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mb-3 px-1">
              <i className="fas fa-bullhorn mr-2"></i>
              <span>活动公告 / SPECIAL EVENTS</span>
            </div>
            {/* Announcement 组件内部负责处理活动的悬浮与弹出 */}
            <Announcement post={notice} />
          </section>

          {/* 快速搜索 */}
          <section className="mb-8 group">
            <div className="flex items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-[0.2em] uppercase mb-4 px-1 group-hover:text-blue-500 transition-colors">
              <span>Quick Access</span>
              <div className="flex-grow border-b border-zinc-100 dark:border-zinc-800 ml-4 opacity-30" />
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 focus-within:ring-2 ring-blue-500/20 transition-all">
              <SearchInput {...props} />
            </div>
          </section>

          {/* 外贸工具工作台 */}
          <section className="mb-10">
            <div className="flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase mb-5 px-1">
              <i className="fas fa-terminal mr-2 opacity-50 animate-pulse"></i>
              <span>Trade Terminal</span>
            </div>
            <SidebarTools />
          </section>

          {/* 导航菜单 */}
          <section className="flex flex-col mb-10">
            <div className="flex items-center text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-6 px-1">
              <span>Navigation</span>
            </div>
            <MenuList {...props} />
          </section>

          {/* 热门文章 (Trending Now) */}
          {latestPosts?.length > 0 && (
            <section className="flex flex-col mb-10">
              <div className="flex items-center text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-6 px-1">
                <i className="fas fa-fire-alt mr-2 text-orange-500 opacity-50"></i>
                <span>Trending Now</span>
              </div>
              <ul className="space-y-5">
                {latestPosts.slice(0, 5).map((p, index) => (
                  <li key={p.id} className="group flex items-start cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 p-2 rounded-xl transition-all">
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg text-[10px] mr-4 font-mono transition-all group-hover:scale-110 ${index < 3 ? 'bg-blue-600 text-white shadow-lg' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'}`}>
                      0{index + 1}
                    </span>
                    <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className="text-[13px] text-zinc-600 dark:text-zinc-400 group-hover:text-blue-600 transition-all line-clamp-2 leading-snug">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 邮件订阅 */}
          <div className="mb-10">
            <MailChimpForm />
          </div>

          {/* 系统状态统计 */}
          <section className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <SocialButton />
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center relative overflow-hidden group hover:shadow-md transition-all">
              <div className="flex items-center justify-center text-[9px] text-zinc-400 mb-3 tracking-widest uppercase font-black">
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-ping" />
                <span>System Online</span>
              </div>
              <div className="font-mono text-[12px] text-zinc-800 dark:text-zinc-200 font-bold tracking-tighter">
                {runtime || 'SYNCING...'}
              </div>
            </div>
          </section>

          {/* 文章目录 (仅阅读页) */}
          {post?.toc && (
            <section className="sticky top-6 mt-8 pt-6 max-h-[60vh] overflow-y-auto no-scrollbar">
              <Catalog toc={post.toc} />
            </section>
          )}
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* 侧边栏导航链接悬浮美化 */
        .sideLeft nav a {
          font-size: 13.5px !important;
          padding: 12px 18px !important;
          margin: 6px 0 !important;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          border-radius: 14px !important;
        }
        .sideLeft nav a:hover {
          background: #3b82f6 !important;
          color: white !important;
          transform: translateX(8px);
          box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.3);
        }
      `}</style>
    </div>
  )
}

export default AsideLeft
