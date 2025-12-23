import { AdSlot } from '@/components/GoogleAdsense'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { deepClone, isBrowser } from '@/lib/utils'
import { debounce } from 'lodash'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import BlogCard from './BlogCard'
import BlogPostListEmpty from './BlogListEmpty'
import PaginationSimple from './PaginationSimple'
import HeroSection from './HeroSection'

/**
 * Enhanced Blog List with Trending Now section
 */
const BlogListPage = ({ page = 1, posts = [], postCount, siteInfo }) => {
  const router = useRouter()
  const { NOTION_CONFIG } = useGlobal()
  const postsPerPage = siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
  const totalPage = Math.ceil(postCount / postsPerPage)
  const showNext = page < totalPage

  const [columns, setColumns] = useState(calculateColumns())
  const [filterPosts, setFilterPosts] = useState([])

  useEffect(() => {
    const handleResize = debounce(() => {
      setColumns(calculateColumns())
    }, 200)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const count = posts?.length || 0
    if (count === 0) return
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

  if (!posts || posts.length === 0) {
    return <BlogPostListEmpty />
  }

  return (
    <div className='w-full'>
      {/* 1. Hero Header */}
      {page === 1 && <HeroSection />}

      {/* 2. Trending Now Section - Restored */}
      {page === 1 && posts?.length > 0 && (
        <section className="mt-8 mb-10 px-2 animate__animated animate__fadeIn">
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 shadow-lg shadow-orange-500/20">
              <i className="fas fa-fire text-white text-xs"></i>
            </div>
            <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] italic">Trending Now</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-800 ml-2"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, 3).map((post, index) => (
              <div 
                key={post.id} 
                onClick={() => router.push(`/${post.slug}`)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/5 backdrop-blur-md p-3 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl shadow-inner bg-gray-100 dark:bg-gray-800">
                    <img 
                      src={post.pageCover || '/default-cover.png'} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      alt={post.title} 
                    />
                    <div className="absolute top-0 left-0 bg-orange-600 text-white text-[9px] font-black px-2 py-0.5 rounded-br-lg z-10">
                      TOP {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[13px] font-bold text-slate-800 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <i className="far fa-calendar-alt text-blue-500/50"></i> {post.date?.start_date || post.publishDay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Main Article Grid */}
      <div id='posts-wrapper' className='grid-container mt-4'>
        {filterPosts?.map((post, index) => (
          <div
            key={post.id}
            className='grid-item justify-center flex'
            style={{ breakInside: 'avoid' }}>
            <BlogCard
              index={index}
              key={post.id}
              post={post}
              siteInfo={siteInfo}
            />
          </div>
        ))}
        {siteConfig('ADSENSE_GOOGLE_ID') && (
          <div className='p-3'>
            <AdSlot type='flow' />
          </div>
        )}
      </div>
      
      <div className='mt-12'>
        <PaginationSimple page={page} showNext={showNext} />
      </div>
    </div>
  )
}

const calculateColumns = () => {
  if (!isBrowser) return 3
  if (window.innerWidth >= 1024) return 3
  if (window.innerWidth >= 640) return 2
  return 1
}

export default SidebarTools;
