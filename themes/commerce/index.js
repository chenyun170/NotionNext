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
import { ArticleLock } from './components/ArticleLock'
import BlogPostArchive from './components/BlogPostArchive'
import BlogPostListPage from './components/BlogPostListPage'
import BlogPostListScroll from './components/BlogPostListScroll'
import Card from './components/Card'
import Footer from './components/Footer'
import Header from './components/Header'
import Hero from './components/Hero'
import PostHeader from './components/PostHeader'
import ProductCategories from './components/ProductCategories'
import ProductCenter from './components/ProductCenter'
import RightFloatArea from './components/RightFloatArea'
import SearchNav from './components/SearchNav'
import SlotBar from './components/SlotBar'
import TagItemMini from './components/TagItemMini'
import TocDrawer from './components/TocDrawer'
import { Style } from './style'

/**
 * 基础布局：增加玻璃拟态与平滑过渡
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
      
      {/* 顶部插槽：如 Hero 或 PostHeader */}
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
              <div className="rounded-2xl shadow-sm">
                {children}
              </div>
            </Transition>
          </div>

          {/* 右侧边栏 */}
          {slotRight && (
            <aside className="hidden lg:block w-72 flex-shrink-0">
               {slotRight}
            </aside>
          )}
        </div>
      </main>

      <RightFloatArea floatSlot={floatSlot} />
      <Footer {...props} />
    </div>
  )
}

/**
 * 首页：增加品牌介绍的视觉设计
 */
const LayoutIndex = props => {
  const { notice } = props
  return (
    <div className="space-y-12">
      <ProductCenter {...props} />
      
      {notice && (
        <div id='brand-introduction' className='w-full px-6 py-16 bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-800 transition-all hover:shadow-2xl'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center text-4xl md:text-5xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-orange-500'>
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
 * 列表页：增加边框渐变效果
 */
const LayoutPostList = props => {
  return (
    <div className='bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border-t-4 border-[#D2232A] p-6 transition-all'>
      <SlotBar {...props} />
      <div className="mt-6">
        {siteConfig('POST_LIST_STYLE') === 'page' ? (
          <BlogPostListPage {...props} />
        ) : (
          <BlogPostListScroll {...props} />
        )}
      </div>
    </div>
  )
}

/**
 * 搜索页：优化结果高亮样式
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
        target: {
          element: 'span',
          className: 'text-red-600 font-bold bg-red-50 dark:bg-red-900/20 px-1 rounded'
        }
      })
    }
  }, [currentSearch, keyword])

  return (
    <div className="min-h-screen">
      {!currentSearch ? (
        <SearchNav {...props} />
      ) : (
        <div id='posts-wrapper' className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-md">
          {siteConfig('POST_LIST_STYLE') === 'page' ? (
            <BlogPostListPage {...props} />
          ) : (
            <BlogPostListScroll {...props} />
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 归档：卡片式布局优化
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <Card className='w-full border-none shadow-xl rounded-2xl overflow-hidden'>
      <div className='bg-white dark:bg-zinc-900 md:p-12 p-6 min-h-screen'>
        <div className="border-l-2 border-red-500 pl-6 mb-10">
          <h1 className="text-3xl font-bold">文章归档</h1>
        </div>
        {Object.keys(archivePosts).map(archiveTitle => (
          <BlogPostArchive
            key={archiveTitle}
            posts={archivePosts[archiveTitle]}
            archiveTitle={archiveTitle}
          />
        ))}
      </div>
    </Card>
  )
}

/**
 * 文章详情：沉浸式设计与排版美化
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const drawerRight = useRef(null)
  const targetRef = isBrowser ? document.getElementById('article-wrapper') : null
  const headerImage = post?.pageCover || siteConfig('HOME_BANNER_IMAGE')

  return (
    <>
      <div className='w-full max-w-5xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-zinc-800 article'>
        {lock && <ArticleLock validPassword={validPassword} />}

        {!lock && post && (
          <div id='article-wrapper' className='flex-grow transition-all'>
            {/* 改进的头部封面区 */}
            {post?.type === 'Post' && (
              <div className='flex flex-col md:flex-row w-full bg-gradient-to-br from-gray-50 to-white dark:from-zinc-800 dark:to-zinc-900'>
                <div className='md:w-5/12 overflow-hidden group relative'>
                  <LazyImage
                    src={headerImage}
                    className='w-full h-full aspect-video md:aspect-square object-cover transform transition-transform duration-700 group-hover:scale-110'
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>

                <div className='md:w-7/12 p-8 md:p-12 flex flex-col justify-center'>
                  <div className="text-red-600 font-bold text-sm mb-4 tracking-widest uppercase">Article Detail</div>
                  <h1 className='text-3xl md:text-4xl font-extrabold mb-6 text-gray-800 dark:text-white leading-tight'>
                    {post?.title}
                  </h1>
                  {post?.summary && (
                    <div 
                      className='text-gray-500 dark:text-gray-400 leading-relaxed italic border-l-4 border-red-500 pl-4'
                      dangerouslySetInnerHTML={{ __html: post?.summary }} 
                    />
                  )}
                </div>
              </div>
            )}

            <div className='h-[2px] w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20' />

            <article className='subpixel-antialiased overflow-y-hidden'>
              <section className='px-6 py-10 md:px-12 mx-auto prose prose-red dark:prose-invert max-w-none'>
                {post && <NotionPage post={post} />}
              </section>
            </article>
          </div>
        )}
      </div>

      <div className='block lg:hidden'>
        <TocDrawer post={post} cRef={drawerRight} targetRef={targetRef} />
      </div>
    </>
  )
}

/**
 * 404：简约现代感
 */
const Layout404 = props => {
  const router = useRouter()
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isBrowser) {
        const article = document.querySelector('#article-wrapper #notion-article')
        if (!article) router.push('/')
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className='w-full h-[70vh] flex flex-col items-center justify-center space-y-4'>
       <h1 className='text-9xl font-black text-gray-200 dark:text-zinc-800 animate-pulse'>404</h1>
       <div className='text-2xl font-bold text-gray-800 dark:text-gray-200'>页面消失在迷雾中</div>
       <SmartLink href="/" className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors">
         返回首页
       </SmartLink>
    </div>
  )
}

/**
 * 分类列表：增加磁贴感
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions } = props
  const { locale } = useGlobal()
  return (
    <Card className='w-full min-h-screen p-8 rounded-2xl shadow-xl border-none'>
      <div className='dark:text-gray-200 mb-8 flex items-center text-2xl font-bold'>
        <i className='mr-4 fas fa-th text-red-500' /> {locale.COMMON.CATEGORY}
      </div>
      <div id='category-list' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {categoryOptions?.map(category => (
          <SmartLink key={category.name} href={`/category/${category.name}`}>
            <div className='group p-6 rounded-xl bg-gray-50 dark:bg-zinc-800 hover:bg-red-600 dark:hover:bg-red-600 hover:shadow-lg transition-all duration-300 cursor-pointer'>
              <div className='flex justify-between items-center group-hover:text-white transition-colors'>
                <span className="font-medium"><i className='mr-3 fas fa-folder opacity-50' /> {category.name}</span>
                <span className='text-xs bg-gray-200 dark:bg-zinc-700 group-hover:bg-red-500 px-2 py-1 rounded-full'>{category.count}</span>
              </div>
            </div>
          </SmartLink>
        ))}
      </div>
    </Card>
  )
}

/**
 * 标签列表：流式布局优化
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  const { locale } = useGlobal()
  return (
    <Card className='w-full p-8 rounded-2xl shadow-xl border-none'>
      <div className='dark:text-gray-200 mb-8 flex items-center text-2xl font-bold'>
        <i className='mr-4 fas fa-tag text-red-500' /> {locale.COMMON.TAGS}
      </div>
      <div id='tags-list' className='flex flex-wrap gap-3'>
        {tagOptions.map(tag => (
          <div key={tag.name} className='transform hover:scale-105 transition-transform'>
            <TagItemMini tag={tag} />
          </div>
        ))}
      </div>
    </Card>
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
