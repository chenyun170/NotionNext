'use client'

import { AdSlot } from '@/components/GoogleAdsense'
import WWAds from '@/components/WWAds'
import SmartLink from '@/components/SmartLink'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { Fragment } from 'react'
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
  const filterPosts = posts || []

  if (!filterPosts || filterPosts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div className='w-full'>
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div>
          <div className='text-[11px] font-bold uppercase tracking-[0.16em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
            INTELLIGENCE BRIEFINGS
          </div>
          <h2 className='mt-1 text-xl font-bold tracking-tight text-stone-950 dark:text-stone-50 sm:text-2xl'>
            最新实战文章
          </h2>
        </div>
        <SmartLink
          href='/archive'
          className='text-xs font-semibold text-stone-500 no-underline transition hover:text-[#1c5a4a] dark:text-stone-400 dark:hover:text-[#6bc4a6]'
        >
          查看全部归档 →
        </SmartLink>
      </div>

      <div id='posts-wrapper' className='grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {filterPosts.map((post, index) => (
          <Fragment key={post.id}>
            <div className='flex'>
              <BlogCard index={index} post={post} siteInfo={siteInfo} />
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
        ))}

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
