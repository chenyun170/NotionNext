'use client'

import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm');
  const [times, setTimes] = useState({});
  const [weather, setWeather] = useState({ temp: '--', text: '定位中', city: '..' });
  const [realRate, setRealRate] = useState(7.03); 
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [convVal, setConvVal] = useState('');
  const [convType, setConvType] = useState('inch-cm'); 

  // HS 搜索切换：false 为专业库，true 为 Google
  const [hsToGoogle, setHsToGoogle] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const zones = [
        { k: 'BJ', t: 'Asia/Shanghai', n: '中' },
        { k: 'LD', t: 'Europe/London', n: '伦' },
        { k: 'NY', t: 'America/New_York', n: '纽' },
        { k: 'LS', t: 'America/Los_Angeles', n: '洛' }
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: z.t }));
        const hour = date.getHours();
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          n: z.n,
          work: hour >= 9 && hour < 18 
        };
      });
      setTimes(res);
    };

    const fetchSidebarTools = async () => {
      try {
        const res = await fetch('/api/sidebar-tools');
        const data = await res.json();

        if (data?.weather) {
          setWeather(data.weather);
        }

        if (data?.rate) {
          setRealRate(data.rate);
        }
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Sidebar tools API error", e);
        }
        setWeather({ temp: '20', text: '多云', city: '南昌' });
      }
    };

    updateTime();
    fetchSidebarTools();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // 计算逻辑
  const totalCBM = ((dims.l * dims.w * dims.h * (dims.pcs || 1)) / 1000000).toFixed(3);
  const loadingSuggestion = () => {
    if (totalCBM <= 0) return "";
    if (totalCBM <= 28) return `(20GP:${(totalCBM/28*100).toFixed(0)}%)`;
    if (totalCBM <= 68) return `(40HQ:${(totalCBM/68*100).toFixed(0)}%)`;
    return "(超量)";
  };

  const handleSearch = () => {
    if (!searchQuery) return;
    let url = "";
    if (calcMode === 'hs') {
      url = hsToGoogle 
        ? `https://www.google.com/search?q=HS+CODE+${encodeURIComponent(searchQuery)}`
        : `https://www.hsbianma.com/Search?keywords=${encodeURIComponent(searchQuery)}`;
    } else {
      url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 shadow-sm text-[10px]">
      
      {/* 顶部状态：天气与汇率 */}
      <div className="flex justify-between items-center px-1 text-[9px] font-bold border-b border-gray-100 dark:border-gray-800 pb-1 text-gray-500">
        <span className="text-blue-600 dark:text-blue-400">📍{weather.city} {weather.text} {weather.temp}°</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono">USD/CNY {realRate}</span>
      </div>

      {/* 核心时间网格 */}
      <div className="grid grid-cols-4 gap-1">
        {Object.values(times).map(v => (
          <div key={v.n} className="flex flex-col items-center py-0.5 bg-gray-100/50 dark:bg-white/5 rounded border border-black/5">
            <span className={`text-[9px] font-black scale-90 leading-none transition-colors duration-1000 ${v.work ? 'text-emerald-500 animate-breath-green' : 'text-rose-500 animate-breath-red'}`}>
              {v.n}
            </span>
            <span className="font-mono font-bold text-[10px] leading-none mt-0.5">{v.time}</span>
          </div>
        ))}
      </div>

      {/* 功能切换栏 */}
      <div className="flex bg-gray-200/50 dark:bg-gray-800 p-0.5 rounded">
        {['cbm', 'ex', 'conv', 'hs'].map(m => (
          <button key={m} onClick={() => setCalcMode(m)} className={`flex-1 py-0.5 text-[9px] font-bold rounded transition-all ${calcMode === m ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xs' : 'text-gray-400'}`}>
            {m === 'cbm' ? '算柜' : m === 'ex' ? '汇率' : m === 'conv' ? '换算' : 'HS'}
          </button>
        ))}
      </div>

      {/* 操作区 - 严格控制 h-6 高度 */}
      <div className="h-6 mt-0.5 flex items-center">
        {calcMode === 'cbm' && (
          <div className="flex gap-1 items-center w-full relative">
            <div className="grid grid-cols-4 gap-0.5 flex-grow">
              {['l', 'w', 'h', 'pcs'].map(f => (
                <input key={f} type="number" placeholder={f.toUpperCase()} className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 text-[9px] outline-none focus:border-blue-400" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
              ))}
            </div>
            
            {/* 体积结果与 Tooltip 详情提示 */}
            <div className="group relative text-[9px] font-black text-blue-600 min-w-[68px] text-right cursor-help">
              <span className="truncate">
                {totalCBM}m³ <span className="text-[7px] opacity-60 font-normal">{loadingSuggestion()}</span>
              </span>

              {/* 悬停弹出的装箱建议卡片 */}
              <div className="absolute bottom-full right-0 mb-2 w-36 hidden group-hover:block z-[100] animate-in fade-in slide-in-from-bottom-1">
                <div className="bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-lg shadow-xl p-2 text-left">
                  <div className="text-[9px] text-blue-600 font-bold mb-1 border-b border-blue-50 dark:border-gray-700 pb-1">装载容量参考</div>
                  <div className="space-y-1 text-[8px] text-gray-600 dark:text-gray-300 font-medium">
                    <div className="flex justify-between"><span>20GP (28m³):</span><span className={totalCBM > 28 ? 'text-rose-500' : 'text-emerald-500'}>{(totalCBM / 28 * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>40GP (58m³):</span><span className={totalCBM > 58 ? 'text-rose-500' : 'text-emerald-500'}>{(totalCBM / 58 * 100).toFixed(1)}%</span></div>
                    <div className="flex justify-between"><span>40HQ (68m³):</span><span className={totalCBM > 68 ? 'text-rose-500' : 'text-emerald-500'}>{(totalCBM / 68 * 100).toFixed(1)}%</span></div>
                  </div>
                  {/* 小三角 */}
                  <div className="absolute top-full right-3 w-2 h-2 bg-white dark:bg-gray-800 border-r border-b border-blue-100 dark:border-blue-900 rotate-45 -translate-y-1"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {calcMode === 'ex' && (
          <div className="flex gap-2 items-center w-full">
            <input type="number" className="w-1/2 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 outline-none text-[9px]" placeholder="USD$" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <div className="flex-1 text-center font-black text-emerald-600 text-[10px]">≈ ¥ {(exVal * realRate).toFixed(2)}</div>
          </div>
        )}

        {calcMode === 'conv' && (
          <div className="flex gap-1 w-full items-center">
            <select value={convType} onChange={e => setConvType(e.target.value)} className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded h-5 text-[8px] outline-none">
              <option value="inch-cm">吋➔厘</option><option value="lb-kg">磅➔斤</option>
            </select>
            <input type="number" className="w-10 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 outline-none text-[9px]" value={convVal} onChange={e => setConvVal(e.target.value)} placeholder="值"/>
            <div className="flex-1 text-right font-black text-blue-500 text-[9px] truncate">{(parseFloat(convVal) * (convType === 'inch-cm' ? 2.54 : 0.4536) || 0).toFixed(2)}</div>
          </div>
        )}

        {calcMode === 'hs' && (
          <div className="flex gap-1 w-full items-center">
            <input className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 outline-none text-[9px]" placeholder={hsToGoogle ? "Google Code..." : "编码/产品名..."} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            {/* HS/Google 引擎切换开关 */}
            <button 
              onClick={() => setHsToGoogle(!hsToGoogle)} 
              className={`w-5 h-5 rounded flex items-center justify-center transition-colors shadow-sm ${hsToGoogle ? 'bg-orange-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
              title={hsToGoogle ? "切换到专业库查询" : "切换到Google搜索"}
            >
              <span className="text-[8px] font-bold uppercase">{hsToGoogle ? 'G' : 'HS'}</span>
            </button>
            <button onClick={handleSearch} className="px-1.5 bg-blue-600 text-white rounded h-5 text-[8px] font-bold active:scale-95 transition-transform">GO</button>
          </div>
        )}
      </div>

      <style jsx>{`
        .animate-breath-green { animation: breath-green 3s ease-in-out infinite; }
        .animate-breath-red { animation: breath-red 3s ease-in-out infinite; }
        @keyframes breath-green { 0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(16, 185, 129, 0.3); } 50% { opacity: 0.4; text-shadow: 0 0 0px rgba(16, 185, 129, 0); } }
        @keyframes breath-red { 0%, 100% { opacity: 1; text-shadow: 0 0 5px rgba(244, 63, 94, 0.3); } 50% { opacity: 0.4; text-shadow: 0 0 0px rgba(244, 63, 94, 0); } }
      `}</style>
    </div>
  );
};

export default SidebarTools;
