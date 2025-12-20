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

function AsideLeft(props) {
  const { tagOptions, currentTag, categoryOptions, currentCategory, post, slot, notice } = props
  const router = useRouter()
  const { fullWidth } = useGlobal()
  const [runtime, setRuntime] = useState('')
  const START_TIME = '2024-05-01'

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(START_TIME); const now = new Date()
      const diff = now.getTime() - start.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setRuntime(`${days}天${hours}时${minutes}分${seconds}秒`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fukasawa-sidebar-collapse') === 'true'
    }
    return false
  })

  return (
    <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-300 transition-all bg-white dark:bg-hexo-black-gray min-h-screen hidden lg:block z-20`}>
      <div className={`h-full ${isCollapsed ? 'hidden' : 'p-8'} relative z-10`}>
        <div className="shimmer-logo-wrapper"><Logo {...props} /></div>
        <section className='siteInfo pt-8 italic opacity-80'>{siteConfig('DESCRIPTION')}</section>
        <section className='flex flex-col text-gray-600'><div className='w-12 my-4 border-b-2 border-orange-500' /><MenuList {...props} /></section>
        <section className='mt-6 border-t border-gray-100 dark:border-gray-800 pt-4'>
            <div className='flex items-center text-[11px] text-gray-400 mb-2'><i className='fas fa-hourglass-half mr-2 animate-spin-slow text-orange-600'></i><span>情报局运行时间</span></div>
            <div className='font-mono text-[10px] text-slate-600 dark:text-gray-400 bg-gray-50/50 py-1.5 px-2 rounded border border-gray-100 tabular-nums text-center'>{runtime || 'Initializing...'}</div>
        </section>
        <section className='flex justify-center pt-4'><DarkModeButton /></section>
        <section className='sticky top-0 pt-12 flex flex-col max-h-screen '><Catalog toc={post?.toc} /><div className='flex justify-center'>{slot}</div></section>
      </div>

      <style jsx global>{`
        /* 1. 纯净底层星空：只在背景层显示，不穿透容器 */
        body {
          background-color: #f0f2f5 !important; /* 稍微深一点的底色，让星星更明显 */
        }
        .dark body {
          background-color: #050505 !important;
        }

        body::before {
          content: "";
          position: fixed;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background-image: 
            radial-gradient(1.2px 1.2px at 25px 35px, #888, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 60px 100px, #aaa, rgba(0,0,0,0)),
            radial-gradient(1.2px 1.2px at 110px 180px, #999, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 300px 300px;
          opacity: 0.25; /* 调高亮度，确保能看到 */
          z-index: -1;
          pointer-events: none;
          animation: stars-drift 150s linear infinite;
        }

        @keyframes stars-drift {
          from { transform: translateY(0); }
          to { transform: translateY(-300px); }
        }

        /* 2. Logo 流光保持 */
        .shimmer-logo-wrapper {
          position: relative; padding-top: 20px; margin-top: -20px; overflow: visible; 
          mask-image: linear-gradient(-75deg, rgba(0,0,0,.6) 30%, #000 50%, rgba(0,0,0,.6) 70%);
          mask-size: 200%; animation: shimmer 4s infinite;
        }
        @keyframes shimmer { from { mask-position: 150%; } to { mask-position: -50%; } }
      `}</style>
    </div>
  )
}
export default AsideLeft
