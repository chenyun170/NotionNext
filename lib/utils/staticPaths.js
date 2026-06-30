const DEFAULT_LIMIT_ENV = 'NEXT_PREBUILD_PATH_LIMIT'

export function limitStaticPaths(paths, envName, fallbackLimit = 0) {
  const safePaths = Array.isArray(paths) ? paths : []

  if (process.env.EXPORT) {
    return safePaths
  }

  const limit = readPathLimit(envName, fallbackLimit)

  if (limit <= 0) {
    return []
  }

  return safePaths.slice(0, limit)
}

export function getStaticFallbackMode() {
  return process.env.EXPORT ? false : 'blocking'
}

export function prioritizeStaticPaths(paths, paramName, preferredValues = []) {
  const safePaths = Array.isArray(paths) ? paths : []
  const priorities = new Map(
    preferredValues.map((value, index) => [String(value), index])
  )

  return safePaths
    .map((path, index) => ({ path, index }))
    .sort((a, b) => {
      const aValue = String(a.path?.params?.[paramName] || '')
      const bValue = String(b.path?.params?.[paramName] || '')
      const aPriority = priorities.has(aValue)
        ? priorities.get(aValue)
        : Number.MAX_SAFE_INTEGER
      const bPriority = priorities.has(bValue)
        ? priorities.get(bValue)
        : Number.MAX_SAFE_INTEGER

      return aPriority - bPriority || a.index - b.index
    })
    .map(item => item.path)
}

function readPathLimit(envName, fallbackLimit) {
  const rawValue = process.env[envName] || process.env[DEFAULT_LIMIT_ENV]
  const value = Number.parseInt(rawValue || '', 10)

  return Number.isFinite(value) && value >= 0 ? value : fallbackLimit
}
