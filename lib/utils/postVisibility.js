const PLACEHOLDER_TITLE_PATTERNS = [
  /^article template$/i,
  /^untitled$/i,
  /^未命名$/
]

export function isPlaceholderPost(post) {
  const title = String(post?.title || '').trim()
  return PLACEHOLDER_TITLE_PATTERNS.some(pattern => pattern.test(title))
}

export function hasPostSummary(post) {
  return Boolean(String(post?.summary || '').trim())
}

export function isPublicContentPost(post) {
  return Boolean(post) && !isPlaceholderPost(post)
}

export function isHomepageListPost(post) {
  return isPublicContentPost(post) && hasPostSummary(post)
}
