import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import { useRouter } from 'next/router'

/**
 * 搜索路由
 */
const Search = props => {
  const { posts = [] } = props

  const router = useRouter()
  const keyword = router?.query?.s

  let filteredPosts = []
  if (keyword) {
    const k = String(keyword).toLowerCase()

    filteredPosts = posts.filter(post => {
      const tagContent = Array.isArray(post?.tags) ? post.tags.join(' ') : ''
      const categoryContent = Array.isArray(post?.category)
        ? post.category.join(' ')
        : (post?.category ? String(post.category) : '')

      const searchContent = `${post?.title || ''} ${post?.summary || ''} ${tagContent} ${categoryContent}`
      return searchContent.toLowerCase().includes(k)
    })
  }

  const nextProps = { ...props, posts: filteredPosts }
  const theme = siteConfig('THEME', BLOG.THEME, nextProps?.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutSearch' {...nextProps} />
}

/**
 * 浏览器前端搜索（SSG）
 * 重点：只下发轻量索引，避免 page data 过大
 */
export async function getStaticProps({ locale }) {
  const props = await fetchGlobalAllData({
    from: 'search-props',
    locale
  })

  const allPages = props?.allPages || []
  const publishedPosts = allPages.filter(
    page => page?.type === 'Post' && page?.status === 'Published'
  )

  // ✅ 只保留搜索需要的最小字段（大幅缩小 /search page data）
  props.posts = publishedPosts.map(p => ({
    id: p?.id,
    title: p?.title || '',
    summary: p?.summary || '',
    tags: p?.tags || [],
    category: p?.category || [],
    slug: p?.slug || p?.id
  }))

  // ✅ 删除大字段，避免注入到 page data
  delete props.allPages
  delete props.blockMap
  delete props.recordMap

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props?.NOTION_CONFIG
        )
  }
}

export default Search
