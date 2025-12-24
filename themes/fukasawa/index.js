import CONFIG from './config'
import LazyImage from '@/components/LazyImage'
import replaceSearchResult from '@/components/Mark'
import NotionPage from '@/components/NotionPage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser, scanAndConvertToLinks } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

// 根据你的 components 目录图片修正导入
import { ArticleLock } from './components/ArticleLock'
import BlogPostArchive from './components/BlogPostArchive'
import BlogListPage from './components/BlogListPage'
import BlogListScroll from './components/BlogListScroll'
import Card from './components/Card'
import Footer from './components/Footer' // 如果目录中有此文件
import Header from './components/Header'
import Hero from './components/HeroSection' // 图片中为 HeroSection.js
import PostHeader from './components/ArticleDetail' // 图片中 ArticleDetail 对应详情头部
import ProductCategories from './components/GroupCategory' // 图片中为 GroupCategory.js
import ProductCenter from './components/BlogCard' // 将 BlogCard 作为产品展示核心
import RightFloatArea from './components/FloatButton' // 图片中为 FloatButton.js
import SearchNav from './components/AsideLeft' // 将 AsideLeft 用于搜索导航
import TagItemMini from './components/GroupTag' // 图片中为 GroupTag.js
import TocDrawer from './components/Catalog' // 图片中为 Catalog.js
import { Style } from './style'

/**
 * 基础布局
 */
const LayoutBase = props => {
  const { children, post, floatSlot, slotTop, className } = props
  const { onLoading } = useGlobal()
  const router = useRouter()

  useEffect(() => {
    scanAndConvertToLinks(document.getElementById('theme-commerce'))
  }, [router])

  const slotRight = router.route !== '/' && !post && (
    <div className="sticky top-24">
      <ProductCategories {...props} />
    </div>
  )

  let headerSlot = null
  if (router.route === '/' && !post) {
    headerSlot = JSON.parse(siteConfig('COMMERCE_HOME_BANNER_ENABLE', true)) ? (
      <Hero {...props} />
    ) : null
  } else if (post) {
    headerSlot = <PostHeader {...props} />
  }

  return (
    <div id='theme-commerce' className='flex flex-col min-h-screen justify-between bg-slate-50 dark:bg-zinc-950 transition-colors duration-500'>
      <Style />
      <Header {...props} />
      <div className="relative z-20">{headerSlot}</div>

      <main id='wrapper' className={`${CONFIG.HOME_BANNER_ENABLE ? '' : 'pt-20'} w-full py-12 md:px-8 lg:px-24 relative`}>
        <div id='container-inner' className={`${siteConfig('LAYOUT_SIDEBAR_REVERSE') ? 'flex-row-reverse' : ''} w-full mx-auto lg:flex lg:space-x-8 justify-center relative z-10`}>
          
          <div className={`${className || ''} w-full h-full max-w-5xl overflow-hidden`}>
            <Transition
              show={!onLoading}
              appear={true}
              enter='transition ease-out duration-700 transform'
              enterFrom='opacity-0 translate-y-12'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-300 transform'
              leaveFrom='opacity-100'
              leaveTo='opacity-0 -translate-y-12'
              unmount={false}>
              {slotTop}
              <div className="rounded-2xl shadow-sm">{children}</div>
            </Transition>
          </div>

          {slotRight && <aside className="hidden lg:block w-72 flex-shrink-0">{slotRight}</aside>}
        </div>
      </main>

      <RightFloatArea floatSlot={floatSlot} />
      <Footer {...props} />
    </div>
  )
}

/**
 * 首页
 */
const LayoutIndex = props => {
  const { notice } = props
  return (
    <div className="space-y-12">
      <ProductCenter {...props} />
      {notice && (
        <div id='brand-introduction' className='w-full px-6 py-16 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800'>
          <div className='max-w-4xl mx-auto text-center'>
            <div className='text-4xl md:text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500'>
              {notice.title}
            </div>
            <NotionPage post={notice} className='text-xl leading-relaxed text-gray-600 dark:text-gray-300' />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * 列表页
 */
const LayoutPostList = props => {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-t-4 border-[#D2232A] p-6'>
      {siteConfig('POST_LIST_STYLE') === 'page' ? (
        <BlogListPage {...props} />
      ) : (
        <BlogListScroll {...props} />
      )}
    </div>
  )
}

/**
 * 搜索页
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  const currentSearch = keyword || router?.query?.s

  useEffect(() => {
    if (currentSearch) {
      replaceSearchResult({
        doms: document.getElementsByClassName('replace'),
        search: keyword,
        target: { element: 'span', className: 'text-red-600 font-bold bg-red-50 px-1 rounded' }
      })
    }
  }, [currentSearch, keyword])

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 p-6 rounded-2xl">
      {!currentSearch ? <SearchNav {...props} /> : (
        siteConfig('POST_LIST_STYLE') === 'page' ? <BlogListPage {...props} /> : <BlogListScroll {...props} />
      )}
    </div>
  )
}

/**
 * 文章详情
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const drawerRight = useRef(null)
  const targetRef = isBrowser ? document.getElementById('article-wrapper') : null
  const headerImage = post?.pageCover || siteConfig('HOME_BANNER_IMAGE')

  return (
    <>
      <div className='w-full max-w-5xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800'>
        {lock && <ArticleLock validPassword={validPassword} />}
        {!lock && post && (
          <div id='article-wrapper' className='flex-grow'>
            {post?.type === 'Post' && (
              <div className='flex flex-col md:flex-row w-full bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900'>
                <div className='md:w-5/12 overflow-hidden relative'>
                  <LazyImage src={headerImage} className='w-full h-full aspect-square object-cover' />
                </div>
                <div className='md:w-7/12 p-8 md:p-12 flex flex-col justify-center'>
                  <h1 className='text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white leading-tight'>{post?.title}</h1>
                  <div className='text-gray-500 italic border-l-4 border-red-500 pl-4' dangerouslySetInnerHTML={{ __html: post?.summary }} />
                </div>
              </div>
            )}
            <article className='p-6 md:p-12 prose prose-red dark:prose-invert max-w-none'>
              <NotionPage post={post} />
            </article>
          </div>
        )}
      </div>
      <div className='block lg:hidden'><TocDrawer post={post} cRef={drawerRight} targetRef={targetRef} /></div>
    </>
  )
}

export {
  LayoutBase,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutArchive: LayoutArchive, // 保持原样
  Layout404: Layout404, // 保持原样
  CONFIG as THEME_CONFIG
}
