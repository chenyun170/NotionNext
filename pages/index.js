import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/getSiteData'
import { generateRobotsTxt } from '@/lib/robots.txt'
import { generateRss } from '@/lib/rss'
import { generateSitemapXml } from '@/lib/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

/**
 * 首页布局
 */
const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

/**
 * SSG 获取数据
 */
export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  
  // 1. 获取全局数据
  const props = await getGlobalData({ from, locale })
  
  // 预防性检查：如果 props 为空，返回 404 防止 build 报错
  if (!props) {
    return { notFound: true }
  }

  // 2. 筛选已发布文章
  const allPosts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === BLOG.NOTION_PROPERTY_NAME.status_publish
  ) || []

  // 3. 处理分页与预览逻辑
  const POST_LIST_STYLE = siteConfig('POST_LIST_STYLE', 'page', props.NOTION_CONFIG)
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props.NOTION_CONFIG)
  
  if (POST_LIST_STYLE === 'scroll') {
    props.posts = allPosts
  } else {
    props.posts = allPosts.slice(0, POSTS_PER_PAGE)
  }

  // 4. 服务端生成静态资源 (仅在 Build 时执行，减少 revalidate 时的压力)
  // 增加强制域名检查，确保 Sitemap 链接包含 www
  if (process.env.NODE_ENV === 'production') {
     try {
        generateRobotsTxt(props)
        generateRss(props)
        generateSitemapXml(props)
        checkDataFromAlgolia(props)
        
        if (siteConfig('UUID_REDIRECT', false, props.NOTION_CONFIG)) {
          generateRedirectJson(props)
        }
     } catch (error) {
        console.error('静态资源生成失败:', error)
     }
  }

  // 5. 数据清理：防止冗余数据注入 HTML
  // 彻底删除 allPages，只保留必要的 posts
  delete props.allPages

  return {
    props,
    revalidate: parseInt(siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, props.NOTION_CONFIG))
  }
}

export default Index
