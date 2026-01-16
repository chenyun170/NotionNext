'use client'

import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { debounce } from 'lodash'
import { useEffect, useState, useMemo } from 'react'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'
import PaginationSimple from './PaginationSimple'

const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  const { NOTION_CONFIG } = useGlobal()
  const postsPerPage = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / postsPerPage)
  const showNext = page < totalPage

  const [columns, setColumns] = useState(calculateColumns())

  // 1. 响应式监听优化
  useEffect(() => {
    const handleResize = debounce(() => setColumns(calculateColumns()), 200)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 2. 核心算法优化：改用 useMemo，移除冗余的 deepClone
  const filterPosts = useMemo(() => {
    const count = posts?.length || 0
    if (count === 0) return []
    
    const rows = Math.ceil(count / columns)
    const rearranged = []

    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const sourceIndex = row * columns + col
        if (sourceIndex < count) {
          rearranged.push(posts[sourceIndex])
        }
      }
    }
    return rearranged
  }, [columns, posts])

  if (!filterPosts || filterPosts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div className='w-full'>
      {/* 调整为 column 布局以支持原生瀑布流 (Fukasawa 风格) */}
      <div 
        id='posts-wrapper' 
        className='w-full gap-8'
        style={{
          columnCount: columns,
          columnGap: '2rem'
        }}
      >
        {filterPosts.map((post, index) => (
          <div
            key={post.id}
            className='opacity-0 animate-fade-in-up mb-8'
            style={{ 
              animationDelay: `${(index % 6) * 100}ms`,
              animationFillMode: 'forwards',
              breakInside: 'avoid' // 防止卡片被跨列截断
            }}
          >
            <BlogCard index={index} post={post} siteInfo={siteInfo} />
          </div>
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

const calculateColumns = () => {
  if (!isBrowser) return 3
  if (window.innerWidth >= 1280) return 3
  if (window.innerWidth >= 768) return 2
  return 1
}

export default BlogListPage
