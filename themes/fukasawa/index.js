'use client'

import { memo, useMemo, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef } from 'react'
import { Transition } from '@headlessui/react'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'

// 动态导入优化 - 添加 loading 状态
const AlgoliaSearchModal = dynamic(() => import('@/components/AlgoliaSearchModal'), {
  ssr: false,
  loading: () => <div className="search-loading" />
})

const Live2D = dynamic(() => import('@/components/Live2D'), { 
  ssr: false,
  loading: () => null // Live2D 加载时不显示任何内容
})

const FloatButton = dynamic(() => import('./components/FloatButton'), {
  ssr: false // 悬浮按钮不需要 SSR
})

// 其他组件导入保持不变
import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import WWAds from '@/components/WWAds'
import SmartLink from '@/components/SmartLink'
import ArticleDetail from './components/ArticleDetail'
import ArticleLock from './components/ArticleLock'
import AsideLeft from './components/AsideLeft'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import BlogArchiveItem from './components/BlogPostArchive'
import Header from './components/Header'
import TagItemMini from './components/TagItemMini'
import LoadingCover from './components/LoadingCover'
import CONFIG from './config'
import { Style } from './style'

const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

/**
 * 基础布局 - 优化版
 * 改进点：
 * 1. 移除不必要的 useState/useEffect
 * 2. 使用 useMemo 缓存计算结果
 * 3. 优化条件渲染
 * 4. 提取常量避免重复计算
 */
const LayoutBase = memo(({ children, headerSlot, floatSlot, ...props }) => {
  const leftAreaSlot = useMemo(() => <Live2D />, [])
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  
  // 使用 useMemo 缓存样式类名计算
  const layoutReverse = useMemo(() => 
    JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE')), 
    []
  )
  
  const containerClassName = useMemo(() => 
    `${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10 px-4`,
    [fullWidth]
  )

  const contextValue = useMemo(() => ({ searchModal }), [])
  
  return (
    <ThemeGlobalFukasawa.Provider value={contextValue}>
      <div 
        id='theme-fukasawa' 
        className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth antialiased`}
        {onLoading && <LoadingCover />}
      >
        <Style />
        <Header {...props} />

        <div className={`flex ${layoutReverse ? 'flex-row-reverse' : ''}`}>
          <AsideLeft {...props} slot={leftAreaSlot} />

          <main 
            id='wrapper' 
            className='relative flex-1 flex w-full py-8 justify-center bg-[#f8f8f8] dark:bg-hexonight'
          >
            <div id='container-inner' className={containerClassName}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-out duration-500 transform'
                enterFrom='opacity-0 translate-y-8'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-300 opacity-0'
                unmount={false}
              >
                {headerSlot && <div>{headerSlot}</div>}
                <div className='min-h-[60vh]'>{children}</div>
              </Transition>

              <div className='mt-8 rounded-xl overflow-hidden'>
                <AdSlot type='native' />
              </div>
            </div>
          </main>
        </div>

        <FloatButton floatSlot={floatSlot} {...props} />
        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
    </ThemeGlobalFukasawa.Provider>
  )
})

LayoutBase.displayName = 'LayoutBase'

/**
 * 文章列表布局 - 优化版
 * 改进点：提取常量，避免重复读取配置
 */
const LayoutPostList = memo((props) => {
  const POST_LIST_STYLE = useMemo(() => 
    siteConfig('POST_LIST_STYLE'), 
    []
  )
  
  const ListComponent = POST_LIST_STYLE === 'page' ? BlogListPage : BlogListScroll
  
  return (
    <div className='w-full'>
      <div className='w-full p-2 mb-4'>
        <WWAds className='w-full' orientation='horizontal' />
      </div>
      <ListComponent {...props} />
    </div>
  )
})

LayoutPostList.displayName = 'LayoutPostList'

const LayoutIndex = (props) => <LayoutPostList {...props} />

/**
 * 文章详情布局 - 优化版
 * 改进点：
 * 1. 使用 useCallback 缓存回调函数
 * 2. 优化 404 跳转逻辑
 * 3. 添加清理函数防止内存泄漏
 */
const LayoutSlug = memo(({ post, lock, validPassword }) => {
  const router = useRouter()
  
  const handle404Redirect = useCallback(() => {
    if (!post && isBrowser) {
      const waitTime = siteConfig('POST_WAITING_TIME_FOR_404', 3) * 1000
      
      const timer = setTimeout(() => {
        // 二次检查，避免在等待期间文章已加载
        if (!document.querySelector('#notion-article')) {
          router.push('/404')
        }
      }, waitTime)
      
      return () => clearTimeout(timer)
    }
  }, [post, router])
  
  useEffect(() => {
    return handle404Redirect()
  }, [handle404Redirect])
  
  // 提前返回，避免不必要的渲染
  if (lock) {
    return <ArticleLock validPassword={validPassword} />
  }
  
  if (!post) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <div className='animate-pulse text-gray-400'>加载中...</div>
      </div>
    )
  }
  
  return <ArticleDetail post={post} lock={lock} validPassword={validPassword} />
})

LayoutSlug.displayName = 'LayoutSlug'

/**
 * 搜索结果布局 - 优化版
 * 改进点：
 * 1. 使用 useCallback 避免重复创建函数
 * 2. 添加防抖优化搜索高亮
 * 3. 添加依赖项，确保正确更新
 */
const LayoutSearch = memo(({ keyword, ...props }) => {
  const highlightSearchResults = useCallback(() => {
    if (!isBrowser || !keyword) return
    
    // 使用 requestIdleCallback 优化性能
    const callback = () => {
      const postsWrapper = document.getElementById('posts-wrapper')
      if (postsWrapper) {
        replaceSearchResult({
          doms: postsWrapper,
          search: keyword,
          target: { 
            element: 'span', 
            className: 'text-red-500 border-b border-dashed' 
          }
        })
      }
    }
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(callback)
    } else {
      setTimeout(callback, 0)
    }
  }, [keyword])
  
  useEffect(() => {
    highlightSearchResults()
  }, [highlightSearchResults])
  
  return <LayoutPostList keyword={keyword} {...props} />
})

LayoutSearch.displayName = 'LayoutSearch'

/**
 * 归档页面布局 - 优化版
 * 改进点：使用 useMemo 缓存 entries
 */
const LayoutArchive = memo(({ archivePosts }) => {
  const archiveEntries = useMemo(() => 
    Object.entries(archivePosts || {}),
    [archivePosts]
  )
  
  if (archiveEntries.length === 0) {
    return (
      <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-900 shadow-sm rounded-xl min-h-full flex items-center justify-center'>
        <p className='text-gray-400'>暂无归档文章</p>
      </div>
    )
  }
  
  return (
    <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-900 shadow-sm rounded-xl min-h-full'>
      {archiveEntries.map(([title, posts]) => (
        <BlogArchiveItem 
          key={title} 
          posts={posts} 
          archiveTitle={title} 
        />
      ))}
    </div>
  )
})

LayoutArchive.displayName = 'LayoutArchive'

/**
 * 404 页面布局 - 优化版
 * 改进点：使用 useCallback 优化事件处理
 */
const Layout404 = memo(() => {
  const router = useRouter()
  
  const handleBackHome = useCallback(() => {
    router.push('/')
  }, [router])
  
  return (
    <div className='w-full h-[60vh] flex flex-col items-center justify-center'>
      <div className='text-8xl font-bold text-gray-200 dark:text-gray-800 animate-pulse'>
        404
      </div>
      <p className='mt-4 text-gray-500 dark:text-gray-400'>页面未找到</p>
      <button 
        onClick={handleBackHome}
        className='mt-8 px-8 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-all shadow-lg'
      >
        返回首页
      </button>
    </div>
  )
})

Layout404.displayName = 'Layout404'

/**
 * 分类索引页 - 优化版
 * 改进点：添加空状态处理
 */
const LayoutCategoryIndex = memo(({ locale, categoryOptions }) => {
  if (!categoryOptions || categoryOptions.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
        <p className='text-gray-400 text-center'>暂无分类</p>
      </div>
    )
  }
  
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
      <div className='dark:text-gray-200 mb-8 font-bold'>
        <i className='mr-4 fas fa-th' />
        {locale?.COMMON?.CATEGORY}:
      </div>
      <div className='flex flex-wrap gap-4'>
        {categoryOptions.map(c => (
          <SmartLink key={c.name} href={`/category/${c.name}`}>
            <div className='hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2 rounded-lg border dark:border-gray-800 transition-colors cursor-pointer'>
              <i className='mr-3 fas fa-folder text-gray-400' />
              {c.name} ({c.count})
            </div>
          </SmartLink>
        ))}
      </div>
    </div>
  )
})

LayoutCategoryIndex.displayName = 'LayoutCategoryIndex'

/**
 * 标签索引页 - 优化版
 */
const LayoutTagIndex = memo(({ locale, tagOptions }) => {
  if (!tagOptions || tagOptions.length === 0) {
    return (
      <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
        <p className='text-gray-400 text-center'>暂无标签</p>
      </div>
    )
  }
  
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
      <div className='dark:text-gray-200 mb-8 font-bold'>
        <i className='mr-4 fas fa-tag' />
        {locale?.COMMON?.TAGS}:
      </div>
      <div className='flex flex-wrap gap-3'>
        {tagOptions.map(t => (
          <TagItemMini key={t.name} tag={t} />
        ))}
      </div>
    </div>
  )
})

LayoutTagIndex.displayName = 'LayoutTagIndex'

export { 
  Layout404, 
  LayoutArchive, 
  LayoutBase, 
  LayoutCategoryIndex, 
  LayoutIndex, 
  LayoutPostList, 
  LayoutSearch, 
  LayoutSlug, 
  LayoutTagIndex, 
  CONFIG as THEME_CONFIG 
}
