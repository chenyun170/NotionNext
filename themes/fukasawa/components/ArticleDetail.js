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
import ArticleNextActions from './ArticleNextActions'
import ArticleCopyrightNotice from './ArticleCopyrightNotice'
import TagItemMini from './TagItemMini'

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
        className='subpixel-antialiased overflow-y-hidden bg-white px-5 py-10 dark:border-gray-700 dark:bg-hexo-black-gray md:px-32 lg:pt-24'>
        <meta itemProp='datePublished' content={post?.publishDate} />
        <meta itemProp='dateModified' content={post?.lastEditedDate || post?.publishDate} />
        <header className='mb-8 border-b border-dashed border-zinc-200 pb-6 dark:border-zinc-800 sm:mb-10 sm:pb-8'>
          {/* 文章Title */}
          <h1 itemProp='headline' className='max-w-4xl text-[2rem] font-black leading-tight tracking-tight text-black dark:text-white sm:text-4xl md:text-5xl'>
            {showTitleIcon && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {post.title}
          </h1>

          <section className='mt-4 flex flex-wrap items-center gap-1.5 text-[13px] leading-6 text-zinc-500 dark:text-zinc-400 sm:mt-5 sm:gap-2 sm:text-sm'>
            <div className='flex flex-wrap items-center gap-1.5 sm:gap-2'>
              {post?.category && (
                <>
                  <SmartLink
                    href={`/category/${post.category}`}
                    passHref
                    className='inline-flex cursor-pointer items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-black dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300 dark:hover:text-white sm:px-3'>
                    <i className='mr-1 fas fa-folder-open' />
                    {post.category}
                  </SmartLink>
                </>
              )}

              {post?.type !== 'Page' && (
                <>
                  <SmartLink
                    href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                    passHref
                    className='inline-flex cursor-pointer items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-medium text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-400 dark:hover:text-zinc-200 sm:px-3'>
                    <i className='far fa-calendar-alt mr-1.5' />
                    {post?.publishDay}
                  </SmartLink>
                  <span className='inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-500 sm:px-3'>
                    <i className='far fa-clock mr-1.5' />
                    {locale.COMMON.LAST_EDITED_TIME}: {post.lastEditedDay}
                  </span>
                </>
              )}

              <div className='mt-3 w-full'>
                {post.tagItems && (
                  <div className='flex flex-nowrap overflow-x-auto pb-1'>
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
        <ArticleNextActions post={post} />

        <ArticleCopyrightNotice post={post} />

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
