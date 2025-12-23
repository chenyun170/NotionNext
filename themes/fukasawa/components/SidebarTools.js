import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm');
  const [times, setTimes] = useState({});
  const [weather, setWeather] = useState({ temp: '--', text: '定位中', city: '..' });
  const [realRate, setRealRate] = useState(7.25);
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // 接口配置
  const AMAP_KEY = "41151e8e6a20ccd713ae595cd3236735";
  const EX_API_URL = "https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD";

  useEffect(() => {
    // 1. 时间刷新逻辑
    const updateTime = () => {
      const zones = [
        { k: 'BJ', t: 'Asia/Shanghai', n: '京' },
        { k: 'LD', t: 'Europe/London', n: '伦' },
        { k: 'NY', t: 'America/New_York', n: '纽' },
        { k: 'LS', t: 'America/Los_Angeles', n: '洛' }
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: z.t }));
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          n: z.n 
        };
      });
      setTimes(res);
    };

    // 2. IP定位 + 天气
    const initLocationWeather = async () => {
      try {
        const ipRes = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`);
        const ipData = await ipRes.json();
        const adcode = ipData.adcode || "110000";
        const cityName = ipData.city || "北京";

        const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=${AMAP_KEY}`);
        const wData = await wRes.json();
        if (wData.lives?.length > 0) {
          const live = wData.lives[0];
          setWeather({ temp: live.temperature, text: live.weather, city: cityName.replace('市', '') });
        }
      } catch (e) { setWeather({ temp: '?', text: 'ERR', city: '未知' }); }
    };

    // 3. 专属汇率接口调用
    const fetchRate = async () => {
      try {
        const res = await fetch(EX_API_URL);
        const data = await res.json();
        if (data.conversion_rates?.CNY) {
          setRealRate(data.conversion_rates.CNY.toFixed(2));
        }
      } catch (e) { console.error("汇率更新失败"); }
    };

    updateTime();
    initLocationWeather();
    fetchRate();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-lg bg-white/60 dark:bg-black/20 backdrop-blur-sm border border-white/20 shadow-sm text-[10px]">
      
      {/* 顶部状态行：定位天气 + 实时汇率 */}
      <div className="flex justify-between items-center px-1 text-[9px] font-bold border-b border-gray-100 dark:border-gray-800 pb-1 text-gray-500">
        <span className="text-blue-600 dark:text-blue-400">📍{weather.city} {weather.text} {weather.temp}°</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-mono">USD/CNY {realRate}</span>
      </div>

      {/* 核心时间网格 */}
      <div className="grid grid-cols-4 gap-1">
        {Object.values(times).map(v => (
          <div key={v.n} className="flex flex-col items-center py-0.5 bg-gray-100/50 dark:bg-white/5 rounded border border-black/5">
            <span className="text-[8px] text-gray-400 scale-90">{v.n}</span>
            <span className="font-mono font-bold text-[10px] leading-none mt-0.5">{v.time}</span>
          </div>
        ))}
      </div>

      {/* 工具切换 */}
      <div className="flex bg-gray-200/50 dark:bg-gray-800 p-0.5 rounded">
        {['cbm', 'ex', 'search'].map(m => (
          <button key={m} onClick={() => setCalcMode(m)} className={`flex-1 py-0.5 text-[9px] font-bold rounded transition-all ${calcMode === m ? 'bg-white dark:bg-gray-600 text-blue-600' : 'text-gray-400'}`}>
            {m === 'cbm' ? '算柜' : m === 'ex' ? '汇率' : '搜索'}
          </button>
        ))}
      </div>

      {/* 操作区：高度精简 */}
      <div className="h-6 mt-0.5 flex items-center">
        {calcMode === 'cbm' && (
          <div className="flex gap-1 items-center w-full">
            <div className="grid grid-cols-4 gap-0.5 flex-grow">
              {['l', 'w', 'h', 'pcs'].map(f => (
                <input key={f} type="number" placeholder={f.toUpperCase()} className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 text-[9px] outline-none" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
              ))}
            </div>
            <div className="text-[9px] font-black text-blue-600 min-w-[50px] text-right">
              {((dims.l*dims.w*dims.h*(dims.pcs||1))/1000000).toFixed(3)}m³
            </div>
          </div>
        )}
        
        {calcMode === 'ex' && (
          <div className="flex gap-2 items-center w-full">
            <input type="number" className="w-1/2 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 outline-none" placeholder="USD$" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <div className="flex-1 text-center font-black text-emerald-600 text-[10px]">
              ≈ ¥ {(exVal * realRate).toFixed(2)}
            </div>
          </div>
        )}

        {calcMode === 'search' && (
          <div className="flex gap-1 w-full">
            <input className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded px-1 h-5 outline-none text-[9px]" placeholder="Google..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            <button onClick={handleSearch} className="px-2 bg-blue-600 text-white rounded h-5 text-[9px] font-bold">GO</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTools;
