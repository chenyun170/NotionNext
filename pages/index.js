import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

/**
 * 首页布局组件
 * - 使用可选链防止 props.NOTION_CONFIG 为空时崩溃
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props?.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据（兼容 next export / Vercel）
 */
export async function getStaticProps(context) {
  const locale = context?.locale || 'zh-CN'
  const from = 'index'

  // 1) 获取全局数据（加 try/catch，避免某个 locale 直接把 export 干死）
  let props
  try {
    props = await getGlobalData({ from, locale })
  } catch (e) {
    console.error('getGlobalData failed:', { from, locale, error: e })
    return { notFound: true }
  }

  if (!props) {
    console.error('Failed to fetch global data for index page', { from, locale })
    return { notFound: true }
  }

  const NOTION_CONFIG = props?.NOTION_CONFIG
  const POST_PREVIEW_LINES = siteConfig('POST_PREVIEW_LINES', 12, NOTION_CONFIG)
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE', 'page', NOTION_CONFIG)

  // 2) 筛选已发布文章
  const allPosts =
    props.allPages?.filter(
      page => page.type === 'Post' && page.status === BLOG.NOTION_PROPERTY_NAME.status_publish
    ) || []

  // 3) 根据布局风格截取文章
  if (POST_LIST_STYLE === 'scroll') {
    props.posts = allPosts
  } else {
    props.posts = allPosts.slice(0, POSTS_PER_PAGE)
  }

  // 4) 并行抓取预览摘要（失败不阻断构建）
  const shouldPreview = siteConfig('POST_LIST_PREVIEW', false, NOTION_CONFIG)
  if (shouldPreview && props.posts.length > 0) {
    await Promise.allSettled(
      props.posts.map(async post => {
        if (!post?.password && !post?.blockMap) {
          try {
            post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
          } catch (e) {
            console.error('getPostBlocks failed:', { postId: post?.id, error: e })
          }
        }
      })
    )
  }

  // 5) 生产环境副作用任务：export 阶段跳过，避免 /zh-CN 这类路径导出失败
  const isExportPhase =
    process.env.NEXT_PHASE === 'phase-export' || process.env.EXPORT === 'true'

  if (process.env.NODE_ENV === 'production' && !isExportPhase) {
    try {
      // 注意：用 Promise.resolve().then 包一层，避免同步 throw 绕过 allSettled
      await Promise.allSettled([Promise.resolve().then(() => checkDataFromAlgolia(props))])
    } catch (error) {
      console.error('Production static assets generation failed:', error)
    }
  }

  // 6) 数据清理：防止冗余数据注入 HTML
  delete props.allPages

  return {
    props,
    revalidate: parseInt(
      siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, NOTION_CONFIG)
    )
  }
}

export default Index
