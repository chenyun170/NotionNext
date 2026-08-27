'use client'
import { useState } from 'react'
import { useRouter } from 'next/router'

const HeroSection = () => {
  const router = useRouter()
  const [searchKw, setSearchKw] = useState('')
  const [searchType, setSearchType] = useState('site') // site: 站内, hs: HS编码, google: 谷歌

  const handleSearch = () => {
    if (!searchKw.trim()) return
    
    if (searchType === 'hs') {
      window.open(`https://www.hsbianma.com/Search?keywords=${searchKw}`, '_blank')
    } else if (searchType === 'google') {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(searchKw)}`, '_blank')
    } else {
      // 默认站内搜索
      router.push(`/search?s=${encodeURIComponent(searchKw)}`)
    }
  }

  return (
    <section className="w-full pt-4 pb-8 px-4">
      {/* ... 之前的定位显示代码 ... */}

      <div className="max-w-2xl mx-auto relative group">
        <div className="relative bg-white dark:bg-[#1c1917] rounded-2xl border border-stone-100 dark:border-stone-800 shadow-2xl p-2">
          {/* 搜索类型切换标签 */}
          <div className="flex gap-2 mb-2 px-3 border-b border-stone-50 dark:border-stone-800 pb-2">
            {[
              {id: 'site', label: '站内教程'},
              {id: 'hs', label: 'HS编码'},
              {id: 'google', label: '谷歌搜索'}
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setSearchType(tab.id)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-all ${
                  searchType === tab.id ? 'bg-stone-950 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center">
            <input 
              value={searchKw}
              onChange={(e) => setSearchKw(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchType === 'hs' ? "输入产品名称查询海关编码..." : "搜索外贸情报..."} 
              className="w-full px-4 py-2 bg-transparent outline-none text-sm dark:text-white"
            />
            <button 
              onClick={handleSearch}
              className="bg-stone-950 hover:bg-stone-700 text-white px-8 py-2.5 rounded-xl text-xs font-bold transition-all dark:bg-white dark:text-stone-950 dark:hover:bg-stone-300"
            >
              GO
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
