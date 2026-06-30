import BLOG from '@/blog.config'
import { getDataFromCache } from '@/lib/cache/cache_manager'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { DynamicLayout } from '@/themes/theme'
import { getPageContentText } from '@/lib/db/notion/getPageContentText'
import { shouldRedirectSearchToCustomsSkill } from '@/lib/utils/customsDataSkill'
import { pickSearchResultPost } from '@/lib/utils/post'
import { getStaticFallbackMode } from '@/lib/utils/staticPaths'

const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutSearch' {...props} />
}

/**
 * 服务端搜索
 * @param {*} param0
 * @returns
 */
export async function getStaticProps({ params: { keyword }, locale }) {
  if (shouldRedirectSearchToCustomsSkill(keyword)) {
    return {
      redirect: {
        destination: '/customs-data-skill.html',
        permanent: true
      }
    }
  }

  const props = await fetchGlobalAllData({
    from: 'search-props',
    locale
  })
  const { allPages } = props
  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  const filteredPosts = await filterByMemCache(allPosts, keyword)
  props.postCount = filteredPosts.length
  props.posts = filteredPosts
  const POST_LIST_STYLE = siteConfig(
    'POST_LIST_STYLE',
    'Page',
    props?.NOTION_CONFIG
  )
  const POSTS_PER_PAGE = siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)

  // 处理分页
  if (POST_LIST_STYLE === 'scroll') {
    // 滚动列表默认给前端返回所有数据
  } else if (POST_LIST_STYLE) {
    props.posts = props.posts?.slice(0, POSTS_PER_PAGE)
  }
  props.posts = props.posts.map(pickSearchResultPost).filter(Boolean)
  props.keyword = keyword
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

export function getStaticPaths() {
  return {
    paths: process.env.EXPORT ? [{ params: { keyword: 'NotionNext' } }] : [],
    fallback: getStaticFallbackMode()
  }
}

/**
 * 在内存缓存中进行全文索引
 * @param {*} allPosts
 * @param keyword 关键词
 * @returns
 */
async function filterByMemCache(allPosts, keyword) {
  const filterPosts = []
  if (keyword) {
    keyword = keyword.trim().toLowerCase()
  }
  for (const post of allPosts) {
    const cacheKey = 'page_block_' + post.id
    const page = await getDataFromCache(cacheKey, true)
    const tagContent =
      post?.tags && Array.isArray(post?.tags) ? post?.tags.join(' ') : ''
    const categoryContent =
      post.category && Array.isArray(post.category)
        ? post.category.join(' ')
        : ''
    const articleInfo = `${post.title || ''} ${post.summary || ''} ${tagContent} ${categoryContent}`
    let hit = articleInfo.toLowerCase().indexOf(keyword) > -1
    const contentTextList = [getPageContentText(post, page)]
    // console.log('全文搜索缓存', cacheKey, page != null)
    post.results = []
    for (const c of contentTextList) {
      if (!c) {
        continue
      }
      const index = c.toLowerCase().indexOf(keyword)
      if (index > -1) {
        hit = true
        post.results.push(getSearchSnippet(c, keyword, index))
      } else {
        if (post.results.length < 3) {
          post.results.push(getSearchSnippet(c, keyword))
        }
      }
    }
    if (hit) {
      filterPosts.push(post)
    }
  }
  return filterPosts
}

function getSearchSnippet(text, keyword, matchIndex) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim()
  if (!normalized) return ''

  const index =
    typeof matchIndex === 'number'
      ? matchIndex
      : normalized.toLowerCase().indexOf(String(keyword || '').toLowerCase())
  if (index < 0) return normalized.slice(0, 240)

  const start = Math.max(0, index - 80)
  const end = Math.min(normalized.length, index + 160)
  return `${start > 0 ? '...' : ''}${normalized.slice(start, end)}${end < normalized.length ? '...' : ''}`
}

export default Index
