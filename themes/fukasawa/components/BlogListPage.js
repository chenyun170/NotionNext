import React from 'react'
import { siteConfig } from '@/lib/config'
import BlogCard from './BlogCard'
import PaginationSimple from './PaginationSimple'

const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  // 1. 逻辑分层：热门文章取前3篇，剩余的作为普通列表
  const trendingPosts = page === 1 ? posts?.slice(0, 3) : []
  const mainPosts = page === 1 ? posts?.slice(3) : posts

  // 分页逻辑
  const totalPage = Math.ceil(postCount / siteConfig('POSTS_PER_PAGE'))
  const showNext = page < totalPage

  return (
    <div className='w-full'>
      {/* A. Trending Now 区域：独占顶部宽度 */}
      {page === 1 && trendingPosts.length > 0 && (
        <section className="mb-12 px-2">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-2">
            <span className="text-orange-500 animate-pulse">🔥</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">Trending Now</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingPosts.map((post, index) => (
              <BlogCard key={post.id} post={post} siteInfo={siteInfo} index={index} />
            ))}
          </div>
        </section>
      )}

      {/* B. 主内容区：使用 Flex 布局分离列表与侧边栏 */}
      <div className='flex flex-col lg:flex-row gap-8'>
        
        {/* 左侧：文章主列表 */}
        <div className='flex-grow'>
          <div id='posts-wrapper' className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {mainPosts?.map((post, index) => (
              <BlogCard key={post.id} post={post} siteInfo={siteInfo} index={index} />
            ))}
          </div>
          
          {/* 分页组件 */}
          <div className='py-10'>
            <PaginationSimple page={page} showNext={showNext} />
          </div>
        </div>

        {/* 右侧：侧边栏工具栏 */}
        <aside className='w-full lg:w-80 flex-shrink-0'>
          <div className='sticky top-20'>
            <SidebarTools />
          </div>
        </aside>
        
      </div>
    </div>
  )
}

export default BlogListPage
