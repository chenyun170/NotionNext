import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import WWAds from '@/components/WWAds'
import BLOG from '@/blog.config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import { getActiveToolPromotions } from '@/lib/promo/toolPromotions'
import {
  trackCustomsDataSkillClick,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'
import SmartLink from '@/components/SmartLink'
import ArticleInsightPanel from './ArticleInsightPanel'
import ArticleQuickNav from './ArticleQuickNav'
import ArticleReadingProgress from './ArticleReadingProgress'
import ArticleNextActions from './ArticleNextActions'
import ArticleCopyrightNotice from './ArticleCopyrightNotice'
import Catalog from './Catalog'
import TagItemMini from './TagItemMini'
import ArticleRelatedPosts from './ArticleRelatedPosts'
import ArticleAround from './ArticleAround'

const NotionPage = dynamic(() => import('@/components/NotionPage'), {
  loading: () => null
})

const Comment = dynamic(() => import('@/components/Comment'), {
  ssr: false,
  loading: () => (
    <div className='rounded-xl border border-dashed border-stone-200 p-6 text-sm text-stone-400 dark:border-stone-800'>
      评论加载中…
    </div>
  )
})

const AdSlot = dynamic(
  () => import('@/components/GoogleAdsense').then(module => module.AdSlot),
  { ssr: false, loading: () => null }
)

const ArticleFAQ = dynamic(() => import('./ArticleFAQ'), {
  loading: () => null
})

const ShareBar = dynamic(() => import('@/components/ShareBar'), {
  ssr: false,
  loading: () => null
})

/**
 * Fukasawa 文章详情页 - 左正文 + 右粘性目录与工具软推双栏版
 */
export default function ArticleDetail(props) {
  const { post, prev, next, recommendPosts = [] } = props
  const global = useGlobal()
  const { locale } = global
  const showTitleIcon = parseConfigBoolean(
    getConfigValue(global, props?.NOTION_CONFIG, 'POST_TITLE_ICON', true)
  )
  const [promoData, setPromoData] = useState(() => getActiveToolPromotions())

  useEffect(() => {
    const syncPromos = () => setPromoData(getActiveToolPromotions())
    syncPromos()
    const timer = setInterval(syncPromos, 60000)
    return () => clearInterval(timer)
  }, [])

  if (!post) {
    return <></>
  }

  const isEditorialCover = String(post?.pageCover || '').includes('/images/covers/')
  const hasToc = Array.isArray(post?.toc) && post.toc.length > 0
  const sidebarPromo = promoData.items.slice(0, 2)

  return (
    <div id='container' className='mx-auto w-full'>
      <ArticleReadingProgress />

      <div className='lg:grid lg:grid-cols-[minmax(0,1fr)_272px] lg:items-start lg:gap-8'>
        {/* 左栏：文章阅读主体 */}
        <div className='min-w-0'>
          <article
            itemScope
            itemType='https://schema.org/BlogPosting'
            className='overflow-hidden rounded-2xl border border-stone-200/90 bg-white px-5 py-7 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17] sm:px-8 sm:py-9 lg:px-10 lg:py-10'
          >
            <meta itemProp='datePublished' content={post?.publishDate} />
            <meta
              itemProp='dateModified'
              content={post?.lastEditedDate || post?.publishDate}
            />

            <header className='mb-6 border-b border-stone-200/80 pb-6 dark:border-stone-800'>
              <div className='mb-3 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400'>
                {post?.category && (
                  <SmartLink
                    href={`/category/${encodeURIComponent(post.category)}`}
                    className='inline-flex items-center gap-1 rounded-full bg-[#e8f0ec] px-3 py-1 font-semibold text-[#1c5a4a] no-underline transition hover:bg-[#1c5a4a] hover:text-white dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
                  >
                    <i className='fas fa-folder-open text-[10px]' />
                    {post.category}
                  </SmartLink>
                )}

                {post?.type !== 'Page' && (
                  <>
                    <SmartLink
                      href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                      className='inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 font-medium text-stone-600 no-underline transition hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
                    >
                      <i className='far fa-calendar-alt text-[10px]' />
                      {post?.publishDay}
                    </SmartLink>
                    <span className='inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-stone-500 dark:bg-stone-800 dark:text-stone-400'>
                      <i className='far fa-clock text-[10px]' />
                      {locale?.COMMON?.LAST_EDITED_TIME}: {post.lastEditedDay}
                    </span>
                  </>
                )}
              </div>

              <h1
                itemProp='headline'
                className='text-2xl font-extrabold leading-[1.25] tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl lg:text-[2.15rem]'
              >
                {showTitleIcon && <NotionIcon icon={post?.pageIcon} />}
                {post.title}
              </h1>

              {post.tagItems && post.tagItems.length > 0 && (
                <div className='mt-4 flex flex-wrap gap-1.5'>
                  {post.tagItems.map(tag => (
                    <TagItemMini key={tag.name} tag={tag} />
                  ))}
                </div>
              )}
            </header>

            {/* 克制尺寸的文章封面 */}
            {post?.type && post?.type !== 'Page' && post?.pageCover && (
              <div
                className={`relative mb-6 w-full max-h-[420px] overflow-hidden rounded-xl border border-stone-200/80 dark:border-stone-800 ${
                  isEditorialCover
                    ? 'aspect-[3/2] bg-[#f7f5f1] dark:bg-[#131210]'
                    : 'aspect-[16/9] bg-stone-100 dark:bg-stone-900'
                }`}
              >
                <LazyImage
                  priority
                  alt={post.title}
                  src={post?.pageCover}
                  width={1200}
                  height={675}
                  className={`absolute inset-0 h-full w-full ${
                    isEditorialCover ? 'object-contain' : 'object-cover'
                  }`}
                />
              </div>
            )}

            <WWAds className='mb-4 w-full' orientation='horizontal' />

            <ArticleInsightPanel post={post} />

            {/* 移动端折叠目录（桌面端已在右侧粘性展示） */}
            <div className='lg:hidden'>
              <ArticleQuickNav post={post} />
            </div>

            <section id='article-wrapper' itemProp='articleBody'>
              {post && <NotionPage post={post} />}
            </section>

            <ArticleFAQ post={post} />
            <ArticleRelatedPosts posts={recommendPosts} />
            <ArticleNextActions post={post} />
            <ArticleCopyrightNotice post={post} />

            <section className='mt-6'>
              <AdSlot type='in-article' />
              <ShareBar post={post} />
            </section>
          </article>

          {post?.type === 'Post' && <ArticleAround prev={prev} next={next} />}

          <div className='mt-6 w-full overflow-x-hidden rounded-2xl border border-stone-200/90 bg-white px-4 py-6 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17] sm:px-8'>
            <Comment frontMatter={post} />
          </div>
        </div>

        {/* 右栏：桌面端粘性目录 + 获客工具活动/试用软推卡片 */}
        <aside className='hidden space-y-5 lg:sticky lg:top-28 lg:block print:hidden'>
          {hasToc && <Catalog toc={post.toc} />}

          <div className='rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'>
            <div className='mb-3 flex items-center justify-between'>
              <span className='text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                {promoData.hasLiveCampaign ? '限时工具活动' : '软件免费试用'}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  promoData.hasLiveCampaign
                    ? 'bg-[#b97a52]/15 text-[#9a5833] dark:text-[#e8c9a8]'
                    : 'bg-[#e8f0ec] text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
                }`}
              >
                {promoData.hasLiveCampaign ? '活动中' : '可试用'}
              </span>
            </div>

            <div className='space-y-3'>
              {sidebarPromo.map(item => (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'sponsored noopener noreferrer' : undefined}
                  onClick={() => {
                    if (item.id === 'oraskl') {
                      trackCustomsDataSkillClick(`article_rail_${item.trackSource}`)
                    } else {
                      trackToolOutboundClick({
                        source: `article_rail_${item.trackSource}`,
                        target: item.href,
                        tool: item.tool,
                        sourceGroup: 'article'
                      })
                    }
                  }}
                  className='block rounded-xl border border-stone-200/80 bg-[#faf9f6] p-3 no-underline transition hover:border-[#1c5a4a]/50 hover:bg-white dark:border-stone-800 dark:bg-[#151412] dark:hover:border-[#3fa383]'
                >
                  <div className='flex items-center justify-between text-xs font-bold text-stone-900 dark:text-stone-100'>
                    <span>{item.name}</span>
                    <span className='text-[11px] text-[#1c5a4a] dark:text-[#6bc4a6]'>
                      {item.cta} →
                    </span>
                  </div>
                  <p className='mt-1 line-clamp-2 text-[11px] leading-5 text-stone-500 dark:text-stone-400'>
                    {item.description}
                  </p>
                </a>
              ))}
            </div>

            <div className='mt-3 border-t border-stone-100 pt-3 dark:border-stone-800'>
              <SmartLink
                href='/customs-data-skill.html'
                onClick={() => trackCustomsDataSkillClick('article_rail_customs')}
                className='inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1c5a4a] py-2 text-xs font-semibold text-white no-underline transition hover:bg-[#14453a]'
              >
                <i className='fas fa-database text-[10px]' />
                免费查海关数据
              </SmartLink>
            </div>
          </div>
        </aside>
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
          scroll-margin-top: 108px;
          letter-spacing: -0.015em;
        }

        #article-wrapper .notion-quote {
          margin: 1.25rem 0;
          border-left-width: 4px;
          border-left-color: #1c5a4a;
          border-radius: 0 0.75rem 0.75rem 0;
          background: rgba(28, 90, 74, 0.08);
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

        @media (max-width: 767px) {
          #article-wrapper .notion-simple-table {
            display: table !important;
            width: 100% !important;
            max-width: 100% !important;
            table-layout: fixed !important;
            white-space: normal !important;
            overflow-x: visible !important;
          }

          #article-wrapper .notion-simple-table tr:first-child td {
            font-size: 12px !important;
            line-height: 1.5 !important;
            padding: 8px 5px !important;
          }

          #article-wrapper .notion-simple-table td,
          #article-wrapper .notion-simple-table th {
            width: auto !important;
            min-width: 0 !important;
          }

          #article-wrapper .notion-simple-table td,
          #article-wrapper .notion-simple-table .notion-simple-table-cell {
            white-space: normal !important;
            word-break: break-word !important;
            padding: 8px 5px !important;
            font-size: 13px !important;
            line-height: 1.6 !important;
            vertical-align: middle !important;
          }

          #article-wrapper .notion-simple-table td > div {
            white-space: normal !important;
          }

          #article-wrapper .notion-table:has(.notion-simple-table td:nth-child(5)) {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
          }
          #article-wrapper .notion-table:has(.notion-simple-table td:nth-child(5)) .notion-simple-table {
            width: auto !important;
            min-width: 560px !important;
            table-layout: auto !important;
          }
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
