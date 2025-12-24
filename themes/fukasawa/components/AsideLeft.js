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
 * 侧边栏 - 修复语法错误版本
 */
function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)

  useEffect(() => {
    setIsCollapse(localStorage.getItem('fukasawa-sidebar-collapse') === 'true')
    const timer = setInterval(() => {
      const diff = new Date().getTime() - new Date('2024-05-01').getTime()
      if (diff < 0) return
      setRuntime(`${Math.floor(diff / 86400000)}天 ${Math.floor((diff % 86400000) / 3600000)}时 ${Math.floor((diff % 3600000) / 60000)}分`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const toggleCollapse = () => {
    const newState = !isCollapsed
    setIsCollapse(newState)
    localStorage.setItem('fukasawa-sidebar-collapse', newState)
  }

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[18.5rem]' : 'left-[18.5rem]')

  return (
    <>
      {/* 1. 折叠按钮 - 独立于侧边栏，修复 JSX 根元素报错 */}
      <button 
        onClick={toggleCollapse}
        className={`${btnPosition} fixed top-6 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-zinc-700 transition-all duration-500 hover:scale-110 active:scale-95 group`}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-blue-500' : 'fa-chevron-left text-gray-400'} text-sm group-hover:text-blue-500 transition-colors`}></i>
      </button>

      {/* 2. 侧边栏本体 */}
      <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#09090b] min-h-screen hidden lg:block z-30 border-r border-gray-100 dark:border-zinc-900 shadow-2xl`}>
        
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible pointer-events-none' : 'opacity-100 px-8 py-10'}`}>
          
          {/* Logo 区块 - 限制缩小 */}
          <div className="mb-4 transform scale-90 origin-left transition-transform duration-500">
            <Logo {...props} />
          </div>

          <section className='siteInfo relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 mb-8 font-light text-[11px] italic text-zinc-400 leading-relaxed'>
            {siteConfig('DESCRIPTION')}
          </section>

          {/* 活动功能区 - 已移除喇叭 animate-bounce */}
          <section className='mb-8 bg-gradient-to-br from-amber-50 to-orange-50/50 dark:from-amber-950/20 rounded-2xl p-4 border border-amber-100/50 dark:border-amber-900/30 shadow-sm'>
             <div className='flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mb-3 px-1'>
                <i className="fas fa-bullhorn mr-2"></i> 
                <span>活动公告 / SPECIAL EVENTS</span>
             </div>
             <Announcement post={notice} />
          </section>

          {/* 搜索 */}
          <section className='mb-8 group'>
            <div className='flex items-center text-[10px] font-bold text-zinc-400 dark:text-zinc-600 tracking-widest uppercase mb-4 px-1'>
              <span>Quick Search</span>
              <div className='flex-grow border-b border-zinc-100 dark:border-zinc-800 ml-4 opacity-30' />
            </div>
            <div className='bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800 focus-within:ring-2 ring-blue-500/20 transition-all'>
              <SearchInput {...props} />
            </div>
          </section>

          {/* 外贸工具 */}
          <section className='mb-10'>
            <div className='flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase mb-5 px-1'>
              <i className='fas fa-terminal mr-2 opacity-50'></i>
              <span>Trade Terminal</span>
            </div>
            <SidebarTools />
          </section>

          {/* 菜单 */}
          <section className='flex flex-col mb-10'>
            <MenuList {...props} />
          </section>

          {/* 底部系统状态 */}
          <section className='mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900'>
            <SocialButton />
            <div className='mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center'>
              <div className='flex items-center justify-center text-[9px] text-zinc-400 mb-3 tracking-widest uppercase font-black'>
                <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-ping" />
                <span>System Online</span>
              </div>
              <div className='font-mono text-[11px] text-zinc-800 dark:text-zinc-200 font-bold'>
                {runtime || 'SYNCING...'}
              </div>
            </div>
          </section>

          {post?.toc && (
            <section className='sticky top-6 mt-8 pt-6 max-h-[60vh] overflow-y-auto no-scrollbar border-t dark:border-zinc-800'>
              <Catalog toc={post.toc} />
            </section>
          )}
        </div>
      </div>
    </>
  )
}

export default AsideLeft
