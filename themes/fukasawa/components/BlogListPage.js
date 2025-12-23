import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { deepClone, isBrowser } from '@/lib/utils'
import { debounce } from 'lodash'
import { useEffect, useState } from 'react'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'
import PaginationSimple from './PaginationSimple'

/**
 * 优化动态版：保留行列重排逻辑，增加渐显动画与布局优化
 */
const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  const { NOTION_CONFIG } = useGlobal()
  const postsPerPage = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / postsPerPage)
  const showNext = page < totalPage

  const [columns, setColumns] = useState(calculateColumns())
  const [filterPosts, setFilterPosts] = useState([])

  // 1. 响应式监听
  useEffect(() => {
    const handleResize = debounce(() => {
      setColumns(calculateColumns())
    }, 200)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 2. 核心算法：行列重组逻辑 (保持原有逻辑)
  useEffect(() => {
    const count = posts?.length || 0
    const rows = Math.ceil(count / columns)
    const newFilterPosts = new Array(count)

    let index = 0
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < rows; row++) {
        const sourceIndex = row * columns + col
        if (sourceIndex < count) {
          newFilterPosts[index] = deepClone(posts[sourceIndex])
          index++
        }
      }
    }
    setFilterPosts(newFilterPosts)
  }, [columns, posts])

  if (!filterPosts || filterPosts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div className='w-full'>
      {/* 文章列表容器：使用响应式 Grid 布局 */}
      <div 
        id='posts-wrapper' 
        className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full'
      >
        {filterPosts?.map((post, index) => (
          <div
            key={post.id}
            className='opacity-0 animate-fade-in-up'
            style={{ 
              animationDelay: `${(index % 6) * 100}ms`, // 错开入场时间
              animationFillMode: 'forwards' 
            }}
          >
            <BlogCard
              index={index}
              post={post}
              siteInfo={siteInfo}
            />
          </div>
        ))}

        {/* 广告位 */}
        {siteConfig('ADSENSE_GOOGLE_ID') && (
          <div className='col-span-full p-3'>
            <AdSlot type='flow' />
          </div>
        )}
      </div>

      {/* 分页按钮容器 */}
      <div className='py-12 flex justify-center'>
        <PaginationSimple page={page} showNext={showNext} />
      </div>

      {/* 原生动画样式注入 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
      `}</style>
    </div>
  )
}

/**
 * 计算文章列数
 */
const calculateColumns = () => {
  if (!isBrowser) return 3
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 640) return 2
  return 1
}

export default BlogListPage
