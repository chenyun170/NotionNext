import { siteConfig } from '@/lib/config'

export const DEFAULT_HOME_POSTS_PER_PAGE = 8

export function getHomePostsPerPage(NOTION_CONFIG) {
  const configured = siteConfig(
    'HOME_POSTS_PER_PAGE',
    DEFAULT_HOME_POSTS_PER_PAGE,
    NOTION_CONFIG
  )
  const parsed = Number.parseInt(configured, 10)

  if (!Number.isFinite(parsed) || parsed < 1) {
    return DEFAULT_HOME_POSTS_PER_PAGE
  }

  return parsed
}
