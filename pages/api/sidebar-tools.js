const DEFAULT_WEATHER = {
  temp: '20',
  text: '多云',
  city: getCityName()
}

const DEFAULT_RATE = '7.03'
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
  const key = process.env.AMAP_WEATHER_KEY
  const cityCode = process.env.SIDEBAR_WEATHER_CITY || '360100'
  const cityName = getCityName()

  if (!key) {
    return { ...DEFAULT_WEATHER, city: cityName }
  }

  try {
    const data = await fetchJsonWithTimeout(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(cityCode)}&key=${encodeURIComponent(key)}`
    )
    const live = data?.lives?.[0]

    if (!live) {
      return { ...DEFAULT_WEATHER, city: cityName }
    }

    return {
      temp: String(live.temperature || DEFAULT_WEATHER.temp),
      text: String(live.weather || DEFAULT_WEATHER.text),
      city: cityName
    }
  } catch (error) {
    console.warn('[sidebar-tools] weather fetch failed', getErrorMessage(error))
    return { ...DEFAULT_WEATHER, city: cityName }
  }
}

function getCityName() {
  const cityName = process.env.SIDEBAR_WEATHER_CITY_NAME

  if (!cityName || cityName.includes('?')) {
    return '南昌'
  }

  return cityName
}

const fetchUsdCnyRate = async () => {
  const key = process.env.EXCHANGE_RATE_API_KEY

  if (!key) {
    return DEFAULT_RATE
  }

  try {
    const data = await fetchJsonWithTimeout(
      `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/USD`
    )
    const rate = Number(data?.conversion_rates?.CNY)

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
