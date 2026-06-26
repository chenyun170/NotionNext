export function cleanIds<T extends { id?: unknown }>(items?: T[]): T[] {
  if (!Array.isArray(items)) return []
  return items.map(item => {
    const next = { ...item }
    delete next.id
    return next
  })
}

export function cleanPages<T>(pages?: T[], _tagOptions?: unknown[]): T[] {
  if (!Array.isArray(pages)) return []
  return pages
}

export function shortenIds<T>(items?: T[]): T[] {
  if (!Array.isArray(items)) return []
  return items
}
