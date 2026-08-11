'use client'

import React from 'react'

import BLOG from '@/blog.config'
import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Catalog from './Catalog'
import Logo from './Logo'
import MailChimpForm from './MailChimpForm'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import SocialButton from './SocialButton'
import TagItemMini from './TagItemMini' 
import { isHomepageListPost } from '@/lib/utils/postVisibility'
// ✅ 引入组件（Announcement 改为动态导入，以便控制关闭状态）
const SidebarTools = dynamic(() => import('./SidebarTools'), {
  ssr: false,
  loading: () => (
    <div className='h-40 rounded-2xl border border-dashed border-stone-200 bg-stone-50/70 dark:border-stone-800 dark:bg-stone-900/40' />
  )
})

// 手机端 Announcement 动态加载（控制显隐以便关闭后整个容器消失）
const Announcement = dynamic(() => import('./Announcement'), {
  ssr: false,
  loading: () => null
})

function AsideLeft(props) {
  const { post, notice, latestPosts = [], tagOptions = [] } = props 
  const visibleLatestPosts = latestPosts.filter(isHomepageListPost)
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)
  // ✅ 保持全局状态引入，以便其他地方使用
  const global = useGlobal()
  const { isDarkMode, updateDarkMode, siteInfo } = global
  const isReverse = getConfigValue(global, 'LAYOUT_SIDEBAR_REVERSE', false)
  const sidebarDescription =
    siteInfo?.description || getConfigValue(global, 'DESCRIPTION', '')
  const subPath = getConfigValue(global, 'SUB_PATH', '')
  const showStatsLink = parseConfigBoolean(
    getConfigValue(global, 'FUKASAWA_SHOW_STATS_LINK', false)
  )

  // 圣诞氛围逻辑
  const now = new Date()
  const month = now.getMonth() + 1
  const showFestive = month >= 11 || month <= 1

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

  // ✅ 切换模式函数（保留函数体，但不再被按钮调用）
  const handleChangeDarkMode = () => {
    updateDarkMode(!isDarkMode)
  }

  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[18.5rem]' : 'left-[18.5rem]')

  return (
    <React.Fragment>
    <div className="flex">
      

      {/* 折叠按钮 */}
      <button
        onClick={toggleCollapse}
        className={`${btnPosition} fixed top-6 z-50 hidden p-2.5 rounded-xl bg-white/90 dark:bg-stone-800/90 backdrop-blur-md shadow-lg border border-stone-200 dark:border-stone-700 transition-all duration-500 hover:scale-110 active:scale-95 group lg:flex`}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-amber-500' : 'fa-chevron-left text-stone-400'} text-sm group-hover:text-amber-500 transition-colors`}></i>
      </button>

      {/* 侧边栏主体 */}
      <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-[#faf6f0] dark:bg-[#171310] min-h-screen hidden lg:block z-30 border-r border-stone-200/80 dark:border-stone-900 shadow-[8px_0_28px_rgba(15,23,42,0.06)] dark:shadow-[8px_0_28px_rgba(0,0,0,0.24)]`}>
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 px-6 py-8'}`}>

          {/* Logo 区域 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-8">
            <div className="relative overflow-visible" style={{ width: '140px', minWidth: '140px' }}>
              <div className="relative z-10 transition-transform hover:scale-105 duration-300">
                 <Logo {...props} />
              </div>
              
              {showFestive && (
                <React.Fragment>
                  <Image
                    src="https://cloudflare-imgbed-aa9.pages.dev/file/1766591515499_hat.png"
                    className="festive-hat-fixed"
                    width={65}
                    height={65}
                    sizes='65px'
                    style={{ 
                        position: 'absolute',
                        top: '-29px', 
                        left: '5px', 
                        width: '65px',
                        maxWidth: '65px',
                        zIndex: 100,
                        pointerEvents: 'none',
                        display: 'block',
                        mixBlendMode: 'multiply',
                        filter: 'contrast(110%) brightness(105%)'
                    }}
                    alt="Christmas Hat"
                  />
                  <div className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible" style={{ zIndex: 120 }}>
                    <span className="snowflake-anim text-[10px] absolute left-1">❄</span>
                    <span className="snowflake-anim text-[8px] absolute left-6" style={{animationDelay:'1.5s'}}>❅</span>
                  </div>
                </React.Fragment>
              )}
            </div>
            <section className="siteInfo relative pl-3 border-l-2 border-stone-200 dark:border-stone-800 mt-5 font-light text-xs italic text-stone-500 leading-relaxed opacity-90 dark:text-stone-400">
              {sidebarDescription}
            </section>
          </div>

          {/* 活动公告（标题栏 + 关闭按钮 + 卡片都在 Announcement 内部） */}
          <Announcement
            post={notice}
            className="mb-8 rounded-2xl border border-amber-100/80 bg-white/85 p-4 shadow-sm shadow-amber-100/50 dark:border-stone-800 dark:bg-stone-950/40 dark:shadow-none"
          />

          {/* 工具台 */}
          <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/40">
            <div className="flex items-center text-[11px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.18em] uppercase mb-4 px-1">
              <i className="fas fa-terminal mr-2 opacity-60"></i>
              <span>外贸工具台</span>
            </div>
            <SidebarTools />
          </section>

          {/* 搜索 */}
          <section className="mb-8 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/40">
            <div className="mb-4 flex items-center text-[11px] font-bold text-stone-500 dark:text-stone-400 tracking-[0.18em] uppercase px-1">
              <i className="fas fa-compass mr-2 text-amber-500 opacity-70"></i>
              <span>内容导航</span>
            </div>
            <div className="bg-stone-50 dark:bg-stone-900/50 p-1.5 rounded-xl border border-stone-200 dark:border-stone-800">
              <SearchInput {...props} />
            </div>

          {/* 菜单 */}
          <div className="mt-4 flex flex-col border-t border-dashed border-stone-200 pt-4 dark:border-stone-800">
            <MenuList {...props} />
          </div>
          {showStatsLink && (
            <div className="mt-4 grid gap-2 border-t border-dashed border-stone-200 pt-4 dark:border-stone-800">
              <a href="/skill-stats.html" className="flex items-center justify-between rounded-xl border border-dashed border-stone-200 bg-stone-50 px-3 py-2 text-xs font-bold text-stone-600 transition hover:border-amber-300 hover:text-amber-600 dark:border-stone-800 dark:bg-stone-950/30 dark:text-stone-300 dark:hover:border-amber-700 dark:hover:text-amber-300">
                <span><i className="fas fa-chart-line mr-2 text-violet-500"></i>点击看板</span>
                <i className="fas fa-arrow-right text-[10px] text-stone-400"></i>
              </a>
            </div>
          )}
          </section>

          {/* 侧边栏热度标签云 */}
          {tagOptions?.length > 0 && (
            <section className="flex flex-col mb-8 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/40">
              <div className="flex items-center text-[11px] font-bold text-stone-500 dark:text-stone-400 tracking-[0.18em] uppercase mb-4 px-1">
                <i className="fas fa-tags mr-2 text-indigo-500 opacity-50"></i>
                <span>热门标签</span>
              </div>
              <div className="flex flex-wrap gap-1 pl-1">
                {tagOptions.slice(0, 12).map(tag => (
                  <TagItemMini key={tag.name} tag={tag} />
                ))}
                {tagOptions.length > 12 && (
                    <Link href='/tag' className='ml-1 mt-2 text-[11px] italic text-stone-400 transition-colors hover:text-amber-500'>
                        更多标签...
                    </Link>
                )}
              </div>
            </section>
          )}

          {/* 热门文章 */}
          {visibleLatestPosts?.length > 0 && (
            <section className="flex flex-col mb-8 rounded-2xl border border-stone-200/80 bg-white/80 p-4 shadow-sm dark:border-stone-800 dark:bg-stone-950/40">
              <div className="flex items-center text-[11px] font-bold text-stone-500 dark:text-stone-400 tracking-[0.18em] uppercase mb-4 px-1">
                <i className="fas fa-fire-alt mr-2 text-orange-500 opacity-50"></i>
                <span>热门文章</span>
              </div>
              <ul className="space-y-3">
                {visibleLatestPosts.slice(0, 5).map((p, index) => {
                  const isTopThree = index < 3;
                  return (
                    <li 
                      key={p.id} 
                      className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
                        isTopThree 
                          ? 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 hover:border-amber-200 dark:hover:border-amber-800'
                          : 'bg-stone-50 dark:bg-stone-900/50 border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
                      }`}
                    >
                      {isTopThree && (
                        <React.Fragment>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                          </div>
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-amber-500 via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </React.Fragment>
                      )}

                      <div className="relative z-10 flex items-center px-4 py-3 gap-3">
                        <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[11px] font-mono font-bold transition-all duration-300 ${
                          isTopThree 
                            ? `bg-gradient-to-br ${
                                index === 0 
                                  ? 'from-yellow-400 to-orange-500 text-white shadow-sm group-hover:scale-105'
                                  : index === 1 
                                  ? 'from-stone-300 to-stone-400 text-white shadow-sm group-hover:scale-105'
                                  : 'from-orange-300 to-amber-400 text-white shadow-sm group-hover:scale-105'
                              }` 
                            : 'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                        }`}>
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `0${index + 1}`}
                        </span>

                        <Link 
                          href={`${subPath}/${p.slug}`}
                          className={`flex-1 text-[13px] line-clamp-2 font-medium transition-all duration-300 ${
                            isTopThree
                              ? 'text-amber-700 dark:text-amber-300 group-hover:text-amber-600 dark:group-hover:text-amber-200 group-hover:translate-x-0.5'
                              : 'text-stone-700 dark:text-stone-300 group-hover:text-stone-900 dark:group-hover:text-stone-100'
                          }`}
                        >
                          {p.title}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          <section className="mt-auto pt-10 border-t border-stone-100 dark:border-stone-900">
            <SocialButton />
            <div className="mt-8 p-5 bg-stone-50 dark:bg-stone-900/50 rounded-2xl border border-stone-200 dark:border-stone-800 text-center">
              <div className="text-[9px] text-stone-400 uppercase mb-2 tracking-widest font-black">站点运行</div>
              <div className="font-mono text-xs font-bold text-stone-700 dark:text-stone-300">{runtime}</div>
            </div>
          </section>

        </div>
      </div>
    </div>

        <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .sideLeft .festive-hat-fixed {
            width: 45px !important;
            max-width: 45px !important;
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
    </React.Fragment>
  )
}

const getConfigValue = (global, key, defaultValue) => {
  return (
    global?.NOTION_CONFIG?.[key] ??
    global?.THEME_CONFIG?.[key] ??
    BLOG?.[key] ??
    defaultValue
  )
}

const parseConfigBoolean = value => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value === 'true'
  }

  return Boolean(value)
}

export default AsideLeft
