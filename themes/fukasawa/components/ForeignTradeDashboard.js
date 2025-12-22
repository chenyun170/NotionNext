import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V10.0 (终极旗舰版)
 * 升级点：
 * 1. 紧凑型时钟：消除空白，流式排列
 * 2. 高德实时天气：自动定位访客城市
 * 3. 环境 IP + 自动国旗：根据国家代码自动显示 Emoji 国旗
 * 4. 全屏适配：PC端精致，移动端自动堆叠
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: null, loading: true, cached: false });
  const [weather, setWeather] = useState({ city: '定位中...', info: '', temp: '', loading: true });
  const [ipInfo, setIpInfo] = useState({ country: '...', flag: '🌐', loading: true });
  
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

  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  // 国家代码转国旗 Emoji 函数
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  // 获取 IP 环境及天气
  useEffect(() => {
    const initData = async () => {
      try {
        // 使用 ipapi.co 获取详细的地理位置和国家代码（带国旗支持）
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        
        if (ipData) {
          setIpInfo({ 
            country: `${ipData.country_name} [${ipData.ip}]`, 
            flag: getFlagEmoji(ipData.country_code),
            loading: false 
          });

          // 如果是国内访客，使用高德获取更精准的天气
          const amapIpRes = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
          const amapIpData = await amapIpRes.json();
          
          if (amapIpData.status === '1') {
            const weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${amapIpData.adcode}`);
            const weatherData = await weatherRes.json();
            if (weatherData.status === '1' && weatherData.lives.length > 0) {
              const live = weatherData.lives[0];
              setWeather({ city: live.city, info: live.weather, temp: live.temperature, loading: false });
            }
          }
        }
      } catch (e) {
        setWeather({ city: '定位中', info: '', temp: '', loading: false });
      }
    };
    initData();
  }, []);

  // 时钟逻辑
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

  // 汇率逻辑
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
        
        /* 紧凑流式时钟 */
        .clock-row { display: flex; gap: 8px; margin-bottom: 12px; }
        .clock-item { 
          flex: 1; background: #fff; border-radius: 8px; padding: 8px 12px; 
          border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-city { font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .c-time { font-size: 0.95rem; font-weight: 700; font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.6rem; padding: 1px 4px; border-radius: 4px; margin-left: 6px; }
        .status-pulse { animation: status-glow 2s infinite; }
        @keyframes status-glow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dash-card { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        
        .header-title { font-size: 0.85rem; font-weight: 700; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .header-title::before { content: ''; display: block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; }
        .std-input { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 8px; }
        
        .tab-wrap { display: flex; gap: 4px; background: rgba(0,0,0,0.05); padding: 2px; border-radius: 5px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.75rem; padding: 4px 10px; border-radius: 4px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        :global(body.dark) .tab-btn.active { background: #334155; }

        .wa-btn { background: #25d366; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; white-space: nowrap; }
        
        /* 底部信息栏 */
        .card-footer { 
          position: absolute; bottom: 8px; width: calc(100% - 24px);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 0.65rem; color: #94a3b8;
        }
        .weather-info { display: flex; align-items: center; gap: 6px; color: #64748b; font-weight: 500; }
        .flag-icon { margin-right: 4px; font-size: 0.8rem; }

        @media (max-width: 768px) { 
          .clock-row { display: grid; grid-template-columns: 1fr 1fr; }
          .main-grid { grid-template-columns: 1fr; } 
        }
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
        {/* 左侧：换算 + WhatsApp */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div className="dash-card" style={{paddingBottom:'30px'}}>
            <div className="header-title">报价换算 ($→¥)</div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cny, '价格')}>{cny}</div>
            </div>
            <div style={{marginTop:'8px', fontSize:'0.7rem', opacity:0.5, textAlign:'right'}}>1$ ≈ {rateData.val}</div>
          </div>

          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="input-row">
               <input className="std-input" placeholder="号码 (例: 86138...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        {/* 右侧：工具箱（带国旗 IP 与天气） */}
        <div className="dash-card" style={{paddingBottom:'40px'}}>
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
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS编码</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button>
               </div>
               <div className="input-row">
                  <input className="std-input" placeholder="输入关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
               </div>
            </div>
          )}

          {/* 核心升级：底部天气 + 国旗 IP */}
          <div className="card-footer">
             <div className="weather-info">
                <i className="fas fa-temperature-low text-blue-400"></i>
                <span>{weather.city} {weather.temp}℃ {weather.info}</span>
             </div>
             <div className="ip-info">
                <span className="flag-icon">{ipInfo.flag}</span>
                <span>{ipInfo.country}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
