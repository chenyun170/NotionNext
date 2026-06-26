import { idToUuid } from 'notion-utils'
import type { SiteInfo, SiteData } from '../../site.types'

interface NotionRecordMapLike {
  block?: unknown
}

const emptySiteInfo: SiteInfo = {
  title: '',
  description: '',
  pageCover: '',
  icon: '',
  link: ''
}

function getRecordMapBlock(recordMap: unknown): unknown {
  if (typeof recordMap !== 'object' || recordMap === null) return undefined
  return (recordMap as NotionRecordMapLike).block
}

export function normalizeNotionSite(
  recordMap: unknown,
  sitePageId: string,
  from?: string
): SiteData {
  sitePageId = idToUuid(sitePageId)

  // ⬇️ 原 convertNotionToSiteData 内容迁到这里
  // normalize metadata / collection / schema / pages
  // return SiteData（未清洗版）

  return {
    NOTION_CONFIG: {},
    siteInfo: emptySiteInfo,
    notice: null,
    allPages: [],
    allNavPages: [],
    latestPosts: [],
    categoryOptions: [],
    tagOptions: [],
    customNav: [],
    customMenu: [],
    postCount: 0,
    block: getRecordMapBlock(recordMap),
    schema: {},
    rawMetadata: {}
  }
}
