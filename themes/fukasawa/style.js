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

const Live2D = dynamic(() => import('@/components/Live2D'))

// 主题全局状态
const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

/**
 * 基础布局 
 */
const LayoutBase = props => {
  const { children, headerSlot } = props
  const leftAreaSlot = <Live2D />
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  
  return (
    <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
      <div
        id='theme-fukasawa'
        className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth antialiased`}>
        <Style />
        <Header {...props} />

        <div className={(JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE')) ? 'flex-row-reverse' : '') + ' flex'}>
          <AsideLeft {...props} slot={leftAreaSlot} />

          <main id='wrapper' className='relative flex w-full py-8 justify-center bg-[#f8f8f8] dark:bg-hexonight'>
            <div id='container-inner' className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10 px-4`}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-out duration-500 transform'
                enterFrom='opacity-0 translate-y-8'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-300 transform'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
                unmount={false}>
                <div> {headerSlot} </div>
                <div className='min-h-[60vh]'> {children} </div>
              </Transition>

              <div className='mt-8 rounded-xl overflow-hidden'>
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

const LayoutIndex = props => <LayoutPostList {...props} />

/**
 * 博客列表 - 增加渐入感
 */
const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  return (
    <div className='w-full'>
      <div className='w-full p-2 mb-4'>
        <WWAds className='w-full' orientation='horizontal' />
      </div>
      { POST_LIST_STYLE === 'page' ? <BlogListPage {...props} /> : <BlogListScroll {...props} /> }
    </div>
  )
}

/**
 * 文章详情
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  
  useEffect(() => {
    if (!post) {
      const timer = setTimeout(() => {
        if (isBrowser) {
          const article = document.querySelector('#article-wrapper #notion-article')
          if (!article) router.push('/404')
        }
      }, waiting404)
      return () => clearTimeout(timer)
    }
  }, [post])

  return (
    <>
      {lock ? <ArticleLock validPassword={validPassword} /> : post && <ArticleDetail {...props} />}
    </>
  )
}

/**
 * 搜索页
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  useEffect(() => {
    if (isBrowser && keyword) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: { element: 'span', className: 'text-red-500 border-b border-dashed' }
      })
    }
  }, [router, keyword])
  return <LayoutPostList {...props} />
}

/**
 * 归档页面
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-900 shadow-sm rounded-xl min-h-full'>
      {Object.keys(archivePosts).map(archiveTitle => (
        <BlogArchiveItem key={archiveTitle} posts={archivePosts[archiveTitle]} archiveTitle={archiveTitle} />
      ))}
    </div>
  )
}

/**
 * 404 视觉升级版
 */
const Layout404 = props => {
  const router = useRouter()
  const { locale } = useGlobal()
  
  return (
    <div className='w-full h-[60vh] flex flex-col items-center justify-center text-center'>
        <div className='text-8xl font-bold text-gray-200 dark:text-gray-800 animate-pulse'>404</div>
        <h2 className='text-xl mt-4 dark:text-gray-400'>{locale.NAV.PAGE_NOT_FOUND_REDIRECT}</h2>
        <button 
            onClick={() => router.push('/')}
            className='mt-8 px-8 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-transform shadow-lg'
        >
            Back Home
        </button>
    </div>
  )
}

const LayoutCategoryIndex = props => {
  const { locale } = useGlobal()
  const { categoryOptions } = props
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 shadow-sm rounded-xl'>
      <div className='dark:text-gray-200 mb-8 font-bold'>
        <i className='mr-4 fas fa-th' />{locale.COMMON.CATEGORY}:
      </div>
      <div id='category-list' className='flex flex-wrap gap-4'>
        {categoryOptions?.map(category => (
          <SmartLink key={category.name} href={`/category/${category.name}`}>
            <div className='hover:bg-gray-100 dark:hover:bg-gray-800 px-5 py-2 rounded-lg transition-colors cursor-pointer border dark:border-gray-800'>
              <i className='mr-3 fas fa-folder text-gray-400' />{category.name} ({category.count})
            </div>
          </SmartLink>
        ))}
      </div>
    </div>
  )
}

const LayoutTagIndex = props => {
  const { locale } = useGlobal()
  const { tagOptions } = props
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 shadow-sm rounded-xl'>
      <div className='dark:text-gray-200 mb-8 font-bold'>
        <i className='mr-4 fas fa-tag' />{locale.COMMON.TAGS}:
      </div>
      <div id='tags-list' className='flex flex-wrap gap-3'>
        {tagOptions.map(tag => <TagItemMini key={tag.name} tag={tag} />)}
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
