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
import ForeignTradeDashboard from './ForeignTradeDashboard'
import Link from 'next/link'

function AsideLeft(props) {
  const { tagOptions, currentTag, categoryOptions, currentCategory, post, slot, notice, latestPosts = [] } = props
  const router = useRouter()
  const { fullWidth } = useGlobal()
  const [runtime, setRuntime] = useState('')
  const START_TIME = '2024-05-01T00:00:00'

  useEffect(() => {
    const updateRuntime = () => {
      const start = new Date(START_TIME)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setRuntime(`${days}天${hours}时${minutes}分${seconds}秒`)
    }
    updateRuntime()
    const timer = setInterval(updateRuntime, 1000)
    return () => clearInterval(timer)
  }, [])

  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fukasawa-sidebar-collapse') === 'true' || fullWidth
    }
    return fullWidth
  })

  return (
    <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#121212] min-h-screen hidden lg:block z-20 border-r border-gray-50 dark:border-gray-900`}>
      <div className={`h-full ${isCollapsed ? 'hidden' : 'px-6 py-10'} flex flex-col overflow-y-auto`}>
        <Logo {...props} />
        
        {/* 外贸工作台组件 */}
        <section className='mb-8'>
           <ForeignTradeDashboard />
        </section>

        {/* 导航菜单 */}
        <section className='menu-nav-wrapper flex flex-col mb-8'>
          <div className='flex items-center text-[11px] font-bold text-gray-400 dark:text-gray-500 tracking-widest uppercase mb-4'>
            <span className='mr-2'>Navigation</span>
            <div className='flex-grow border-b border-gray-50 dark:border-gray-800 opacity-50' />
          </div>
          <MenuList {...props} />
        </section>

        {/* --- 活动卡片区域 --- */}
        <section className='space-y-4 mb-8'>
          {/* 活动一 */}
          <div className='relative p-4 pl-5 rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/20 dark:bg-orange-950/5 transition-all hover:shadow-md group'>
            <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500 rounded-l-xl' />
            <div className='flex items-center text-orange-600 dark:text-orange-400 font-bold text-[12px] mb-2 uppercase tracking-tighter'>
              <i className='fas fa-gift mr-2 animate-bounce'></i>
              <span>活动一：图灵搜岁末活动</span>
            </div>
            <p className='text-[11px] text-gray-500 dark:text-gray-400 leading-snug mb-3'>
              🔥 获客工具原价 <span className='line-through'>¥2180</span>，现仅需 <span className='font-bold text-orange-600'>¥1680</span>！
            </p>
            <button className='w-full py-2 bg-orange-500 text-white text-[11px] font-bold rounded-lg'>立即领取</button>
          </div>

          {/* 活动二 */}
          <div className='relative p-4 pl-5 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 dark:bg-blue-950/5 transition-all hover:shadow-md group'>
            <div className='absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-xl' />
            <div className='flex items-center text-blue-600 dark:text-blue-400 font-bold text-[12px] mb-2 uppercase tracking-tighter'>
              <i className='fas fa-rocket mr-2'></i>
              <span>活动二：顶易云岁末赠送</span>
            </div>
            <p className='text-[11px] text-gray-500 dark:text-gray-400 leading-snug mb-3'>
              🚀 购高阶获客工具，限时赠送 <span className='font-bold text-blue-600'>社群搜索工具</span>！
            </p>
            <button className='w-full py-2 bg-blue-500 text-white text-[11px] font-bold rounded-lg'>查看详情</button>
          </div>
        </section>

        <section className='mt-auto pt-10 border-t border-gray-50 dark:border-gray-900'>
          <div className='mt-4 p-4 bg-gray-50 dark:bg-gray-900/60 rounded-2xl text-center'>
            <div className='text-[10px] text-gray-400 font-bold mb-2 uppercase'>System Operational</div>
            <div className='font-mono text-[11px] text-orange-600 font-bold'>{runtime || 'Initializing...'}</div>
          </div>
          <div className='flex justify-center mt-6'><DarkModeButton /></div>
        </section>
      </div>
    </div>
  )
}
export default AsideLeft
