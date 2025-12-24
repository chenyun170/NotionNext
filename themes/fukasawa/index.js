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
import FloatButton from './components/FloatButton'

const Live2D = dynamic(() => import('@/components/Live2D'), { ssr: false })

const ThemeGlobalFukasawa = createContext()
export const useFukasawaGlobal = () => useContext(ThemeGlobalFukasawa)

/**
 * 基础布局 - 已修复 FloatButton 显示问题
 */
const LayoutBase = props => {
  const { children, headerSlot, floatSlot } = props
  const leftAreaSlot = <Live2D />
  const { onLoading, fullWidth } = useGlobal()
  const searchModal = useRef(null)
  
  return (
    <ThemeGlobalFukasawa.Provider value={{ searchModal }}>
      <div id='theme-fukasawa' className={`${siteConfig('FONT_STYLE')} dark:bg-black scroll-smooth antialiased`}>
        <Style />
        <Header {...props} />

        <div className={(JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE')) ? 'flex-row-reverse' : '') + ' flex'}>
          {/* 左侧侧边栏 */}
          <AsideLeft {...props} slot={leftAreaSlot} />

          <main id='wrapper' className='relative flex-1 flex w-full py-8 justify-center bg-[#f8f8f8] dark:bg-hexonight'>
            <div id='container-inner' className={`${fullWidth ? '' : '2xl:max-w-6xl md:max-w-4xl'} w-full relative z-10 px-4`}>
              <Transition
                show={!onLoading}
                appear={true}
                className='w-full'
                enter='transition ease-out duration-500 transform'
                enterFrom='opacity-0 translate-y-8'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-300 opacity-0'
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

        {/* 重要：恢复右下角悬浮按钮（回到顶部、领资料包） */}
        <FloatButton floatSlot={floatSlot} {...props} />

        <AlgoliaSearchModal cRef={searchModal} {...props} />
      </div>
    </ThemeGlobalFukasawa.Provider>
  )
}

const LayoutIndex = props => <LayoutPostList {...props} />
const LayoutPostList = props => {
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE')
  return (
    <div className='w-full'>
      <div className='w-full p-2 mb-4'><WWAds className='w-full' orientation='horizontal' /></div>
      { POST_LIST_STYLE === 'page' ? <BlogListPage {...props} /> : <BlogListScroll {...props} /> }
    </div>
  )
}

const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  useEffect(() => {
    if (!post) {
      const timer = setTimeout(() => {
        if (isBrowser && !document.querySelector('#notion-article')) router.push('/404')
      }, siteConfig('POST_WAITING_TIME_FOR_404', 3) * 1000)
      return () => clearTimeout(timer)
    }
  }, [post])
  return lock ? <ArticleLock validPassword={validPassword} /> : (post && <ArticleDetail {...props} />)
}

const LayoutSearch = props => {
  const { keyword } = props
  useEffect(() => {
    if (isBrowser && keyword) {
      replaceSearchResult({
        doms: document.getElementById('posts-wrapper'),
        search: keyword,
        target: { element: 'span', className: 'text-red-500 border-b border-dashed' }
      })
    }
  }, [keyword])
  return <LayoutPostList {...props} />
}

const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <div className='mb-10 pb-20 bg-white md:p-12 p-3 dark:bg-gray-900 shadow-sm rounded-xl min-h-full'>
      {Object.keys(archivePosts).map(title => <BlogArchiveItem key={title} posts={archivePosts[title]} archiveTitle={title} />)}
    </div>
  )
}

const Layout404 = props => {
  const router = useRouter()
  return (
    <div className='w-full h-[60vh] flex flex-col items-center justify-center'>
        <div className='text-8xl font-bold text-gray-200 dark:text-gray-800 animate-pulse'>404</div>
        <button onClick={() => router.push('/')} className='mt-8 px-8 py-2 bg-black text-white dark:bg-white dark:text-black rounded-full hover:scale-105 transition-all shadow-lg'>Back Home</button>
    </div>
  )
}

const LayoutCategoryIndex = props => {
  const { locale, categoryOptions } = props
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
      <div className='dark:text-gray-200 mb-8 font-bold'><i className='mr-4 fas fa-th' />{locale?.COMMON?.CATEGORY}:</div>
      <div className='flex flex-wrap gap-4'>
        {categoryOptions?.map(c => (
          <SmartLink key={c.name} href={`/category/${c.name}`}>
            <div className='hover:bg-gray-50 dark:hover:bg-gray-800 px-5 py-2 rounded-lg border dark:border-gray-800 transition-colors cursor-pointer'>
              <i className='mr-3 fas fa-folder text-gray-400' />{c.name} ({c.count})
            </div>
          </SmartLink>
        ))}
      </div>
    </div>
  )
}

const LayoutTagIndex = props => {
  const { locale, tagOptions } = props
  return (
    <div className='bg-white dark:bg-gray-900 px-10 py-10 rounded-xl shadow-sm'>
      <div className='dark:text-gray-200 mb-8 font-bold'><i className='mr-4 fas fa-tag' />{locale?.COMMON?.TAGS}:</div>
      <div className='flex flex-wrap gap-3'>{tagOptions?.map(t => <TagItemMini key={t.name} tag={t} />)}</div>
    </div>
  )
}

export { Layout404, LayoutArchive, LayoutBase, LayoutCategoryIndex, LayoutIndex, LayoutPostList, LayoutSearch, LayoutSlug, LayoutTagIndex, CONFIG as THEME_CONFIG }
