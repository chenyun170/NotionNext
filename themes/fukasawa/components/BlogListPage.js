'use client'

import { AdSlot } from '@/components/GoogleAdsense'
import WWAds from '@/components/WWAds'
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
      <div id='posts-wrapper' className='grid w-full gap-x-10 md:grid-cols-2'>
        {filterPosts.map((post, index) => (
          <Fragment key={post.id}>
            <div
              className='opacity-0 animate-fade-in-up'
              style={{ 
                animationDelay: `${(index % 6) * 100}ms`,
                animationFillMode: 'forwards',
                breakInside: 'avoid'
              }}
            >
              <BlogCard index={index} post={post} siteInfo={siteInfo} />
            </div>
            {showInlineAd && Number(page) === 1 && index === 3 && (
              <div className='w-full' style={{ breakInside: 'avoid' }}>
                <WWAds className='w-full' orientation='horizontal' />
              </div>
            )}
          </Fragment>
        ))}

        {siteConfig('ADSENSE_GOOGLE_ID') && (
          <div className='w-full p-3' style={{ breakInside: 'avoid' }}>
            <AdSlot type='flow' />
          </div>
        )}
      </div>

      <div className='py-12 flex justify-center'>
        <PaginationSimple page={page} showNext={showNext} />
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  )
}



export default BlogListPage
