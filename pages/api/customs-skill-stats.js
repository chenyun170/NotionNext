import { readFile } from 'fs/promises'
import path from 'path'

const CLICK_LOG_PATH = path.join(
  process.cwd(),
  'logs',
  'customs-data-skill-clicks.jsonl'
)

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false })
    return
  }

  if (!isAuthorized(req)) {
    res.status(401).json({ ok: false, message: 'Unauthorized' })
    return
  }

  const records = await readClickRecords()
  const visibleRecords = records.filter(record => !isTestRecord(record))
  const summary = buildSummary(visibleRecords, records.length)

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json({
    ok: true,
    ...summary
  })
}

const isAuthorized = req => {
  const expectedToken = process.env.CUSTOMS_STATS_TOKEN || process.env.API_TOKEN
  if (!expectedToken) {
    return true
  }

  const token = String(req.headers['x-stats-token'] || '')
  return token === expectedToken
}

const readClickRecords = async () => {
  try {
    const content = await readFile(CLICK_LOG_PATH, 'utf8')
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        try {
          return JSON.parse(line)
        } catch {
          return null
        }
      })
      .filter(record => record?.event === 'customs_data_skill_click')
  } catch {
    return []
  }
}

const buildSummary = (records, rawTotal) => {
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  const todayKey = formatDay(now)
  const last7DayStart = now - 7 * dayMs
  const last30DayStart = now - 30 * dayMs

  return {
    total: records.length,
    rawTotal,
    filteredTotal: rawTotal - records.length,
    today: records.filter(record => formatDay(record.ts) === todayKey).length,
    last7Days: records.filter(record => Number(record.ts) >= last7DayStart).length,
    last30Days: records.filter(record => Number(record.ts) >= last30DayStart).length,
    topSources: topCounter(records, 'source', 8),
    topSourceGroups: topCounter(records, 'sourceGroup', 8),
    topPaths: topCounter(records, 'path', 8),
    daily: buildDailySeries(records, 14),
    latest: records
      .slice(-10)
      .reverse()
      .map(record => ({
        source: record.source || 'unknown',
        sourceGroup: record.sourceGroup || '',
        path: record.path || '',
        target: record.target || '',
        title: record.title || '',
        ts: Number(record.ts) || 0,
        day: formatDay(record.ts)
      }))
  }
}

const isTestRecord = record => {
  const source = String(record?.source || '').toLowerCase()
  const sourceGroup = String(record?.sourceGroup || '').toLowerCase()
  const ip = String(record?.ip || '').toLowerCase()
  const userAgent = String(record?.userAgent || '').toLowerCase()

  return (
    source.includes('verify') ||
    sourceGroup === 'test' ||
    record?.isLocal === true ||
    ip === '::1' ||
    ip === '127.0.0.1' ||
    ip === '::ffff:127.0.0.1' ||
    ip.includes('localhost') ||
    userAgent.includes('health-check') ||
    userAgent.includes('verify-customs-skill')
  )
}

const topCounter = (records, key, limit) => {
  const counter = new Map()
  records.forEach(record => {
    const value = record?.[key] || 'unknown'
    counter.set(value, (counter.get(value) || 0) + 1)
  })
  return Array.from(counter.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}

const buildDailySeries = (records, days) => {
  const dayMs = 24 * 60 * 60 * 1000
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const series = Array.from({ length: days }).map((_, index) => {
    const date = new Date(today.getTime() - (days - 1 - index) * dayMs)
    return {
      day: formatDay(date.getTime()),
      count: 0
    }
  })
  const seriesMap = new Map(series.map(item => [item.day, item]))

  records.forEach(record => {
    const day = formatDay(record.ts)
    const item = seriesMap.get(day)
    if (item) {
      item.count += 1
    }
  })

  return series
}

const formatDay = value => {
  const date = new Date(Number(value) || value || Date.now())
  if (Number.isNaN(date.getTime())) {
    return ''
  }
  return date.toISOString().slice(0, 10)
}
