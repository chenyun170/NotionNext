import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/getSiteData'
import { generateRobotsTxt } from '@/lib/robots.txt'
import { generateRss } from '@/lib/rss'
import { DynamicLayout } from '@/themes/theme'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

/**
 * 首页布局组件
 * 优化点：使用可选链防止 props.NOTION_CONFIG 为空时崩溃
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props?.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据 (性能与稳定性增强版)
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  
  // 1. 异步获取全局基础数据
  const props = await getGlobalData({ from, locale })
  
  // 预防性检查：如果 props 获取失败，返回 404 防止 Build 过程中断报错
  if (!props) {
    console.error('Failed to fetch global data for index page')
    return { notFound: true }
  }

  const NOTION_CONFIG = props?.NOTION_CONFIG
  const POST_PREVIEW_LINES = siteConfig('POST_PREVIEW_LINES', 12, NOTION_CONFIG)
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, NOTION_CONFIG)
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE', 'page', NOTION_CONFIG)

  // 2. 筛选并处理已发布文章 (使用配置常量)
  const allPosts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === BLOG.NOTION_PROPERTY_NAME.status_publish
  ) || []

  // 3. 根据布局风格截取文章
  if (POST_LIST_STYLE === 'scroll') {
    props.posts = allPosts
  } else {
    props.posts = allPosts.slice(0, POSTS_PER_PAGE)
  }

  // 4. 预览摘要并行抓取优化 (解决串行加载慢的问题)
  const shouldPreview = siteConfig('POST_LIST_PREVIEW', false, NOTION_CONFIG)
  if (shouldPreview && props.posts.length > 0) {
    await Promise.all(
      props.posts.map(async (post) => {
        if (!post.password && !post.blockMap) {
          post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
        }
      })
    )
  }

  // 5. 静态资源生产环境自动化生成 (并发任务模式)
  if (process.env.NODE_ENV === 'production') {
    try {
      // 使用 Promise.allSettled 确保任务并行执行且互不干扰
      await Promise.allSettled([
        generateRobotsTxt(props),
        generateRss(props),
        generateSitemapXml(props),
        checkDataFromAlgolia(props)
      ])
      
      // UUID 重定向 JSON 保持同步执行确保准确性
      if (siteConfig('UUID_REDIRECT', false, NOTION_CONFIG)) {
        generateRedirectJson(props)
      }
    } catch (error) {
      console.error('Production static assets generation failed:', error)
    }
  }

  // 6. 极致数据清理：防止冗余数据（如所有隐藏页面）注入 HTML 导致手机端加载变慢
  // 仅保留 posts，彻底删除原始 allPages 缓存
  delete props.allPages

  return {
    props,
    revalidate: parseInt(
      siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, NOTION_CONFIG)
    )
  }
}

export default Index
