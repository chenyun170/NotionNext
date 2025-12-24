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
import FloatButton from './components/FloatButton'
import CONFIG from './config'
import { Style } from './style'

const Live2D = dynamic(() => import('@/components/Live2D'))

const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

const LayoutBase = props => {
  const { children, headerSlot } = props
  const leftAreaSlot = <Live2D />
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)

  // --- 新增：阅读进度条逻辑 ---
  useEffect(() => {
    const handleScroll = () => {
      const progressBar = document.getElementById('scroll-progress')
      if (progressBar) {
        const scrollHeight = document.documentElement.scrollHeight
        const clientHeight = document.documentElement.clientHeight
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const percent = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100)
        progressBar.style.width = `${percent}%`
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
      <div id='theme-fukasawa' className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth`}>
        <Style />
        
        {/* --- 新增：阅读进度条组件 (置顶并高于Header) --- */}
        <div className='fixed top-0 left-0 w-full h-1 z-[110] pointer-events-none'>
            <div id='scroll-progress' className='h-full bg-orange-600 transition-all duration-150 shadow-[0_0_10px_rgba(234,88,12,0.5)]' style={{ width: '0%' }}></div>
        </div>

        <Header {...props} />
        <div className={(JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE')) ? 'flex-row-reverse' : '') + ' flex'}>
          <AsideLeft {...props} slot={leftAreaSlot} />
          <main id='wrapper' className='relative flex w-full py-8 justify-center bg-day dark:bg-night'>
            <div id='container-inner' className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10`}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-in-out duration-700 transform order-first'
                enterFrom='opacity-0 translate-y-16'
                enterTo='opacity-100'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-16'
                unmount={false}>
                <div> {headerSlot} </div>
                <div> {children} </div>
              </Transition>
              <div className='mt-2'><AdSlot type='native' /></div>
            </div>
          </main>
        </div>
        <AlgoliaSearchModal cRef={searchModal} {...props} />
        <FloatButton />
      </div>
    </ThemeGlobalFukasawa.Provider>
  )
}

const LayoutIndex = props => { return <LayoutPostList {...props} /> }

const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  return (
    <>
      <div className='w-full p-2'><WWAds className='w-full' orientation='horizontal' /></div>
      {POST_LIST_STYLE === 'page' ? <BlogListPage {...props} /> : <BlogListScroll {...props} />}
    </>
  )
}

const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    if (!post) {
      setTimeout(() => {
        if (isBrowser) {
          const article = document.querySelector('#article-wrapper #notion-article')
          if (!article) { router.push('/404') }
        }
      }, waiting404)
    }
  }, [post])
  return (<>{lock ? <ArticleLock validPassword={validPassword} /> : post && <ArticleDetail {...props} />}</>)
}

const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  useEffect(() => {
    if (isBrowser) {
      replaceSearchResult({ doms: document.getElementById('posts-wrapper'), search: keyword, target: { element: 'span', className: 'text-red-500 border-b border-dashed' } })
    }
  }, [router])
  return <LayoutPostList {...props} />
}

const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-800 shadow-md min-h-full'>
      {Object.keys(archivePosts).map(archiveTitle => (
        <BlogArchiveItem key={archiveTitle} posts={archivePosts[archiveTitle]} archiveTitle={archiveTitle} />
      ))}
    </div>
  )
}

const Layout404 = props => {
  const router = useRouter()
  const { locale } = useGlobal()
  useEffect(() => {
    setTimeout(() => {
      const article = isBrowser && document.getElementById('article-wrapper')
      if (!article) { router.push('/') }
    }, 3000)
  }, [])
  return (
    <div className='md:-mt-20 text-black w-full h-screen text-center justify-center content-center items-center flex flex-col'>
      <div className='dark:text-gray-200'>
        <h2 className='inline-block border-r-2 border-gray-600 mr-2 px-3 py-2 align-top'><i className='mr-2 fas fa-spinner animate-spin' />404</h2>
        <div className='inline-block text-left h-32 leading-10 items-center'><h2 className='m-0 p-0'>{locale.NAV.PAGE_NOT_FOUND_REDIRECT}</h2></div>
      </div>
    </div>
  )
}

const LayoutCategoryIndex = props => {
  const { locale } = useGlobal()
  const { categoryOptions } = props
  return (
    <div className='bg-white dark:bg-gray-700 px-10 py-10 shadow'>
      <div className='dark:text-gray-200 mb-5'><i className='mr-4 fas fa-th' />{locale.COMMON.CATEGORY}:</div>
      <div id='category-list' className='duration-200 flex flex-wrap'>
        {categoryOptions?.map(category => (
          <SmartLink key={category.name} href={`/category/${category.name}`} passHref legacyBehavior>
            <div className='hover:text-black dark:hover:text-white dark:text-gray-300 dark:hover:bg-gray-600 px-5 cursor-pointer py-2 hover:bg-gray-100'>
              <i className='mr-4 fas fa-folder' />{category.name}({category.count})
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
    <div className='bg-white dark:bg-gray-700 px-10 py-10 shadow'>
      <div className='dark:text-gray-200 mb-5'><i className='mr-4 fas fa-tag' />{locale.COMMON.TAGS}:</div>
      <div id='tags-list' className='duration-200 flex flex-wrap ml-8'>
        {tagOptions.map(tag => (
          <div key={tag.name} className='p-2'><TagItemMini key={tag.name} tag={tag} /></div>
        ))}
      </div>
    </div>
  )
}

export { Layout404, LayoutArchive, LayoutBase, LayoutCategoryIndex, LayoutIndex, LayoutPostList, LayoutSearch, LayoutSlug, LayoutTagIndex, CONFIG as THEME_CONFIG }
