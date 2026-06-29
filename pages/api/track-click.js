import { mkdir, appendFile, readFile, stat, writeFile } from 'fs/promises'
import path from 'path'

const ALLOWED_EVENTS = new Set([
  'customs_data_skill_click',
  'outbound_tool_click',
  'site_interaction'
])
const ALLOWED_TARGET_HOSTS = new Set([
  'www.oraskl.com',
  'oraskl.com',
  'h.topeasysoft.com',
  'topeasysoft.com',
  'www.topeasysoft.com'
])
const ALLOWED_SITE_HOSTS = new Set(['www.123170.xyz', '123170.xyz'])
const BLOCKED_INTERNAL_TARGET_PREFIXES = ['/api/', '/_next/', '/js/', '/fonts/']
const ALLOWED_SOURCE_GROUPS = new Set([
  'home',
  'article',
  'search',
  'related',
  'static',
  'topic',
  'brand',
  'tools',
  'activity',
  'lead',
  'cluster',
  'test',
  'other'
])
const ALLOWED_TOOLS = new Set(['', 'oraskl', 'turingsearch', 'dingyiyun', 'wechat'])
const ALLOWED_ACTIONS = new Set([
  '',
  'copy_wechat',
  'dismiss_gift_widget',
  'dismiss_activity_ad'
])
const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX = 20
const CLICK_LOG_MAX_BYTES = Number(process.env.CLICK_LOG_MAX_BYTES || 2 * 1024 * 1024)
const CLICK_LOG_MAX_LINES = Number(process.env.CLICK_LOG_MAX_LINES || 5000)
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
  const tool = sanitizeValue(payload.tool, 60)
  const action = sanitizeValue(payload.action, 80)
  const resolvedSourceGroup = sourceGroup || 'other'
  const clientIp = getClientIp(req)
  const userAgent = sanitizeValue(req.headers['user-agent'], 240)
  const userAgentType = getUserAgentType(userAgent)

  if (!ALLOWED_SOURCE_GROUPS.has(resolvedSourceGroup)) {
    res.status(400).json({ ok: false })
    return
  }

  if (!ALLOWED_TOOLS.has(tool)) {
    res.status(400).json({ ok: false })
    return
  }

  if (event === 'site_interaction' && !ALLOWED_ACTIONS.has(action)) {
    res.status(400).json({ ok: false })
    return
  }

  if (!isAllowedTarget(target)) {
    res.status(400).json({ ok: false })
    return
  }

  if (isHealthCheckEvent(resolvedSourceGroup, source)) {
    res.status(204).end()
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
    sourceGroup: resolvedSourceGroup,
    path: pagePath,
    target: normalizeLoggedTarget(target),
    title,
    tool,
    action,
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
    await trimClickLogIfNeeded()
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

const isHealthCheckEvent = (sourceGroup, source) => {
  return sourceGroup === 'test' || source.startsWith('deploy_check')
}

const isAllowedTarget = target => {
  const value = String(target || '').trim()

  if (isAllowedInternalTarget(value)) {
    return true
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ALLOWED_TARGET_HOSTS.has(url.hostname)
  } catch {
    return false
  }
}

const isAllowedInternalTarget = target => {
  if (!target || target.startsWith('//')) {
    return false
  }

  try {
    const url = target.startsWith('/')
      ? new URL(target, 'https://www.123170.xyz')
      : new URL(target)

    return (
      url.protocol === 'https:' &&
      ALLOWED_SITE_HOSTS.has(url.hostname) &&
      !BLOCKED_INTERNAL_TARGET_PREFIXES.some(prefix =>
        url.pathname.startsWith(prefix)
      )
    )
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

const trimClickLogIfNeeded = async () => {
  const info = await stat(CLICK_LOG_PATH)

  if (info.size <= CLICK_LOG_MAX_BYTES) {
    return
  }

  const content = await readFile(CLICK_LOG_PATH, 'utf8')
  const lines = content.split('\n').filter(Boolean)
  const nextContent = `${lines.slice(-CLICK_LOG_MAX_LINES).join('\n')}\n`

  await writeFile(CLICK_LOG_PATH, nextContent, 'utf8')
}

const normalizeLoggedTarget = target => {
  const value = String(target || '').trim()

  if (!value || value.startsWith('/')) {
    return value.split('?')[0].split('#')[0]
  }

  try {
    const url = new URL(value)
    return `${url.origin}${url.pathname}`
  } catch {
    return ''
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
