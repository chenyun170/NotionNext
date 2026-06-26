import { applySchedulePublish } from '@/lib/site/processors/schedule.processor'
import type { SiteData } from '@/lib/site/site.types'

function cleanIds<T extends object>(items: T[]): T[] {
  return items.map(item => {
    const next = { ...item } as T & { id?: unknown }
    delete next.id
    return next
  })
}

function cleanPages<T>(pages: T[], _tagOptions?: unknown[]): T[] {
  return pages
}

export function handleDataBeforeReturn(db: SiteData): SiteData {
  applySchedulePublish(db)

  db.categoryOptions = cleanIds(db.categoryOptions)
  db.customMenu = cleanIds(db.customMenu)

  db.allNavPages = cleanPages(db.allNavPages, db.tagOptions)
  db.allPages = cleanPages(db.allPages, db.tagOptions)
  db.latestPosts = cleanPages(db.latestPosts, db.tagOptions)

  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds

  return db
}
