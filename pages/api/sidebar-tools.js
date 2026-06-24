const DEFAULT_WEATHER = {
  temp: '20',
  text: '多云',
  city: getCityName()
}

const DEFAULT_RATE = '7.03'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ ok: false })
    return
  }

  const [weather, rate] = await Promise.all([
    fetchWeather(),
    fetchUsdCnyRate()
  ])

  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
  res.status(200).json({
    ok: true,
    weather,
    rate
  })
}

const fetchWeather = async () => {
  const key = process.env.AMAP_WEATHER_KEY
  const cityCode = process.env.SIDEBAR_WEATHER_CITY || '360100'
  const cityName = getCityName()

  if (!key) {
    return { ...DEFAULT_WEATHER, city: cityName }
  }

  try {
    const response = await fetch(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${encodeURIComponent(cityCode)}&key=${encodeURIComponent(key)}`
    )
    const data = await response.json()
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
    console.warn('[sidebar-tools] weather fetch failed', error?.message)
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
    const response = await fetch(
      `https://v6.exchangerate-api.com/v6/${encodeURIComponent(key)}/latest/USD`
    )
    const data = await response.json()
    const rate = Number(data?.conversion_rates?.CNY)

    if (!Number.isFinite(rate)) {
      return DEFAULT_RATE
    }

    return rate.toFixed(2)
  } catch (error) {
    console.warn('[sidebar-tools] exchange rate fetch failed', error?.message)
    return DEFAULT_RATE
  }
}
