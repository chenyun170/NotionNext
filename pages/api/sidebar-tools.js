const DEFAULT_WEATHER = {
  temp: '--',
  text: '获取失败',
  city: getCityName()
}

// 兜底汇率：接口全部失败时才使用（2026-08 实际值）
const DEFAULT_RATE = '6.76'
const RESPONSE_CACHE_CONTROL = 'public, s-maxage=1800, stale-while-revalidate=3600'
const CACHE_TTL_MS = getPositiveNumber(
  process.env.SIDEBAR_TOOLS_CACHE_TTL_MS,
  10 * 60 * 1000
)
const STALE_TTL_MS = Math.max(
  CACHE_TTL_MS,
  getPositiveNumber(process.env.SIDEBAR_TOOLS_STALE_TTL_MS, 60 * 60 * 1000)
)
const REQUEST_TIMEOUT_MS = getPositiveNumber(
  process.env.SIDEBAR_TOOLS_TIMEOUT_MS,
  2500
)

const sidebarToolsCache = {
  payload: null,
  expiresAt: 0,
  staleAt: 0,
  pending: null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false })
    return
  }

  try {
    const { payload, cacheStatus } = await getSidebarToolsPayload()

    res.setHeader('Cache-Control', RESPONSE_CACHE_CONTROL)
    res.setHeader('X-Sidebar-Tools-Cache', cacheStatus)
    res.status(200).json({
      ok: true,
      weather: payload.weather,
      rate: payload.rate
    })
  } catch (error) {
    console.warn('[sidebar-tools] payload failed', error?.message)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      ok: true,
      weather: DEFAULT_WEATHER,
      rate: DEFAULT_RATE
    })
  }
}

const getSidebarToolsPayload = async () => {
  const now = Date.now()

  if (sidebarToolsCache.payload && now < sidebarToolsCache.expiresAt) {
    return { payload: sidebarToolsCache.payload, cacheStatus: 'HIT' }
  }

  if (sidebarToolsCache.payload && now < sidebarToolsCache.staleAt) {
    refreshSidebarToolsCache().catch(error => {
      console.warn('[sidebar-tools] background refresh failed', error?.message)
    })
    return { payload: sidebarToolsCache.payload, cacheStatus: 'STALE' }
  }

  const payload = await refreshSidebarToolsCache()
  return { payload, cacheStatus: 'MISS' }
}

const refreshSidebarToolsCache = () => {
  if (!sidebarToolsCache.pending) {
    sidebarToolsCache.pending = loadSidebarToolsPayload()
      .then(payload => {
        const now = Date.now()
        sidebarToolsCache.payload = payload
        sidebarToolsCache.expiresAt = now + CACHE_TTL_MS
        sidebarToolsCache.staleAt = now + STALE_TTL_MS
        return payload
      })
      .finally(() => {
        sidebarToolsCache.pending = null
      })
  }

  return Promise.resolve(sidebarToolsCache.pending)
}

const loadSidebarToolsPayload = async () => {
  const [weather, rate] = await Promise.all([fetchWeather(), fetchUsdCnyRate()])

  return {
    weather,
    rate
  }
}

const fetchWeather = async () => {
  // 免费接口：Open-Meteo，无需 API key
  // 城市经纬度可用 SIDEBAR_WEATHER_LAT / SIDEBAR_WEATHER_LON 覆盖，默认南昌
  const lat = process.env.SIDEBAR_WEATHER_LAT || '28.682'
  const lon = process.env.SIDEBAR_WEATHER_LON || '115.858'
  const cityName = getCityName()

  try {
    const data = await fetchJsonWithTimeout(
      `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&current=temperature_2m,weather_code&timezone=Asia%2FShanghai&forecast_days=1`
    )
    const current = data?.current

    if (!current || current.temperature_2m === undefined) {
      return { ...DEFAULT_WEATHER, city: cityName }
    }

    return {
      temp: String(Math.round(current.temperature_2m)),
      text: weatherCodeToText(current.weather_code),
      city: cityName
    }
  } catch (error) {
    console.warn('[sidebar-tools] weather fetch failed', getErrorMessage(error))
    return { ...DEFAULT_WEATHER, city: cityName }
  }
}

// Open-Meteo WMO weather code → 中文描述
function weatherCodeToText(code) {
  const map = {
    0: '晴',
    1: '大部晴',
    2: '多云',
    3: '阴',
    45: '雾',
    48: '雾凇',
    51: '毛毛雨',
    53: '小毛毛雨',
    55: '大毛毛雨',
    56: '冻雨',
    57: '强冻雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨',
    67: '强冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '小阵雨',
    81: '中阵雨',
    82: '强阵雨',
    85: '小阵雪',
    86: '大阵雪',
    95: '雷暴',
    96: '雷暴伴冰雹',
    99: '强雷暴伴冰雹'
  }
  return map[code] || '多云'
}

function getCityName() {
  const cityName = process.env.SIDEBAR_WEATHER_CITY_NAME

  if (!cityName || cityName.includes('?')) {
    return '南昌'
  }

  return cityName
}

const fetchUsdCnyRate = async () => {
  // 免费接口：open.er-api.com，无需 API key
  try {
    const data = await fetchJsonWithTimeout('https://open.er-api.com/v6/latest/USD')
    const rate = Number(data?.rates?.CNY)

    if (!Number.isFinite(rate)) {
      return DEFAULT_RATE
    }

    return rate.toFixed(2)
  } catch (error) {
    console.warn('[sidebar-tools] exchange rate fetch failed', getErrorMessage(error))
    return DEFAULT_RATE
  }
}

const fetchJsonWithTimeout = async url => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } finally {
    clearTimeout(timeout)
  }
}

function getPositiveNumber(value, fallback) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

const getErrorMessage = error => {
  if (error?.name === 'AbortError') {
    return `request timeout after ${REQUEST_TIMEOUT_MS}ms`
  }

  return error?.message || 'unknown error'
}
