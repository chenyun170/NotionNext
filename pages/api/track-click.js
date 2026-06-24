import { mkdir, appendFile } from 'fs/promises'
import path from 'path'

const ALLOWED_EVENTS = new Set(['customs_data_skill_click'])
const ALLOWED_TARGET_HOSTS = new Set(['www.oraskl.com', 'oraskl.com'])
const ALLOWED_SOURCE_GROUPS = new Set([
  'home',
  'article',
  'search',
  'related',
  'static',
  'topic',
  'brand',
  'tools',
  'test',
  'other'
])
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 20
const rateLimitStore = new Map()
const CLICK_LOG_PATH = path.join(
  process.cwd(),
  'logs',
  'customs-data-skill-clicks.jsonl'
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false })
    return
  }

  const payload = typeof req.body === 'object' ? req.body : {}
  const event = String(payload.event || '')

  if (!ALLOWED_EVENTS.has(event)) {
    res.status(400).json({ ok: false })
    return
  }

  const source = sanitizeValue(payload.source, 80)
  const sourceGroup = sanitizeValue(payload.sourceGroup, 40)
  const pagePath = sanitizeValue(payload.path, 160)
  const target = sanitizeValue(payload.target, 220)
  const title = sanitizeValue(payload.title, 160)
  const clientIp = getClientIp(req)
  const userAgent = sanitizeValue(req.headers['user-agent'], 240)
  const userAgentType = getUserAgentType(userAgent)

  if (!ALLOWED_SOURCE_GROUPS.has(sourceGroup || 'other')) {
    res.status(400).json({ ok: false })
    return
  }

  if (!isAllowedTarget(target)) {
    res.status(400).json({ ok: false })
    return
  }

  if (userAgentType === 'bot') {
    res.status(204).end()
    return
  }

  if (isRateLimited(clientIp, userAgent)) {
    res.status(204).end()
    return
  }

  const record = {
    event,
    source,
    sourceGroup,
    path: pagePath,
    target,
    title,
    ts: Number(payload.ts) || Date.now(),
    isLocal: isLocalIp(clientIp),
    userAgentType
  }

  if (process.env.NODE_ENV === 'development') {
    console.info('[track-click]', record)
  }

  try {
    await mkdir(path.dirname(CLICK_LOG_PATH), { recursive: true })
    await appendFile(CLICK_LOG_PATH, `${JSON.stringify(record)}\n`, 'utf8')
  } catch (error) {
    console.warn('[track-click] failed to write local log', error?.message)
  }

  res.status(204).end()
}

const sanitizeValue = (value, maxLength) => {
  return String(value || '')
    .replace(/[\r\n\t]/g, ' ')
    .slice(0, maxLength)
}

const isAllowedTarget = target => {
  try {
    const url = new URL(target)
    return url.protocol === 'https:' && ALLOWED_TARGET_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

const isRateLimited = (ip, userAgent) => {
  const key = `${ip || 'unknown'}:${userAgent || 'unknown'}`
  const now = Date.now()
  const current = rateLimitStore.get(key)

  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    cleanupRateLimitStore(now)
    rateLimitStore.set(key, { startedAt: now, count: 1 })
    return false
  }

  current.count += 1
  return current.count > RATE_LIMIT_MAX
}

const cleanupRateLimitStore = now => {
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.startedAt > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key)
    }
  }
}

const getClientIp = req => {
  return sanitizeValue(
    String(req.headers['x-forwarded-for'] || '').split(',')[0] ||
      req.socket?.remoteAddress,
    80
  )
}

const isLocalIp = ip => {
  const value = String(ip || '').toLowerCase()
  return (
    value === '::1' ||
    value === '127.0.0.1' ||
    value === '::ffff:127.0.0.1' ||
    value.includes('localhost')
  )
}

const getUserAgentType = userAgent => {
  const value = String(userAgent || '').toLowerCase()

  if (!value) {
    return 'unknown'
  }

  if (value.includes('bot') || value.includes('spider') || value.includes('crawl')) {
    return 'bot'
  }

  if (value.includes('mobile')) {
    return 'mobile'
  }

  return 'desktop'
}
