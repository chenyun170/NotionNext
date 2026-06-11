import dynamic from 'next/dynamic'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import WWAds from '@/components/WWAds'
import BLOG from '@/blog.config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import ArticleInsightPanel from './ArticleInsightPanel'
import ArticleQuickNav from './ArticleQuickNav'
import ArticleReadingProgress from './ArticleReadingProgress'
import TagItemMini from './TagItemMini'
import { isBrowser } from '@/lib/utils' // 确保引入 isBrowser 用于复制功能

const Comment = dynamic(() => import('@/components/Comment'), {
  ssr: false,
  loading: () => (
    <div className='rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-400 dark:border-zinc-800'>
      Comment area loading...
    </div>
  )
})

const AdSlot = dynamic(
  () => import('@/components/GoogleAdsense').then(module => module.AdSlot),
  {
    ssr: false,
    loading: () => null
  }
)

const ArticleFAQ = dynamic(() => import('./ArticleFAQ'), {
  ssr: false,
  loading: () => null
})

const ArticleRelatedPosts = dynamic(() => import('./ArticleRelatedPosts'), {
  ssr: false,
  loading: () => null
})

const ArticleAround = dynamic(() => import('./ArticleAround'), {
  ssr: false,
  loading: () => null
})

const ShareBar = dynamic(() => import('@/components/ShareBar'), {
  ssr: false,
  loading: () => null
})

/**
 * Fukasawa 文章详情页 - 顶尖情报局名片网格版
 * @param {*} props
 * @returns
 */
export default function ArticleDetail(props) {
  const { post, prev, next, recommendPosts = [] } = props
  const global = useGlobal()
  const { locale, fullWidth } = global
  const showTitleIcon = parseConfigBoolean(
    getConfigValue(global, props?.NOTION_CONFIG, 'POST_TITLE_ICON', true)
  )

  if (!post) {
    return <></>
  }
  return (
    <div
      id='container'
      className={`${fullWidth ? 'px-10' : 'max-w-5xl '} overflow-x-auto flex-grow mx-auto w-screen md:w-full`}>
      <ArticleReadingProgress />
{/* 修改后的文章封面部分 */}
{post?.type && post?.type !== 'Page' && post?.pageCover && (
  <div className='w-full relative aspect-[16/9] md:aspect-[21/9] max-h-[60vh] bg-zinc-100 dark:bg-zinc-900 md:flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl transition-all duration-500 hover:scale-[1.01] hover:shadow-orange-500/20'>
    <LazyImage
      alt={post.title}
      src={post?.pageCover}
      width={1200}
      height={675}
      className='absolute inset-0 h-full w-full object-cover'
    />
    {/* 增加一个内部光泽效果，提升立体感 */}
    <div className='absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl'></div>
  </div>
)}

      <article
        itemScope
        itemType='https://schema.org/BlogPosting'
        className='subpixel-antialiased overflow-y-hidden py-10 px-5 lg:pt-24 md:px-32  dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <meta itemProp='datePublished' content={post?.publishDate} />
        <meta itemProp='dateModified' content={post?.lastEditedDate || post?.publishDate} />
        <header>
          {/* 文章Title */}
          <h1 itemProp='headline' className='font-bold text-4xl text-black dark:text-white'>
            {showTitleIcon && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {post.title}
          </h1>

          <section className='flex-wrap flex mt-2 text-gray-400 dark:text-gray-400 font-light leading-8'>
            <div>
              {post?.category && (
                <>
                  <SmartLink
                    href={`/category/${post.category}`}
                    passHref
                    className='cursor-pointer text-md mr-2 hover:text-black dark:hover:text-white border-b dark:border-gray-500 border-dashed'>
                    <i className='mr-1 fas fa-folder-open' />
                    {post.category}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                </>
              )}

              {post?.type !== 'Page' && (
                <>
                  <SmartLink
                    href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                    passHref
                    className='pl-1 mr-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 border-b dark:border-gray-500 border-dashed'>
                    {post?.publishDay}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                  <span className='mx-2 text-gray-400 dark:text-gray-500'>
                    {locale.COMMON.LAST_EDITED_TIME}: {post.lastEditedDay}
                  </span>
                </>
              )}

              <div className='my-2'>
                {post.tagItems && (
                  <div className='flex flex-nowrap overflow-x-auto'>
                    {post.tagItems.map(tag => (
                      <TagItemMini key={tag.name} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <WWAds className='w-full' orientation='horizontal' />
        </header>

        <ArticleInsightPanel post={post} />
        <ArticleQuickNav post={post} />

        {/* Notion文章主体 */}
        <section id='article-wrapper' itemProp='articleBody'>
          {post && <NotionPage post={post} />}
        </section>

        <ArticleFAQ post={post} />
        <ArticleRelatedPosts posts={recommendPosts} />

        {/* --- 名片化网格版权声明 --- */}
        <div className="mt-14 group print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-8 transition-all hover:shadow-xl hover:border-orange-500/30">
            
            <div className="absolute -top-6 -right-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity pointer-events-none">
              <i className="fas fa-shield-alt text-9xl rotate-12 text-slate-900 dark:text-white"></i>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="flex space-x-1">
                  <div className="h-4 w-1 bg-orange-600 rounded-full animate-pulse"></div>
                  <div className="h-4 w-1 bg-orange-600/40 rounded-full"></div>
                </div>
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-800 dark:text-gray-200 uppercase">
                  Intel Report Copyright / 版权声明
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Source / 情报源</span>
                  <span className="text-sm font-bold dark:text-gray-300 flex items-center">
                    外贸获客情报局 <i className="fas fa-check-circle ml-2 text-blue-500 text-[10px]" title="官方认证"></i>
                  </span>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Share / 情报传递</span>
                  <button 
                    onClick={() => {
                      if(isBrowser) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('情报链接已加密存入剪贴板，快去转发吧！');
                      }
                    }}
                    className="text-sm text-left font-mono text-orange-600 hover:text-orange-500 transition-colors flex items-center group/link"
                  >
                    <span className="truncate">点击复制本文永久链接</span>
                    <i className="fas fa-copy ml-2 text-[10px] opacity-0 group-hover/link:opacity-100 transition-opacity"></i>
                  </button>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">License / 许可协议</span>
                  <span className="text-sm dark:text-gray-300">
                    CC BY-NC-SA 4.0 <span className="text-[10px] text-gray-500 ml-1">(署名-非商-相同方式)</span>
                  </span>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Index / 情报索引</span>
                  <span className="text-sm font-mono dark:text-gray-400 tabular-nums uppercase">
                    #TC-{new Date().getFullYear()}-{post?.id?.slice(0, 6)}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                  <i className="fas fa-info-circle mr-2 opacity-60"></i>
                  局长寄语：本站情报旨在助力外贸人精准获客。严禁恶意洗稿或未经授权的商业挪用。
                </p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <AdSlot type='in-article' />
          {/* 分享 */}
          <ShareBar post={post} />
        </section>
      </article>

      {post?.type === 'Post' && <ArticleAround prev={prev} next={next} />}

      {/* 评论互动 */}
      <div className='duration-200 shadow py-6 px-12 w-screen md:w-full overflow-x-auto dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <Comment frontMatter={post} />
      </div>

      <style jsx global>{`
        #article-wrapper #notion-article {
          color: rgb(39 39 42);
          font-size: 16px;
          line-height: 1.9;
          overflow-wrap: anywhere;
        }

        .dark #article-wrapper #notion-article,
        .dark-mode #article-wrapper #notion-article {
          color: rgb(212 212 216);
        }

        #article-wrapper .notion-text {
          margin: 0.72rem 0;
          line-height: 1.95;
        }

        #article-wrapper .notion-h {
          scroll-margin-top: 96px;
          letter-spacing: 0;
        }

        #article-wrapper .notion-quote {
          margin: 1.25rem 0;
          border-left-width: 4px;
          border-left-color: rgb(37 99 235);
          border-radius: 0 0.75rem 0.75rem 0;
          background: rgba(37, 99, 235, 0.06);
          padding: 0.85rem 1rem;
        }

        #article-wrapper .notion-table {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          border-radius: 0.75rem;
        }

        #article-wrapper .notion-link {
          word-break: break-word;
          text-decoration-thickness: 1px;
          text-underline-offset: 3px;
        }

        #article-wrapper .notion-code {
          border-radius: 0.75rem;
          font-size: 0.92rem;
        }

        @media (max-width: 640px) {
          #article-wrapper #notion-article {
            font-size: 15.5px;
            line-height: 1.86;
          }

          #article-wrapper .notion-text {
            margin: 0.68rem 0;
          }
        }
      `}</style>
    </div>
  )
}

const getConfigValue = (global, notionConfig, key, defaultValue) => {
  return (
    notionConfig?.[key] ??
    global?.NOTION_CONFIG?.[key] ??
    global?.THEME_CONFIG?.[key] ??
    BLOG?.[key] ??
    defaultValue
  )
}

const parseConfigBoolean = value => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'string') {
    return value === 'true'
  }

  return Boolean(value)
}
