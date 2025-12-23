'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * 瘦身紧凑版 HeroSection
 */
const HeroSection = () => {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState('')
  const [weather, setWeather] = useState({ city: '定位中...', temp: '', desc: '' })
  const AMAP_KEY = "41151e8e6a20ccd713ae595cd3236735"

  useEffect(() => {
    const fetchLocationAndWeather = async () => {
      try {
        const ipRes = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`)
        const ipData = await ipRes.json()
        if (ipData.status === '1') {
          const adcode = ipData.adcode
          const cityName = ipData.city || '未知地区'
          const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${adcode}`)
          const wData = await weatherRes.json()
          if (wData.status === '1' && wData.lives?.length > 0) {
            const live = wData.lives[0]
            setWeather({ city: cityName, temp: live.temperature + '°C', desc: live.weather })
          }
        }
      } catch (error) {
        setWeather({ city: '全球视野', temp: '', desc: '外贸视角' })
      }
    }
    fetchLocationAndWeather()
  }, [])

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(`/search?s=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <section className="w-full pt-4 pb-8 px-4">
      {/* 1. 极简状态条 - 缩小边距 */}
      <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
        <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
          <i className="fas fa-location-arrow mr-1 text-blue-500 text-[9px]"></i>
          {weather.city}
        </span>
        <span className="opacity-50">{weather.desc} {weather.temp}</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="flex items-center text-green-500/80">
          <span className="relative flex h-1.5 w-1.5 mr-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
          </span>
          SYSTEM ONLINE
        </span>
      </div>

      {/* 2. 精炼标语 - 显著缩小字号 */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
          深耕图灵搜与海关数据 · <span className="text-blue-600">赋能获客</span>
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-[11px] md:text-xs font-medium">
          最前沿的客户开发系统实战方案，助力中国制造高效出海。
        </p>
      </div>

      {/* 3. 紧凑型搜索框 - 减小高度 */}
      <div className="max-w-xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-xl blur opacity-10"></div>
        <div className="relative bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800 shadow-lg p-1.5 flex items-center">
            <div className="flex items-center w-full px-3">
              <i className="fas fa-search text-gray-300 text-xs mr-2"></i>
              <input 
                type="text" 
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索获客方案..." 
                className="w-full py-1.5 bg-transparent outline-none text-xs md:text-sm dark:text-white"
              />
            </div>
            <button 
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              立即检索
            </button>
        </div>

        {/* 隐藏了快捷热词，以节省垂直高度 */}
      </div>
    </section>
  )
}

export default HeroSection
