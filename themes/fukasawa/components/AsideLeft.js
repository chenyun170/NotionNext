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
import Link from 'next/link' // [新增] 引入Link用于热门文章跳转

/**
 * 侧边栏 - 升级版：含悬浮广告 + 热门文章
 */
function AsideLeft(props) {
  const {
    tagOptions,
    currentTag,
    categoryOptions,
    currentCategory,
    post,
    slot,
    notice,
    latestPosts = [] // [新增] 获取最新文章列表
  } = props
  const router = useRouter()
  const { fullWidth } = useGlobal()

  // --- 实时运行时间统计 ---
  const [runtime, setRuntime] = useState('')
  const START_TIME = '2024-05-01'

  useEffect(() => {
    const timer = setInterval(() => {
      const start = new Date(START_TIME)
      const now = new Date()
      const diff = now.getTime() - start.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setRuntime(`${days}天${hours}时${minutes}分${seconds}秒`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT =
    fullWidth ||
    siteConfig('FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT', null, CONFIG)

  const FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL = siteConfig(
    'FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL',
    false,
    CONFIG
  )

  const FUKASAWA_SIDEBAR_COLLAPSE_BUTTON = siteConfig(
    'FUKASAWA_SIDEBAR_COLLAPSE_BUTTON',
    null,
    CONFIG
  )

  const [isCollapsed, setIsCollapse] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('fukasawa-sidebar-collapse') === 'true' ||
        FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT
      )
    }
    return FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT
  })

  useEffect(() => {
    if (isBrowser) {
      localStorage.setItem('fukasawa-sidebar-collapse', isCollapsed)
    }
  }, [isCollapsed])

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const position = useMemo(() => {
    if (isCollapsed) {
      return isReverse ? 'right-2' : 'left-2'
    } else {
      return isReverse ? 'right-80' : 'left-80'
    }
  }, [isCollapsed])

  const toggleOpen = () => {
    setIsCollapse(!isCollapsed)
  }

  useEffect(() => {
    if (!FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL) return
    const handleResize = debounce(() => {
      if (window.innerWidth < 1366 || window.scrollY >= 1366) {
        setIsCollapse(true)
      } else {
        setIsCollapse(false)
      }
    }, 100)

    if (post) {
      window.addEventListener('resize', handleResize)
      window.addEventListener('scroll', handleResize, { passive: true })
    }

    return () => {
      if (post) {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('scroll', handleResize, { passive: true })
      }
    }
  }, [])

  return (
    <div
      className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-300 transition-all bg-white dark:bg-hexo-black-gray min-h-screen hidden lg:block z-20`}>
      
      {FUKASAWA_SIDEBAR_COLLAPSE_BUTTON && (
        <div
          className={`${position} hidden lg:block fixed top-0 cursor-pointer hover:scale-110 duration-300 px-3 py-2 dark:text-white`}
          onClick={toggleOpen}>
          {isCollapsed ? (
            <i className='fa-solid fa-indent text-xl'></i>
          ) : (
            <i className='fas fa-bars text-xl'></i>
          )}
        </div>
      )}

      <div className={`h-full ${isCollapsed ? 'hidden' : 'p-8'}`}>
        <div className="shimmer-logo-wrapper">
           <Logo {...props} />
        </div>

        <section className='siteInfo flex flex-col dark:text-gray-300 pt-8 italic opacity-80'>
          {siteConfig('DESCRIPTION')}
        </section>

        <section className='flex flex-col text-gray-600'>
          <div className='w-12 my-4 border-b-2 border-orange-500' />
          <MenuList {...props} />
        </section>

        {/* --- [新增功能 2] 热门文章 (显示最新5篇) --- */}
        {latestPosts && latestPosts.length > 0 && (
            <section className='flex flex-col text-gray-600 dark:text-gray-300'>
                <div className='w-12 my-4' />
                <div className='text-sm font-bold mb-3 flex items-center text-orange-600'>
                    <i className='fas fa-fire mr-2'></i> 热门文章
                </div>
                <ul className='space-y-2'>
                    {latestPosts.slice(0, 5).map((p, index) => (
                        <li key={p.id}>
                            <Link href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} passHref legacyBehavior>
                                <a className='text-xs hover:text-orange-500 hover:underline line-clamp-2 block'>
                                    <span className='mr-1.5 opacity-50'>{index + 1}.</span>
                                    {p.title}
                                </a>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        )}

        <section className='flex flex-col text-gray-600'>
          <div className='w-12 my-4' />
          <SearchInput {...props} />
        </section>

        {/* [已移除] 原来的 Announcement 位置，为了悬浮移到了最下面 */}

        <section className='rounded-xl overflow-hidden shadow-inner bg-gray-50 dark:bg-gray-900/20 p-2 mt-4'>
          <MailChimpForm />
        </section>

        <section className='mt-4'>
          <AdSlot type='in-article' />
        </section>

        {router.asPath !== '/tag' && (
          <section className='flex flex-col'>
            <div className='w-12 my-4' />
            <GroupTag tags={tagOptions} currentTag={currentTag} />
          </section>
        )}

        {router.asPath !== '/category' && (
          <section className='flex flex-col'>
            <div className='w-12 my-4' />
            <GroupCategory
              categories={categoryOptions}
              currentCategory={currentCategory}
            />
          </section>
        )}

        <section className='flex flex-col'>
          <div className='w-12 my-4' />
          <SocialButton />
          <SiteInfo />
          
          <div className='mt-6 border-t border-gray-100 dark:border-gray-800 pt-4'>
            <div className='flex items-center text-[11px] text-gray-400 dark:text-gray-500 mb-2'>
              <i className='fas fa-hourglass-half mr-2 animate-spin-slow text-orange-600'></i>
              <span>情报局运行时间</span>
            </div>
            <div className='font-mono text-[10px] text-slate-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 py-1.5 px-2 rounded border border-gray-100 dark:border-gray-800 tabular-nums text-center'>
              {runtime || 'Initializing...'}
            </div>
          </div>
        </section>

        <section className='flex justify-center dark:text-gray-200 pt-4'>
          <DarkModeButton />
        </section>

        {/* --- [新增功能 1] 悬浮广告区域 (Sticky) --- */}
        {/* max-h-screen 和 overflow-y-auto 确保如果内容太长也可以在内部滚动 */}
        <section className='sticky top-0 pt-8 flex flex-col max-h-screen overflow-y-auto no-scrollbar'>
          
          {/* 这里是你的活动广告，现在它会一直悬浮在左侧/右侧 */}
          <div className='mb-4 shadow-lg rounded-xl overflow-hidden bg-white dark:bg-hexo-black-gray'>
             <Announcement post={notice} />
          </div>

          <Catalog toc={post?.toc} />
          <div className='flex justify-center'>
            <div>{slot}</div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* 1. 极简星空粒子背景 */
        body::before {
          content: "";
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 25px 35px, #bbb, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 60px 100px, #ddd, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 110px 180px, #eee, rgba(0,0,0,0)),
            radial-gradient(1px 1px at 190px 50px, #fff, rgba(0,0,0,0)),
            radial-gradient(1.5px 1.5px at 150px 130px, #ccc, rgba(0,0,0,0));
          background-repeat: repeat;
          background-size: 250px 250px;
          opacity: 0.12;
          z-index: -1;
          pointer-events: none;
          animation: stars-drift 120s linear infinite;
        }
        .dark body::before {
          opacity: 0.25;
        }
        @keyframes stars-drift {
          from { transform: translateY(0); }
          to { transform: translateY(-250px); }
        }

        /* 2. Logo 流光 - 修复圣诞帽裁切 */
        .shimmer-logo-wrapper {
          position: relative;
          padding-top: 20px; 
          margin-top: -20px;
          overflow: visible; 
          mask-image: linear-gradient(-75deg, rgba(0,0,0,.6) 30%, #000 50%, rgba(0,0,0,.6) 70%);
          mask-size: 200%;
          animation: shimmer 4s infinite;
        }
        @keyframes shimmer {
          from { mask-position: 150%; }
          to { mask-position: -50%; }
        }

        /* 3. 全站文章图片美化 */
        #notion-article img, 
        .notion-asset-wrapper img,
        #article-wrapper img {
          border-radius: 12px !important;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15) !important;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          border: 1px solid rgba(0, 0, 0, 0.05) !important;
        }
        #notion-article img:hover, 
        #article-wrapper img:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25) !important;
        }
        .dark #notion-article img,
        .dark #article-wrapper img {
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }

        /* 4. 运行图标旋转 */
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* 5. 侧边栏菜单精致化 */
        .sideLeft nav a {
          transition: all 0.3s ease;
          border-radius: 6px;
        }
        .sideLeft nav a:hover {
          padding-left: 10px;
          background: rgba(234, 88, 12, 0.05);
          color: #ea580c !important;
        }
        
        /* 隐藏滚动条但保留功能 (用于悬浮区) */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default AsideLeft
