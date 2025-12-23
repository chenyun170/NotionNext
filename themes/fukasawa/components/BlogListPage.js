import React from 'react'
import { siteConfig } from '@/lib/config'
import BlogCard from './BlogCard'
import PaginationSimple from './PaginationSimple'

const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  const trendingPosts = page === 1 ? posts?.slice(0, 3) : []
  const mainPosts = page === 1 ? posts?.slice(3) : posts

  const totalPage = Math.ceil(postCount / siteConfig('POSTS_PER_PAGE'))
  const showNext = page < totalPage

  return (
    <div className='w-full'>
      {/* A. Trending Now 区域 */}
      {page === 1 && trendingPosts.length > 0 && (
        <section className="mb-12 px-2 animate__animated animate__fadeIn">
          <div className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-2">
            <span className="text-orange-500 animate-pulse text-lg">🔥</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
              Trending Now
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingPosts.map((post, index) => (
              <div 
                key={post.id} 
                className="opacity-0 animate-slide-up" 
                style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'forwards' }}
              >
                <BlogCard post={post} siteInfo={siteInfo} index={index} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* B. 主内容区 - 3列全宽布局 */}
      <div id='posts-wrapper' className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {mainPosts?.map((post, index) => (
          <div 
            key={post.id} 
            className="opacity-0 animate-slide-up"
            style={{ animationDelay: `${(index % 6) * 100}ms`, animationFillMode: 'forwards' }}
          >
            <BlogCard post={post} siteInfo={siteInfo} index={index} />
          </div>
        ))}
      </div>
      
      <div className='py-12 flex justify-center'>
        <PaginationSimple page={page} showNext={showNext} />
      </div>

      {/* 注入原生 CSS 动画 */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

export default BlogListPage
