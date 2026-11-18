import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { getStaticFallbackMode, limitStaticPaths } from '@/lib/utils/staticPaths'
import { DynamicLayout } from '@/themes/theme'

/**
 * 分类页
 * @param {*} props
 * @returns
 */

export default function Category(props) {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutPostList' {...props} />
}

export async function getStaticProps({ params: { category, page } }) {
  const from = 'category-page-props'
  let props = await fetchGlobalAllData({ from })

  // 与分类首页保持一致：分类匹配 OR 同名标签匹配
  props.posts = props.allPages
    ?.filter(item => item.type === 'Post' && item.status === 'Published')
    .filter(
      post =>
        post &&
        ((post.category && post.category.includes(category)) ||
          (Array.isArray(post.tags) && post.tags.includes(category)))
    )
  // 处理文章页数
  props.postCount = props.posts.length
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
  const currentPage = Number.parseInt(page, 10)
  const totalPages = Math.ceil(props.posts.length / POSTS_PER_PAGE)
  if (!Number.isInteger(currentPage) || currentPage < 1 || currentPage > totalPages) {
    return {
      redirect: {
        destination: `/category/${encodeURIComponent(category)}`,
        permanent: false
      }
    }
  }
  // 处理分页
  props.posts = props.posts.slice(
    POSTS_PER_PAGE * (currentPage - 1),
    POSTS_PER_PAGE * currentPage
  )

  delete props.allPages
  props.page = currentPage

  props = { ...props, category, page: currentPage }

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export async function getStaticPaths() {
  const from = 'category-paths'
  const { categoryOptions, allPages, NOTION_CONFIG } = await fetchGlobalAllData({
    from
  })
  const paths = []

  categoryOptions?.forEach(category => {
    // 过滤状态类型
    const categoryPosts = allPages
      ?.filter(page => page.type === 'Post' && page.status === 'Published')
      .filter(
        post =>
          post &&
          ((post.category && post.category.includes(category.name)) ||
            (Array.isArray(post.tags) && post.tags.includes(category.name)))
      )
    // 处理文章页数
    const postCount = categoryPosts.length
    const totalPages = Math.ceil(
      postCount / siteConfig('POSTS_PER_PAGE', null, NOTION_CONFIG)
    )
    if (totalPages > 1) {
      for (let i = 2; i <= totalPages; i++) {
        paths.push({ params: { category: category.name, page: '' + i } })
      }
    }
  })

  return {
    paths: limitStaticPaths(paths, 'NEXT_PREBUILD_CATEGORY_PAGE_PATH_LIMIT', 0),
    fallback: getStaticFallbackMode()
  }
}
