import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { getHomePostsPerPage } from '@/lib/utils/homePosts'
import { isHomepageListPost } from '@/lib/utils/postVisibility'
import { getStaticFallbackMode, limitStaticPaths } from '@/lib/utils/staticPaths'
import { DynamicLayout } from '@/themes/theme'

/**
 * 文章列表分页
 * @param {*} props
 * @returns
 */
const Page = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutPostList' {...props} />
}

export async function getStaticPaths({ locale }) {
  const from = 'page-paths'
  const { allPages, NOTION_CONFIG } = await fetchGlobalAllData({ from, locale })
  const HOME_POSTS_PER_PAGE = getHomePostsPerPage(NOTION_CONFIG)
  const postCount = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published' && isHomepageListPost(page)
  ).length || 0
  const totalPages = Math.ceil(
    postCount / HOME_POSTS_PER_PAGE
  )
  const paths = Array.from({ length: totalPages - 1 }, (_, i) => ({
      params: { page: '' + (i + 2) }
    }))
  return {
    // remove first page, we 're not gonna handle that.
    paths: limitStaticPaths(paths, 'NEXT_PREBUILD_HOME_PAGE_PATH_LIMIT', 0),
    fallback: getStaticFallbackMode()
  }
}

export async function getStaticProps({ params: { page }, locale }) {
  const from = `page-${page}`
  const props = await fetchGlobalAllData({ from, locale })
  const { allPages } = props
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )

  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published' && isHomepageListPost(page)
  )
  const HOME_POSTS_PER_PAGE = getHomePostsPerPage(props?.NOTION_CONFIG)
  const currentPage = Number.parseInt(page, 10)
  // 处理分页
  props.posts = allPosts.slice(
    HOME_POSTS_PER_PAGE * (currentPage - 1),
    HOME_POSTS_PER_PAGE * currentPage
  )
  props.page = currentPage
  props.postsPerPage = HOME_POSTS_PER_PAGE
  props.postCount = allPosts.length

  // 处理预览
  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') {
        continue
      }
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  delete props.allPages
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

export default Page
