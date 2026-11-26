'use client'

import { memo, useMemo, useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef } from 'react'
import BLOG from '@/blog.config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'

// 动态导入优化 - 添加 loading 状态
const AlgoliaSearchModal = dynamic(() => import('@/components/AlgoliaSearchModal'), {
  ssr: false,
  loading: () => <div className="search-loading" />
})

const ChatModal = dynamic(() => import('./components/ChatModal'), {
  ssr: false,
  loading: () => null
})

const FloatButton = dynamic(() => import('./components/FloatButton'), {
  ssr: false // 悬浮按钮不需要 SSR
})

const ArticleDetail = dynamic(() => import('./components/ArticleDetail'), {
  loading: () => (
    <div className='flex min-h-[60vh] items-center justify-center text-sm text-stone-400'>
      文章加载中...
    </div>
  )
})

import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import WWAds from '@/components/WWAds'
import SmartLink from '@/components/SmartLink'
import Announcement from './components/Announcement'
import ArticleLock from './components/ArticleLock'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import BlogArchiveItem from './components/BlogPostArchive'
import Header from './components/Header'
import DesktopTopNav from './components/DesktopTopNav'
import SiteFooter from './components/SiteFooter'
import HomeFeaturedLinks from './components/HomeFeaturedLinks'
import HomeIntro from './components/HomeIntro'
import SearchResourceLinks from './components/SearchResourceLinks'
import SkillSearchPromo from './components/SkillSearchPromo'
import TagItemMini from './components/TagItemMini'
import TopicIntro from './components/TopicIntro'
import LoadingCover from './components/LoadingCover'
import CONFIG from './config'
import { Style } from './style'

const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

function parseConfigBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value === 'true'
  }

  return Boolean(value)
}

function getConfigValue(global, notionConfig, key, defaultValue) {
  return (
    notionConfig?.[key] ??
    global?.NOTION_CONFIG?.[key] ??
    global?.THEME_CONFIG?.[key] ??
    CONFIG?.[key] ??
    BLOG?.[key] ??
    defaultValue
  )
}

/**
 * 基础布局 - 优化版
 * 改进点：
 * 1. 移除不必要的 useState/useEffect
 * 2. 使用 useMemo 缓存计算结果
 * 3. 优化条件渲染
 * 4. 提取常量避免重复计算
 */
const LayoutBase = memo(({ children, headerSlot, floatSlot, ...props }) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const global = useGlobal()
  const { onLoading, fullWidth } = global
  const searchModal = useRef(null)
  const fontStyle = getConfigValue(global, props?.NOTION_CONFIG, 'FONT_STYLE', '')

  const containerClassName = useMemo(
    () =>
      `${fullWidth ? 'max-w-full' : 'max-w-6xl'} mx-auto w-full px-4 sm:px-6 lg:px-8`,
    [fullWidth]
  )

  const contextValue = useMemo(() => ({ searchModal }), [])

  return (
    <ThemeGlobalFukasawa.Provider value={contextValue}>
      <div
        id='theme-fukasawa'
        className={`${fontStyle} min-h-screen overflow-x-clip scroll-smooth antialiased dark:bg-[#131210]`}
      >
        {onLoading && <LoadingCover />}
        <Style />
        <Header {...props} />
        <DesktopTopNav {...props} />

        <main id='wrapper' className='relative w-full py-6 sm:py-8'>
          <div id='container-inner' className={containerClassName}>
            {headerSlot && <div className='mb-6'>{headerSlot}</div>}
            <div className='min-h-[60vh]'>{children}</div>

            <div className='mt-8 overflow-hidden rounded-xl'>
              <AdSlot type='native' />
            </div>
          </div>
        </main>

        <SiteFooter />

        <FloatButton
          floatSlot={floatSlot}
          onOpenChat={() => setIsChatOpen(true)}
          {...props}
        />
        <AlgoliaSearchModal cRef={searchModal} {...props} />
        <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
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
  const POST_LIST_STYLE = useMemo(
    () => getConfigValue(null, props?.NOTION_CONFIG, 'POST_LIST_STYLE', 'page'),
    [props?.NOTION_CONFIG]
  )
  const showHomeIntro = !props?.category && !props?.tag && !props?.keyword && !props?.page
  const showTopicIntro = props?.category || props?.tag || props?.keyword
  const topicKeyword = props?.keyword || props?.category || props?.tag
  
  const ListComponent = POST_LIST_STYLE === 'page' ? BlogListPage : BlogListScroll
  
  return (
    <div className='w-full'>
      {showHomeIntro && <HomeIntro {...props} />}
      {showHomeIntro && <Announcement post={props?.notice} className='mb-6' />}
      {showHomeIntro && <HomeFeaturedLinks />}
      {showTopicIntro && <TopicIntro {...props} />}
      {topicKeyword && (
        <SkillSearchPromo
          keyword={topicKeyword}
          forceShow={Boolean(
            props?.category && /海关数据/.test(String(props.category))
          )}
        />
      )}
      {props?.keyword && <SearchResourceLinks keyword={props.keyword} />}
      {!showHomeIntro && (
        <div className='mb-4 w-full p-2'>
          <WWAds className='w-full' orientation='horizontal' />
        </div>
      )}
      <ListComponent {...props} showInlineAd={showHomeIntro} />
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
const LayoutSlug = memo((props) => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waitingTimeFor404 = Number(BLOG.POST_WAITING_TIME_FOR_404 || 3)
  
  const handle404Redirect = useCallback(() => {
    if (!post && isBrowser) {
      const waitTime = waitingTimeFor404 * 1000
      
      const timer = setTimeout(() => {
        // 二次检查，避免在等待期间文章已加载
        if (!document.querySelector('#notion-article')) {
          router.push('/404')
        }
      }, waitTime)
      
      return () => clearTimeout(timer)
    }
  }, [post, router, waitingTimeFor404])
  
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
        <div className='animate-pulse text-stone-400'>加载中...</div>
      </div>
    )
  }
  
  return <ArticleDetail {...props} />
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
            className: 'text-stone-800 border-b border-dashed dark:text-stone-200' 
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
      <div className='rounded-2xl border border-stone-200/80 bg-white p-10 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900'>
        <div className='mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f0ec] text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
          <i className='fas fa-box-archive' />
        </div>
        <p className='text-sm font-medium text-stone-600 dark:text-stone-300'>暂无归档文章</p>
      </div>
    )
  }

  return (
    <div className='mb-10 rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-8 lg:p-10 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
      <div className='mb-8 border-b border-stone-200/80 pb-5 dark:border-stone-800'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
          <span className='h-1.5 w-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
          Content Archive
        </span>
        <h1 className='mt-2 text-2xl font-black text-stone-950 dark:text-stone-50'>
          文章时间线归档
        </h1>
      </div>
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
const Layout404Legacy = memo(() => {
  const router = useRouter()
  
  const handleBackHome = useCallback(() => {
    router.push('/')
  }, [router])
  
  return (
    <div className='w-full h-[60vh] flex flex-col items-center justify-center'>
      <div className='text-8xl font-bold text-stone-200 dark:text-stone-800 animate-pulse'>
        404
      </div>
      <p className='mt-4 text-stone-500 dark:text-stone-400'>页面未找到</p>
      <button 
        onClick={handleBackHome}
        className='mt-8 px-8 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-all shadow-lg'
      >
        返回首页
      </button>
    </div>
  )
})

const SnapshotItem = ({ label, value }) => (
  <div className='flex items-start justify-between gap-4 border-b border-dashed border-stone-200 pb-2 last:border-b-0 dark:border-stone-800'>
    <span className='text-stone-400'>{label}</span>
    <span className='text-right font-semibold text-stone-700 dark:text-stone-200'>{value}</span>
  </div>
)

const Layout404 = memo((props) => {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const { siteInfo, latestPosts = [], categoryOptions = [], tagOptions = [] } = props
  const recommendedPosts = latestPosts?.slice(0, 4) || []
  const categories = categoryOptions?.filter(item => item?.name)?.slice(0, 6) || []
  const tags = tagOptions?.filter(item => item?.name)?.slice(0, 10) || []

  const handleBackHome = useCallback(() => {
    router.push('/')
  }, [router])

  const handleSearch = useCallback(event => {
    event.preventDefault()
    const value = keyword.trim()
    if (value) {
      router.push(`/search/${encodeURIComponent(value)}`)
    }
  }, [keyword, router])

  return (
    <>
      <Head>
        <title>{`${siteInfo?.title || BLOG.TITLE || '外贸获客情报局'} | 页面找不到啦`}</title>
      </Head>
      <div className='min-h-screen bg-[#f7f5f1] px-4 py-10 text-stone-900 dark:bg-[#131210] dark:text-stone-100 sm:px-6 lg:px-8'>
      <main className='mx-auto max-w-6xl'>
        <section className='overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900'>
          <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]'>
            <div className='p-6 sm:p-8 lg:p-10'>
              <div className='mb-4 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                <span className='h-2 w-2 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
                <span>Content Recovery</span>
              </div>
              <div className='text-7xl font-black leading-none text-stone-200 dark:text-stone-800 sm:text-8xl'>
                404
              </div>
              <h1 className='mt-5 text-2xl font-black leading-tight text-stone-950 dark:text-stone-50 sm:text-3xl'>
                这个链接暂时没有找到
              </h1>
              <p className='mt-3 max-w-2xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
                可能是文章地址已更新、Notion 页面还未同步，或者链接输入有误。可以搜索关键词，或从热门文章和分类继续浏览。
              </p>

              <form onSubmit={handleSearch} className='mt-6 flex max-w-2xl flex-col gap-2.5 sm:flex-row'>
                <label className='sr-only' htmlFor='not-found-search'>
                  搜索站内文章
                </label>
                <input
                  id='not-found-search'
                  value={keyword}
                  onChange={event => setKeyword(event.target.value)}
                  placeholder='搜索海关数据、WhatsApp、AI 外贸工具...'
                  className='h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-[#faf9f6] px-4 text-sm text-stone-900 outline-none transition focus:border-[#1c5a4a] focus:bg-white dark:border-stone-800 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-[#6bc4a6]'
                />
                <button
                  type='submit'
                  className='h-11 rounded-xl bg-[#1c5a4a] px-5 text-sm font-bold text-white transition hover:bg-[#154639] dark:bg-[#1c5a4a] dark:hover:bg-[#236f5b]'>
                  搜索文章
                </button>
              </form>

              <div className='mt-5 flex flex-wrap gap-2.5'>
                <button
                  onClick={handleBackHome}
                  className='inline-flex h-10 items-center rounded-xl border border-stone-200 bg-[#faf9f6] px-4 text-sm font-semibold text-stone-700 transition hover:border-[#1c5a4a]/40 hover:text-[#1c5a4a] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-[#6bc4a6]/50 dark:hover:text-[#6bc4a6]'>
                  <i className='fas fa-home mr-2 text-xs' />
                  返回首页
                </button>
                <SmartLink
                  href='/archive'
                  className='inline-flex h-10 items-center rounded-xl border border-stone-200 bg-[#faf9f6] px-4 text-sm font-semibold text-stone-700 transition hover:border-[#1c5a4a]/40 hover:text-[#1c5a4a] dark:border-stone-800 dark:bg-stone-950 dark:text-stone-200 dark:hover:border-[#6bc4a6]/50 dark:hover:text-[#6bc4a6]'>
                  <i className='fas fa-clock-rotate-left mr-2 text-xs' />
                  查看归档
                </SmartLink>
              </div>
            </div>

            <aside className='border-t border-stone-200/80 bg-[#faf9f6] p-6 dark:border-stone-800 dark:bg-stone-950/60 lg:border-l lg:border-t-0'>
              <div className='text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                Site Snapshot
              </div>
              <div className='mt-4 space-y-3 text-sm text-stone-600 dark:text-stone-300'>
                <SnapshotItem label='站点' value={siteInfo?.title || '外贸获客情报局'} />
                <SnapshotItem label='分类' value={`${categoryOptions?.length || 0} 个主题`} />
                <SnapshotItem label='标签' value={`${tagOptions?.length || 0} 个标签`} />
              </div>
            </aside>
          </div>
        </section>

        <section className='mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)]'>
          <div className='rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
            <div className='mb-4'>
              <div className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                <i className='fas fa-fire-alt' />
                <span>Trending Now</span>
              </div>
              <h2 className='text-xl font-black text-stone-950 dark:text-stone-50'>
                也许你想找这些文章
              </h2>
            </div>

            {recommendedPosts.length > 0 ? (
              <div className='grid gap-3 sm:grid-cols-2'>
                {recommendedPosts.map((post, index) => (
                  <SmartLink
                    key={post.id || post.slug}
                    href={post.href || `/${post.slug}`}
                    className='group rounded-xl border border-stone-200/80 bg-[#faf9f6] p-4 transition-all hover:border-[#1c5a4a]/40 hover:bg-white hover:shadow-sm dark:border-stone-800 dark:bg-stone-950/60 dark:hover:border-[#6bc4a6]/40 dark:hover:bg-[#1c1a17]'>
                    <div className='mb-3 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400'>
                      <span className='flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f0ec] font-bold text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
                        {index + 1}
                      </span>
                      {post.category && <span className='font-medium'>{post.category}</span>}
                    </div>
                    <h3 className='line-clamp-2 text-sm font-bold leading-6 text-stone-900 group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6]'>
                      {post.title}
                    </h3>
                    {post.summary && (
                      <p className='mt-2 line-clamp-2 text-xs leading-5 text-stone-500 dark:text-stone-400'>
                        {post.summary}
                      </p>
                    )}
                  </SmartLink>
                ))}
              </div>
            ) : (
              <p className='text-sm text-stone-500 dark:text-stone-400'>
                暂时没有可推荐文章，可以先返回首页查看最新内容。
              </p>
            )}
          </div>

          <div className='space-y-6'>
            {categories.length > 0 && (
              <section className='rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
                <div className='mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                  <i className='fas fa-folder-open' />
                  <span>Categories</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {categories.map(category => (
                    <SmartLink
                      key={category.name}
                      href={`/category/${encodeURIComponent(category.name)}`}
                      className='rounded-xl border border-stone-200/80 bg-[#faf9f6] px-3 py-2 text-xs font-semibold text-stone-700 transition hover:border-[#1c5a4a]/40 hover:bg-[#f4f8f6] hover:text-[#1c5a4a] dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300 dark:hover:border-[#6bc4a6]/40 dark:hover:text-[#6bc4a6]'>
                      {category.name}
                      {category.count ? ` · ${category.count}` : ''}
                    </SmartLink>
                  ))}
                </div>
              </section>
            )}

            {tags.length > 0 && (
              <section className='rounded-2xl border border-stone-200/80 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
                <div className='mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                  <i className='fas fa-tags' />
                  <span>Hot Tags</span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {tags.map(tag => (
                    <TagItemMini key={tag.name} tag={tag} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
      </div>
    </>
  )
})

Layout404Legacy.displayName = 'Layout404Legacy'
Layout404.displayName = 'Layout404'

/**
 * 分类索引页 - 优化版
 * 改进点：添加空状态处理
 */
const LayoutCategoryIndex = memo(({ locale, categoryOptions }) => {
  if (!categoryOptions || categoryOptions.length === 0) {
    return (
      <div className='rounded-2xl border border-stone-200/80 bg-white p-10 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900'>
        <p className='text-sm text-stone-500 dark:text-stone-400'>暂无分类</p>
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
      <div className='mb-6 border-b border-stone-200/80 pb-5 dark:border-stone-800'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
          <span className='h-1.5 w-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
          Topics Directory
        </span>
        <h1 className='mt-2 flex items-center gap-3 text-2xl font-black text-stone-950 dark:text-stone-50'>
          <span>{locale?.COMMON?.CATEGORY || '专题分类'}</span>
          <span className='rounded-full bg-[#e8f0ec] px-2.5 py-0.5 text-xs font-semibold text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
            {categoryOptions.length} 个主题
          </span>
        </h1>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {categoryOptions.map(c => (
          <SmartLink
            key={c.name}
            href={`/category/${encodeURIComponent(c.name)}`}
            className='group flex items-center justify-between rounded-xl border border-stone-200/80 bg-[#faf9f6] px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:border-[#1c5a4a]/40 hover:bg-white hover:shadow-sm dark:border-stone-800 dark:bg-stone-950/60 dark:hover:border-[#6bc4a6]/40 dark:hover:bg-[#1c1a17]'>
            <span className='flex items-center gap-3 text-sm font-bold text-stone-800 group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6]'>
              <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f0ec] text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
                <i className='fas fa-folder text-xs' />
              </span>
              {c.name}
            </span>
            <span className='rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-stone-500 border border-stone-200/70 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400'>
              {c.count}
            </span>
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
      <div className='rounded-2xl border border-stone-200/80 bg-white p-10 text-center shadow-sm dark:border-stone-800 dark:bg-stone-900'>
        <p className='text-sm text-stone-500 dark:text-stone-400'>暂无标签</p>
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-stone-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-stone-800 dark:bg-stone-900'>
      <div className='mb-6 border-b border-stone-200/80 pb-5 dark:border-stone-800'>
        <span className='inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
          <span className='h-1.5 w-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
          Tags Index
        </span>
        <h1 className='mt-2 flex items-center gap-3 text-2xl font-black text-stone-950 dark:text-stone-50'>
          <span>{locale?.COMMON?.TAGS || '标签索引'}</span>
          <span className='rounded-full bg-[#e8f0ec] px-2.5 py-0.5 text-xs font-semibold text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
            {tagOptions.length} 个标签
          </span>
        </h1>
      </div>
      <div className='flex flex-wrap gap-2.5'>
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
