'use client'

import React, { useState, useEffect } from 'react'

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm')
  const [times, setTimes] = useState({})
  const [weather, setWeather] = useState({ temp: '--', text: '定位中', city: '..' })
  const [realRate, setRealRate] = useState('--')
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' })
  const [exVal, setExVal] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [convVal, setConvVal] = useState('')
  const [convType, setConvType] = useState('inch-cm')

  // HS 搜索切换：false 为专业库，true 为 Google
  const [hsToGoogle, setHsToGoogle] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      const zones = [
        { k: 'BJ', t: 'Asia/Shanghai', n: '北京' },
        { k: 'LD', t: 'Europe/London', n: '伦敦' },
        { k: 'NY', t: 'America/New_York', n: '纽约' },
        { k: 'LS', t: 'America/Los_Angeles', n: '洛杉矶' }
      ]
      const res = {}
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: z.t }))
        const hour = date.getHours()
        res[z.k] = {
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          n: z.n,
          work: hour >= 9 && hour < 18
        }
      })
      setTimes(res)
    }

    const fetchSidebarTools = async () => {
      try {
        const res = await fetch('/api/sidebar-tools')
        const data = await res.json()
        if (data?.weather) setWeather(data.weather)
        if (data?.rate) setRealRate(data.rate)
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Sidebar tools API error', e)
        }
        setWeather({ temp: '--', text: '获取失败', city: '..' })
      }
    }

    updateTime()
    fetchSidebarTools()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  const totalCBM = ((dims.l * dims.w * dims.h * (dims.pcs || 1)) / 1000000).toFixed(3)
  const numericRate = Number(realRate) || 0

  const handleSearch = () => {
    if (!searchQuery) return
    const url =
      calcMode === 'hs'
        ? hsToGoogle
          ? `https://www.google.com/search?q=HS+CODE+${encodeURIComponent(searchQuery)}`
          : `https://www.hsbianma.com/Search?keywords=${encodeURIComponent(searchQuery)}`
        : `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className='flex flex-col gap-3 text-xs'>
      {/* 顶部状态：天气与汇率 */}
      <div className='flex items-center justify-between border-b border-stone-200/80 pb-2 text-[11px] font-medium text-stone-500 dark:border-stone-800 dark:text-stone-400'>
        <span>
          📍 {weather.city} {weather.text} {weather.temp}°C
        </span>
        <span className='font-mono font-semibold text-[#1c5a4a] dark:text-[#6bc4a6]'>
          USD/CNY {realRate}
        </span>
      </div>

      {/* 世界办公时间网格 */}
      <div className='grid grid-cols-4 gap-1.5'>
        {Object.values(times).map(v => (
          <div
            key={v.n}
            className='flex flex-col items-center rounded-lg border border-stone-200/80 bg-stone-50 py-1.5 dark:border-stone-800 dark:bg-stone-800/40'
          >
            <span
              className={`text-[10px] font-semibold ${
                v.work
                  ? 'text-[#1c5a4a] dark:text-[#6bc4a6]'
                  : 'text-stone-400 dark:text-stone-500'
              }`}
            >
              {v.n}
            </span>
            <span className='mt-0.5 font-mono text-xs font-bold tabular-nums text-stone-800 dark:text-stone-200'>
              {v.time}
            </span>
          </div>
        ))}
      </div>

      {/* 功能切换栏 */}
      <div className='grid grid-cols-4 gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800'>
        {[
          { k: 'cbm', label: '算柜' },
          { k: 'ex', label: '汇率' },
          { k: 'conv', label: '换算' },
          { k: 'hs', label: 'HS查询' }
        ].map(m => (
          <button
            key={m.k}
            type='button'
            onClick={() => setCalcMode(m.k)}
            className={`rounded-md py-1.5 text-[11px] font-semibold transition ${
              calcMode === m.k
                ? 'bg-white text-[#1c5a4a] shadow-xs dark:bg-stone-700 dark:text-[#6bc4a6]'
                : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* 操作区 */}
      <div className='min-h-[38px]'>
        {calcMode === 'cbm' && (
          <div className='space-y-2'>
            <div className='grid grid-cols-4 gap-1.5'>
              {[
                { f: 'l', ph: '长cm' },
                { f: 'w', ph: '宽cm' },
                { f: 'h', ph: '高cm' },
                { f: 'pcs', ph: '箱数' }
              ].map(({ f, ph }) => (
                <input
                  key={f}
                  type='number'
                  placeholder={ph}
                  className='h-8 w-full rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus:border-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900'
                  value={dims[f]}
                  onChange={e => setDims({ ...dims, [f]: e.target.value })}
                />
              ))}
            </div>
            <div className='flex items-center justify-between rounded-lg bg-stone-50 px-2.5 py-1.5 text-[11px] dark:bg-stone-800/50'>
              <span className='font-mono font-bold text-stone-800 dark:text-stone-100'>
                合计 {totalCBM} m³
              </span>
              <span className='text-stone-500 dark:text-stone-400'>
                20GP {(totalCBM / 28 * 100).toFixed(0)}% · 40HQ {(totalCBM / 68 * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {calcMode === 'ex' && (
          <div className='flex items-center gap-2'>
            <input
              type='number'
              className='h-8 w-1/2 rounded-lg border border-stone-200 bg-white px-2.5 text-xs outline-none focus:border-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900'
              placeholder='输入 USD'
              value={exVal}
              onChange={e => setExVal(e.target.value)}
            />
            <div className='flex-1 text-right font-mono text-sm font-bold text-[#1c5a4a] dark:text-[#6bc4a6]'>
              ≈ ¥ {(Number(exVal || 0) * numericRate).toFixed(2)}
            </div>
          </div>
        )}

        {calcMode === 'conv' && (
          <div className='flex items-center gap-1.5'>
            <select
              value={convType}
              onChange={e => setConvType(e.target.value)}
              className='h-8 rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none dark:border-stone-700 dark:bg-stone-900'
            >
              <option value='inch-cm'>英寸 → 厘米</option>
              <option value='lb-kg'>磅 → 千克</option>
            </select>
            <input
              type='number'
              className='h-8 w-20 rounded-lg border border-stone-200 bg-white px-2 text-xs outline-none focus:border-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900'
              value={convVal}
              onChange={e => setConvVal(e.target.value)}
              placeholder='数值'
            />
            <div className='flex-1 truncate text-right font-mono text-sm font-bold text-stone-800 dark:text-stone-100'>
              {(parseFloat(convVal) * (convType === 'inch-cm' ? 2.54 : 0.4536) || 0).toFixed(2)}
            </div>
          </div>
        )}

        {calcMode === 'hs' && (
          <div className='flex items-center gap-1.5'>
            <input
              className='h-8 flex-1 rounded-lg border border-stone-200 bg-white px-2.5 text-xs outline-none focus:border-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900'
              placeholder={hsToGoogle ? 'Google 查 HS Code...' : '输入编码或产品名...'}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              type='button'
              onClick={() => setHsToGoogle(!hsToGoogle)}
              className={`h-8 rounded-lg px-2 text-[11px] font-bold transition ${
                hsToGoogle
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300'
              }`}
              title={hsToGoogle ? '切换到海关编码库' : '切换到 Google 搜索'}
            >
              {hsToGoogle ? 'G' : 'HS'}
            </button>
            <button
              type='button'
              onClick={handleSearch}
              className='h-8 rounded-lg bg-[#1c5a4a] px-3 text-[11px] font-bold text-white transition hover:bg-[#14453a]'
            >
              查询
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SidebarTools
