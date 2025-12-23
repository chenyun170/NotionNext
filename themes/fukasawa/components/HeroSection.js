'use client'
import { useState, useEffect } from 'react'

const HeroSection = () => {
  const [weather, setWeather] = useState({ city: '正在定位...', temp: '', desc: '' })
  const AMAP_KEY = "41151e8e6a20ccd713ae595cd3236735"

  useEffect(() => {
    // 1. 获取城市信息
    fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === '1') {
          const cityCode = data.adcode
          const cityName = data.city || '未知城市'
          
          // 2. 根据城市代码获取天气
          fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${cityCode}`)
            .then(res => res.json())
            .then(wData => {
              if (wData.status === '1' && wData.lives.length > 0) {
                const live = wData.lives[0]
                setWeather({
                  city: cityName,
                  temp: live.temperature + '°C',
                  desc: live.weather
                })
              }
            })
        }
      })
      .catch(() => setWeather({ city: '全球', temp: '', desc: '外贸视角' }))
  }, [])

  return (
    <div className="w-full pt-10 pb-16 px-4">
      {/* 顶部定位与状态条 */}
      <div className="flex justify-center items-center gap-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
        <span className="flex items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
          <i className="fas fa-location-dot mr-1.5 text-blue-500"></i>
          {weather.city}
        </span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span>{weather.desc} {weather.temp}</span>
        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
        <span className="text-green-500">System Online</span>
      </div>

      {/* 品牌 Slogan */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
          深耕图灵搜与海关数据 <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-orange-500">
            赋能精准外贸获客
          </span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          为您提供最前沿的客户开发系统实战方案，
          让全球外贸资源触手可及。
        </p>
      </div>

      {/* 极简搜索框 */}
      <div className="mt-10 max-w-2xl mx-auto relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl p-2 flex items-center">
            <i className="fas fa-search ml-4 text-gray-300"></i>
            <input 
              type="text" 
              placeholder="搜索外贸工具、实战教程或海关数据方案..." 
              className="w-full p-4 bg-transparent outline-none text-sm dark:text-white"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl text-sm font-bold transition-all transform active:scale-95">
              立即检索
            </button>
        </div>
      </div>
    </div>
  )
}

export default HeroSection
