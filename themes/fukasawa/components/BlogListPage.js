import { AdSlot } from '@/components/GoogleAdsense'
import WWAds from '@/components/WWAds'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { Fragment, useMemo } from 'react'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'
import PaginationSimple from './PaginationSimple'

const BlogListPage = ({
  page = 1,
  posts = [],
  postCount,
  postsPerPage,
  siteInfo,
  showInlineAd = false
}) => {
  const { NOTION_CONFIG } = useGlobal()
  const resolvedPostsPerPage =
    Number.parseInt(postsPerPage || siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG), 10) || 12
  const totalPage = Math.ceil((postCount || posts.length) / resolvedPostsPerPage)
  const showNext = page < totalPage
  const filterPosts = useMemo(() => posts || [], [posts])

  // 专题入口指向真实的分类页（自带分页），不在本页做客户端筛选，
  // 否则只能过滤当前这一页的文章，和下方分页对不上。
  const quickCategories = useMemo(() => {
    if (!showInlineAd || filterPosts.length === 0) return []
    const counts = new Map()
    for (const post of filterPosts) {
      if (post?.category) {
        counts.set(post.category, (counts.get(post.category) || 0) + 1)
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name)
  }, [showInlineAd, filterPosts])

  if (!filterPosts || filterPosts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div className='w-full'>
      <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='text-[11px] font-bold uppercase tracking-[0.16em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
            INTELLIGENCE BRIEFINGS
          </div>
          <h2 className='mt-1 text-xl font-bold tracking-tight text-stone-950 dark:text-stone-50 sm:text-2xl'>
            最新实战文章
          </h2>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {quickCategories.length > 1 && (
            <div role='group' aria-label='按专题浏览文章' className='flex flex-wrap items-center gap-1.5'>
              {quickCategories.map(cat => (
                <SmartLink
                  key={cat}
                  href={`/category/${encodeURIComponent(cat)}`}
                  className='rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-semibold text-stone-600 no-underline transition hover:border-[#1c5a4a]/40 hover:text-[#1c5a4a] dark:border-stone-800 dark:bg-[#1c1a17] dark:text-stone-300 dark:hover:border-[#6bc4a6]/50 dark:hover:text-[#6bc4a6]'
                >
                  {cat}
                </SmartLink>
              ))}
            </div>
          )}

          <SmartLink
            href='/archive'
            className='ml-auto text-xs font-semibold text-stone-500 no-underline transition hover:text-[#1c5a4a] dark:text-stone-400 dark:hover:text-[#6bc4a6] sm:ml-2'
          >
            查看全部归档 →
          </SmartLink>
        </div>
      </div>

      <div id='posts-wrapper' className='grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {filterPosts.map((post, index) => {
          const isFeatured =
            Number(page) === 1 && index === 0 && filterPosts.length > 3
          return (
            <Fragment key={post.id}>
              <div className={`flex min-w-0 ${isFeatured ? 'md:col-span-2 xl:col-span-2' : ''}`}>
                <BlogCard index={index} post={post} siteInfo={siteInfo} featured={isFeatured} />
              </div>
              {showInlineAd &&
                Number(page) === 1 &&
                index === 2 &&
                siteConfig('AD_WWADS_ID') && (
                  <div className='col-span-full w-full'>
                    <WWAds className='w-full' orientation='horizontal' />
                  </div>
                )}
            </Fragment>
          )
        })}

        {siteConfig('ADSENSE_GOOGLE_ID') && (
          <div className='col-span-full w-full p-2'>
            <AdSlot type='flow' />
          </div>
        )}
      </div>

      <div className='flex justify-center py-10'>
        <PaginationSimple page={page} showNext={showNext} />
      </div>
    </div>
  )
}

export default BlogListPage
