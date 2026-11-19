import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import {
  getStaticFallbackMode,
  limitStaticPaths,
  prioritizeStaticPaths
} from '@/lib/utils/staticPaths'
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

export async function getStaticProps({ params: { category }, locale }) {
  const from = 'category-props'
  let props = await fetchGlobalAllData({ from, locale })

  // 过滤状态
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  // 处理过滤
  // 同名标签页会 301 到分类页，所以分类页要同时收下挂在该标签下的文章，
  // 否则原本 15 篇的「海关数据」标签内容只剩分类里的 6 篇。
  props.posts = props.posts.filter(
    post =>
      post &&
      ((post.category && post.category.includes(category)) ||
        (Array.isArray(post.tags) && post.tags.includes(category)))
  )
  // 处理文章页数
  props.postCount = props.posts.length
  // 处理分页
  const POST_LIST_STYLE = siteConfig(
    'POST_LIST_STYLE',
    'page',
    props?.NOTION_CONFIG
  )
  if (POST_LIST_STYLE === 'scroll') {
    // 滚动列表 给前端返回所有数据
  } else if (POST_LIST_STYLE === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // 空分类返回 404，避免任意 /category/xxx 返回 200 空列表（软 404）。
  // allPages 为空说明是 Notion 拉取失败，此时不能误判。
  const hasNotionData = Array.isArray(props.allPages) && props.allPages.length > 0
  if (hasNotionData && props.postCount === 0) {
    return { notFound: true, revalidate: 60 }
  }

  delete props.allPages

  props = { ...props, category }

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
  const { categoryOptions } = await fetchGlobalAllData({ from })
  const paths = Object.keys(categoryOptions).map(category => ({
    params: { category: categoryOptions[category]?.name }
  }))

  return {
    paths: limitStaticPaths(
      prioritizeStaticPaths(paths, 'category', ['海关数据', '外贸获客', '图灵搜', '顶易云']),
      'NEXT_PREBUILD_CATEGORY_PATH_LIMIT',
      2
    ),
    fallback: getStaticFallbackMode()
  }
}
