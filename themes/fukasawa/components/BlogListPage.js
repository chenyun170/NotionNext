import React from 'react'
import { siteConfig } from '@/lib/config'
import BlogCard from './BlogCard'
import SidebarTools from './SidebarTools' // 必须包含这一行

const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  // 热门文章逻辑：取前3篇
  const trendingPosts = posts?.slice(0, 3) || []

  return (
    <div className='w-full flex'>
      <div className='flex-grow'>
        {/* Trending Now 区域 */}
        {page === 1 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold italic mb-4">🔥 TRENDING NOW</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingPosts.map(post => (
                <BlogCard key={post.id} post={post} siteInfo={siteInfo} />
              ))}
            </div>
          </div>
        )}
        
        {/* 主文章列表 */}
        <div className='grid grid-cols-1 gap-4'>
          {posts.map(post => <BlogCard key={post.id} post={post} siteInfo={siteInfo} />)}
        </div>
      </div>

      {/* 侧边栏工具 */}
      <aside className='hidden lg:block w-80 ml-8'>
        <SidebarTools />
      </aside>
    </div>
  )
}

export default BlogListPage
