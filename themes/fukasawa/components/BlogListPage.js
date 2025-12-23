import React from 'react'
import { siteConfig } from '@/lib/config'
import BlogCard from './BlogCard'
import PaginationSimple from './PaginationSimple'
import { motion } from 'framer-motion' // 需要确保项目中已安装 framer-motion

const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  const trendingPosts = page === 1 ? posts?.slice(0, 3) : []
  const mainPosts = page === 1 ? posts?.slice(3) : posts

  const totalPage = Math.ceil(postCount / siteConfig('POSTS_PER_PAGE'))
  const showNext = page < totalPage

  // 定义动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 } // 子元素交错显示
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  }

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
      className='w-full'
    >
      {/* A. Trending Now 区域：带有进入动画 */}
      {page === 1 && trendingPosts.length > 0 && (
        <section className="mb-12 px-2">
          <motion.div 
            variants={itemVariants}
            className="flex items-center gap-2 mb-6 border-b border-gray-100 dark:border-gray-800 pb-2"
          >
            <span className="text-orange-500 animate-pulse text-lg">🔥</span>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800 dark:text-gray-200">
              Trending Now
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trendingPosts.map((post, index) => (
              <motion.div key={post.id} variants={itemVariants}>
                <BlogCard post={post} siteInfo={siteInfo} index={index} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* B. 主内容区：瀑布流平滑加载效果 */}
      <motion.div 
        id='posts-wrapper' 
        variants={containerVariants}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
      >
        {mainPosts?.map((post, index) => (
          <motion.div key={post.id} variants={itemVariants}>
            <BlogCard post={post} siteInfo={siteInfo} index={index} />
          </motion.div>
        ))}
      </motion.div>
      
      {/* 分页组件 */}
      <motion.div variants={itemVariants} className='py-12 flex justify-center'>
        <PaginationSimple page={page} showNext={showNext} />
      </motion.div>
    </motion.div>
  )
}

export default BlogListPage
