function isHttpSlug(slug) {
  return typeof slug === 'string' && /^https?:\/\//i.test(slug)
}

function normalizeSlug(slug) {
  if (typeof slug !== 'string') {
    return ''
  }

  return slug.startsWith('/') ? slug.substring(1) : slug
}

function isMenuRow(row) {
  return row?.type?.indexOf('Menu') >= 0
}

export function checkSlugHasNoSlash(row) {
  const slug = normalizeSlug(row?.slug)
  return (slug.match(/\//g) || []).length === 0 && !isHttpSlug(slug) && !isMenuRow(row)
}

export function checkSlugHasOneSlash(row) {
  const slug = normalizeSlug(row?.slug)
  return (slug.match(/\//g) || []).length === 1 && !isHttpSlug(slug) && !isMenuRow(row)
}

export function checkSlugHasMorThanTwoSlash(row) {
  const slug = normalizeSlug(row?.slug)
  return (slug.match(/\//g) || []).length >= 2 && !isHttpSlug(slug) && !isMenuRow(row)
}
