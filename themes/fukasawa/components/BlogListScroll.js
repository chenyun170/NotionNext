'use client'

import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useRef, useState, useMemo } from 'react'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'

const BlogListScroll = ({ posts }) => {
  const { locale, NOTION_CONFIG } = useGlobal()
  const [page, setPage] = useState(1)
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const loaderRef = useRef(null)

  // 计算总文章数和当前可见文章
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE)
  const postsToShow = useMemo(() => {
    return posts.slice(0, page * POSTS_PER_PAGE)
  }, [posts, page, POSTS_PER_PAGE])

  // 1. 使用 Intersection Observer 实现更平滑的加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.5 }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [page, totalPages])

  if (!posts || posts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div id="container" className="w-full">
      {/* 2. 统一放入一个容器，保证 CSS column-count 布局不中断 */}
      <div id="posts-wrapper" className="grid-container w-full">
        {postsToShow.map((post, index) => (
          <div
            key={post.id}
            className="grid-item w-full flex justify-center mb-6"
            style={{ breakInside: 'avoid' }}
          >
            <BlogCard 
                post={post} 
                // 仅为新分页的文章添加动画效果
                showAnimate={index >= (page - 1) * POSTS_PER_PAGE} 
            />
          </div>
        ))}
      </div>

      {/* 底部加载锚点 */}
      <div ref={loaderRef} className="w-full py-12 text-center text-gray-400 text-sm italic">
        {page < totalPages ? (
          <div className="flex justify-center items-center space-x-2">
             <i className="fas fa-spinner animate-spin"></i>
             <span>{locale.COMMON.MORE}</span>
          </div>
        ) : (
          <span>{locale.COMMON.NO_MORE} 😰</span>
        )}
      </div>
    </div>
  )
}

export default BlogListScroll
