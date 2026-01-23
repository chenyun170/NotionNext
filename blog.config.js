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
import TagItemMini from './TagItemMini' 
import SidebarChatWidget from '../components/SidebarChatWidget';

function AsideLeft(props) {
  const { post, notice, latestPosts = [], tagOptions = [] } = props 
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)
  const [isAiOpen, setIsAiOpen] = useState(false)
  
  // ✅ 核心修复：确保解构出 updateDarkMode
  const { isDarkMode, updateDarkMode } = useGlobal()

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

  // ✅ 切换模式函数：强制触发
  const handleChangeDarkMode = () => {
    const newMode = !isDarkMode
    updateDarkMode(newMode)
    // 额外补偿逻辑：确保 HTML 节点类名同步
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[18.5rem]' : 'left-[18.5rem]')

  return (
    <div className="flex">
      {/* 🚀 逻辑 1：悬浮控制区（手机端 + 电脑端折叠时显示） */}
      <div className={`fixed left-0 top-1/2 -translate-y-1/2 z-[70] transition-all duration-300 flex flex-col gap-3 ${isAiOpen ? 'w-[85vw] left-2' : 'w-auto'} ${!isCollapsed ? 'lg:hidden' : 'lg:flex'}`}>
        {!isAiOpen ? (
          <>
            {/* AI 参谋按钮 */}
            <button 
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl p-1 rounded-r-2xl shadow-2xl border border-white/40 ring-1 ring-white/20 active:scale-95 transition-all"
            >
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-robot text-sm"></i>
              </div>
              <div className="pr-1">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 leading-none">AI 参谋</p>
              </div>
            </button>

            {/* 模式切换按钮 */}
            <button 
              onClick={handleChangeDarkMode}
              className="flex items-center justify-center w-11 h-11 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-xl rounded-r-xl shadow-xl border border-white/40 ring-1 ring-white/20 active:scale-90 transition-all"
            >
              <i className={`fas ${isDarkMode ? 'fa-sun text-yellow-500' : 'fa-moon text-indigo-600'} text-lg`}></i>
            </button>
          </>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
             <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-3 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-2">
                  <i className="fas fa-comment-dots text-blue-500"></i> 情报局 AI 助手
                </span>
                <button onClick={() => setIsAiOpen(false)} className="text-zinc-400 hover:text-red-500 p-1">
                  <i className="fas fa-times"></i>
                </button>
             </div>
             <div className="p-4 overflow-y-auto max-h-[60vh] no-scrollbar">
                <SidebarChatWidget />
             </div>
          </div>
        )}
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={toggleCollapse}
        className={`${btnPosition} fixed top-6 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-zinc-700 transition-all duration-500 hover:scale-110 active:scale-95 group`}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-blue-500' : 'fa-chevron-left text-gray-400'} text-sm group-hover:text-blue-500 transition-colors`}></i>
      </button>

      {/* 侧边栏主体 */}
      <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#09090b] min-h-screen hidden lg:block z-30 border-r border-gray-100 dark:border-zinc-900 shadow-2xl`}>
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 px-8 py-10'}`}>

          {/* Logo 区域 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-10">
            <div className="relative overflow-visible" style={{ width: '140px', minWidth: '140px' }}>
              <Logo {...props} />
              
              {/* 💡 电脑端展开时，在侧边栏底部放一个切换按钮（可选） */}
              <div className="absolute -right-16 top-0">
                 <button onClick={handleChangeDarkMode} className="p-2 text-zinc-400 hover:text-blue-500 transition-colors">
                    <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                 </button>
              </div>
            </div>
          </div>

          <div className="marquee-border-container mb-10 p-[2px] rounded-2xl overflow-hidden relative">
             <div className="relative z-10 bg-[#fffcf5] dark:bg-[#1a1610] rounded-2xl p-4">
                <Announcement post={notice} />
             </div>
          </div>

          <section className="mb-10">
            <SidebarTools />
          </section>

          <section className="mb-8">
            <SearchInput {...props} />
          </section>

          <section className="flex flex-col mb-10">
            <MenuList {...props} />
          </section>

          {/* 其他侧边栏内容保持原样... */}
          {latestPosts?.length > 0 && (
            <section className="flex flex-col mb-10">
              <ul className="space-y-3">
                {latestPosts.slice(0, 5).map((p) => (
                    <li key={p.id} className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-3">
                        <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} className="text-[13px] line-clamp-2">
                          {p.title}
                        </Link>
                    </li>
                ))}
              </ul>
              <div className="mt-4 hidden lg:block">
                  <SidebarChatWidget />
              </div>
            </section>
          )}

          <section className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <SocialButton />
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <div className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">{runtime}</div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default AsideLeft
