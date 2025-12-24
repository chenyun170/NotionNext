'use client'

import AlgoliaSearchModal from '@/components/AlgoliaSearchModal'
import { AdSlot } from '@/components/GoogleAdsense'
import replaceSearchResult from '@/components/Mark'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import dynamic from 'next/dynamic'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef } from 'react'
import ArticleDetail from './components/ArticleDetail'
import ArticleLock from './components/ArticleLock'
import AsideLeft from './components/AsideLeft'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import BlogArchiveItem from './components/BlogPostArchive'
import Header from './components/Header'
import TagItemMini from './components/TagItemMini'
import CONFIG from './config'
import { Style } from './style'

const Live2D = dynamic(() => import('@/components/Live2D'), { ssr: false })

// 主题全局状态
const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

/**
 * 基础布局升级：强化了侧边栏与主内容区的比例美感
 */
const LayoutBase = props => {
  const { children, headerSlot } = props
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  const leftAreaSlot = <Live2D />

  return (
    <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
      <div
        id='theme-fukasawa'
        className={`${siteConfig('FONT_STYLE')} min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500 scroll-smooth`}>
        <Style />
        
        {/* 移动端顶部导航 */}
        <Header {...props} />

        <div className={`flex flex-col md:flex-row ${JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE')) ? 'md:flex-row-reverse' : ''}`}>
          
          {/* 左侧侧边栏：增加精致的投影与固定效果 */}
          <AsideLeft {...props} slot={leftAreaSlot} className="relative z-30" />

          {/* 主渲染区：优化了间距与背景色，增加通透感 */}
          <main
            id='wrapper'
            className='relative flex-1 flex w-full py-12 md:py-20 justify-center min-h-screen overflow-hidden'>
            
            <div
              id='container-inner'
              className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full px-5 relative z-10`}>
              
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-out duration-700 transform'
                enterFrom='opacity-0 translate-y-12'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-12'
                unmount={false}>
                
                {/* 顶部插槽装饰 */}
                {headerSlot && <div className="mb-8 animate-fade-in">{headerSlot}</div>}
                
                {/* 内容容器 */}
                <div className="bg-white/40 dark:bg-white/5 backdrop-blur-sm rounded-3xl p-2 md:p-6 transition-all duration-300">
                   {children}
                </div>
              </Transition>

              {/* 广告槽位精致化 */}
              <div className='mt-12 opacity-80 hover:opacity-100 transition-opacity'>
                <AdSlot type='native' />
              </div>
            </div>
          </main>
        </div>

        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
    </ThemeGlobalFukasawa.Provider>
  )
}

/**
 * 首页：继承列表样式
 */
const LayoutIndex = props => <LayoutPostList {...props} />

/**
 * 博客列表：增加了卡片流的呼吸感
 */
const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  return (
    <div className='w-full space-y-8'>
      <div className='w-full overflow-hidden rounded-2xl shadow-sm'>
        <WWAds className='w-full' orientation='horizontal' />
      </div>
      <section className="animate-fade-in-up">
          {POST_LIST_STYLE === 'page' ? (
            <BlogListPage {...props} />
          ) : (
            <BlogListScroll {...props} />
          )}
      </section>
    </div>
  )
}

/**
 * 文章详情：沉浸式阅读优化
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404', 3) * 1000

  useEffect(() => {
    if (!post) {
      const timer = setTimeout(() => {
        if (isBrowser && !document.querySelector('#notion-article')) {
          router.push('/404').then(() => console.warn('Article Not Found'))
        }
      }, waiting404)
      return () => clearTimeout(timer)
    }
  }, [post])

  if (lock) return <ArticleLock validPassword={validPassword} />
  if (!post) return null

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        <ArticleDetail {...props} />
    </div>
  )
}

/**
 * 归档页面：卡片化与视觉分层
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <div className='mb-10 pb-20 bg-white dark:bg-zinc-900 md:p-12 p-6 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none min-h-full transition-all'>
        <div className="mb-12 border-l-4 border-red-500 pl-6">
            <h1 className="text-3xl font-bold dark:text-zinc-100 tracking-tight">归档时光机</h1>
            <p className="text-zinc-400 mt-2 italic text-sm">Archives of thoughts and memories.</p>
        </div>
        {Object.keys(archivePosts).map(archiveTitle => (
          <BlogArchiveItem
            key={archiveTitle}
            posts={archivePosts[archiveTitle]}
            archiveTitle={archiveTitle}
          />
        ))}
    </div>
  )
}

/**
 * 404 页面：增加趣味性与动效
 */
const Layout404 = props => {
  const { locale } = useGlobal()
  return (
    <div className='min-h-[70vh] flex flex-col items-center justify-center text-center px-4'>
        <div className="relative">
            <h1 className='text-[10rem] font-black text-zinc-100 dark:text-zinc-800 leading-none select-none'>404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
                <i className='fas fa-compass text-5xl text-red-500 animate-bounce' />
            </div>
        </div>
        <div className='mt-8 space-y-4'>
            <h2 className='text-2xl font-bold text-zinc-800 dark:text-zinc-200'>{locale.NAV.PAGE_NOT_FOUND_REDIRECT}</h2>
            <SmartLink href="/" className="inline-block px-8 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/30">
                回到森林首页
            </SmartLink>
        </div>
    </div>
  )
}

/**
 * 分类列表：现代化磁贴效果
 */
const LayoutCategoryIndex = props => {
  const { locale } = useGlobal()
  const { categoryOptions } = props
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-zinc-800'>
      <div className='flex items-center text-2xl font-bold mb-10 dark:text-zinc-100'>
        <i className='mr-4 fas fa-th-large text-red-500' />
        {locale.COMMON.CATEGORY}
      </div>
      <div id='category-list' className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {categoryOptions?.map(category => (
            <SmartLink key={category.name} href={`/category/${category.name}`}>
              <div className='group p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800 hover:bg-red-500 dark:hover:bg-red-600 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-red-500/20'>
                <div className="flex flex-col space-y-2">
                    <i className='fas fa-folder text-red-500 group-hover:text-white transition-colors text-xl' />
                    <span className='font-bold text-zinc-700 dark:text-zinc-200 group-hover:text-white transition-colors'>{category.name}</span>
                    <span className='text-xs text-zinc-400 group-hover:text-red-100 transition-colors'>{category.count} Posts</span>
                </div>
              </div>
            </SmartLink>
        ))}
      </div>
    </div>
  )
}

/**
 * 标签列表：流式标签云
 */
const LayoutTagIndex = props => {
  const { locale } = useGlobal()
  const { tagOptions } = props
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-3xl p-8 md:p-12 shadow-sm border border-zinc-100 dark:border-zinc-800'>
      <div className='flex items-center text-2xl font-bold mb-10 dark:text-zinc-100'>
        <i className='mr-4 fas fa-tags text-red-500' />
        {locale.COMMON.TAGS}
      </div>
      <div id='tags-list' className='flex flex-wrap gap-4'>
        {tagOptions.map(tag => (
          <div key={tag.name} className='transform hover:-translate-y-1 transition-transform'>
            <TagItemMini tag={tag} />
          </div>
        ))}
      </div>
    </div>
  )
}

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
