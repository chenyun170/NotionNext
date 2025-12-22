import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V9.0 (极致布局版)
 * 升级点：1.时钟布局紧凑化 2.集成高德天气 3.搜索/WhatsApp深度优化
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: null, loading: true, cached: false });
  const [weather, setWeather] = useState({ city: '定位中...', info: '', temp: '', loading: true });
  
  const WEATHER_KEY = "41151e8e6a20ccd713ae595cd3236735";

  const usePersistentState = (key, defaultValue) => {
    const [state, setState] = useState(() => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
      }
      return defaultValue;
    });
    useEffect(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(state));
      }
    }, [key, state]);
    return [state, setState];
  };

  const [usd, setUsd] = usePersistentState('ft_usd', 100);
  const [waPhone, setWaPhone] = usePersistentState('ft_wa_phone', '');
  const [dims, setDims] = usePersistentState('ft_dims', { l: '', w: '', h: '', pcs: '' });
  const [cny, setCny] = useState('');
  const [calcMode, setCalcMode] = useState('cbm'); 
  const [searchType, setSearchType] = useState('hs');
  const [searchKw, setSearchKw] = useState('');
  const [cbmResult, setCbmResult] = useState(null);
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [unitRes, setUnitRes] = useState({ line1: '', line2: '' });
  const [copyTip, setCopyTip] = useState('');
  const [ipInfo, setIpInfo] = useState({ country: '...', loading: true });

  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  // 1. 获取 IP 及 天气 (高德 API)
  useEffect(() => {
    const initData = async () => {
      try {
        // 先通过高德 IP 定位接口获取城市代码
        const ipRes = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
        const ipData = await ipRes.json();
        
        if (ipData.status === '1') {
          setIpInfo({ country: `${ipData.province}${ipData.city} [${ipData.adcode}]`, loading: false });
          
          // 获取天气
          const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${ipData.adcode}`);
          const weatherData = await weatherRes.json();
          if (weatherData.status === '1' && weatherData.lives.length > 0) {
            const live = weatherData.lives[0];
            setWeather({ city: live.city, info: live.weather, temp: live.temperature, loading: false });
          }
        }
      } catch (e) {
        setWeather({ city: '获取失败', info: '', temp: '', loading: false });
      }
    };
    initData();
  }, []);

  // 2. 时钟逻辑
  useEffect(() => {
    const getCityStatus = (tz) => {
      try {
        const now = new Date();
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
        const day = localTime.getDay();
        const hour = localTime.getHours();
        if (day === 0 || day === 6) return { text: '周末', color: '#d97706', bg: 'rgba(217,119,6,0.1)' };
        if (hour < 9 || hour >= 18) return { text: '休市', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return { text: '工作', color: '#059669', bg: 'rgba(5,150,105,0.1)', pulse: true };
      } catch (e) { return {}; }
    };
    const updateTime = () => {
      const now = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', hour12: false };
      const zones = [
        { key: 'cn', tz: 'Asia/Shanghai', name: '北京' },
        { key: 'uk', tz: 'Europe/London', name: '伦敦' },
        { key: 'us', tz: 'America/New_York', name: '纽约' },
        { key: 'la', tz: 'America/Los_Angeles', name: '加州' }
      ];
      const newTimes = {};
      zones.forEach(z => {
        newTimes[z.key] = {
          time: now.toLocaleTimeString('en-GB', { ...opts, timeZone: z.tz }),
          status: getCityStatus(z.tz),
          name: z.name
        };
      });
      setTimes(newTimes);
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, []);

  // 3. 汇率逻辑
  useEffect(() => {
    const fetchRate = async () => {
      const now = new Date().getTime();
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const p = JSON.parse(cached);
          if (now - p.timestamp < CACHE_DURATION) {
            setRateData({ val: p.rate, loading: false, cached: true }); return;
          }
        } catch (e) {}
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          const r = d.conversion_rates.CNY;
          setRateData({ val: r, loading: false, cached: false });
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: r, timestamp: now }));
        } else { setRateData({ val: 7.28, loading: false, cached: false }); }
      } catch (e) { setRateData({ val: 7.28, loading: false, cached: false }); }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    if (rateData.val) setCny((usd * rateData.val).toFixed(2));
  }, [usd, rateData.val]);

  const calculateCBM = () => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      const total = (l * w * h / 1000000) * pcs;
      let sug = total < 28 ? `占20GP ${((total/28)*100).toFixed(0)}%` : total < 58 ? '荐40GP' : total < 68 ? '荐40HQ' : '需分柜';
      setCbmResult({ val: total.toFixed(3), sug });
    } else { setCbmResult(null); }
  };
  useEffect(() => { calculateCBM(); }, [dims]);

  const handleSearch = () => {
    if (!searchKw) return;
    window.open(searchType === 'hs' ? `https://www.hsbianma.com/search?keywords=${encodeURIComponent(searchKw)}` : `https://www.google.com/search?q=${encodeURIComponent(searchKw)}`, '_blank');
  };

  const handleWaClick = () => {
    if (!waPhone) return;
    window.open(`https://wa.me/${waPhone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 25px; font-family: -apple-system, sans-serif; color: #334155; position: relative; }
        .copy-toast { position: fixed; top: 15%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; z-index: 9999; }
        
        /* 紧凑时钟布局 */
        .clock-row { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .clock-item { 
          flex: 1; min-width: 140px; background: #fff; border-radius: 8px; padding: 6px 12px; 
          border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; }
        .c-city { font-size: 0.75rem; font-weight: 600; color: #64748b; }
        .c-time { font-size: 0.9rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.55rem; padding: 1px 4px; border-radius: 3px; margin-left: 6px; }
        .status-pulse { animation: status-glow 2s infinite; }
        @keyframes status-glow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .main-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 12px; }
        .dash-card { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        
        .header-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .header-title::before { content: ''; display: block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; }
        .std-input { width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 8px; }
        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 0.85rem; color: #3b82f6; cursor: pointer; margin-top: 8px; }
        
        .tab-wrap { display: flex; gap: 4px; background: rgba(0,0,0,0.05); padding: 2px; border-radius: 4px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.7rem; padding: 2px 8px; border-radius: 3px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        :global(body.dark) .tab-btn.active { background: #334155; }

        .wa-btn { background: #25d366; color: white; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; white-space: nowrap; }
        .weather-bar { position: absolute; bottom: 8px; left: 12px; font-size: 0.7rem; color: #64748b; display: flex; align-items: center; gap: 8px; }
        .ip-bar { position: absolute; bottom: 8px; right: 12px; font-size: 0.6rem; color: #cbd5e1; }
        
        @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } .clock-row { display: grid; grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 紧凑型时钟栏 */}
      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span className="c-city">{times[k]?.name}</span>
            <div style={{display:'flex', alignItems:'center'}}>
              <span className="c-time">{times[k]?.time||'--:--'}</span>
              {times[k]?.status && <span className={`c-status ${times[k].status.pulse ? 'status-pulse' : ''}`} style={{color:times[k].status.color, background:times[k].status.bg}}>{times[k].status.text}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        {/* 左侧：报价 + WhatsApp */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div className="dash-card">
            <div className="header-title">报价换算 ($→¥)</div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cny, '价格')}>{cny}</div>
            </div>
          </div>

          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="input-row">
               <input className="std-input" placeholder="输入号码 (例: 86138...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        {/* 右侧：常用工具（算柜/换算/搜索）+ 天气展示 */}
        <div className="dash-card" style={{paddingBottom:'35px'}}>
          <div className="header-title">
            常用工具
            <div className="tab-wrap">
              <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
              <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
              <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})} onBlur={calculateCBM}/>
            </div>
          )}

          {calcMode === 'search' && (
            <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS编码</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button>
               </div>
               <div className="input-row">
                  <input className="std-input" placeholder="搜索关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
               </div>
            </div>
          )}

          {/* 底部天气与IP栏 */}
          <div className="weather-bar">
             <i className="fas fa-cloud-sun text-blue-400"></i>
             <span>{weather.city}</span>
             <span className="font-bold text-slate-700 dark:text-slate-300">{weather.temp}℃</span>
             <span className="opacity-70">{weather.info}</span>
          </div>
          <div className="ip-bar">环境: {ipInfo.country}</div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
