import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V11.0 (极致压缩修复版)
 * 1. 调低整体高度 2. 修复换算显示 3. 找回通知标签 4. 优化国旗 IP
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.2, loading: true, cached: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '', info: '' });
  const [ipInfo, setIpInfo] = useState({ country: '检测中', flag: '🌐' });
  
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
      if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  };

  const [usd, setUsd] = usePersistentState('ft_usd', 100);
  const [waPhone, setWaPhone] = usePersistentState('ft_wa_phone', '');
  const [dims, setDims] = usePersistentState('ft_dims', { l: '', w: '', h: '', pcs: '' });
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

  const getFlagEmoji = (code) => {
    if (!code) return '🌐';
    return code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
  };

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();
        if (ipData) {
          setIpInfo({ country: `${ipData.country_name} [${ipData.ip}]`, flag: getFlagEmoji(ipData.country_code) });
          // 天气
          const amapIp = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
          const amapData = await amapIp.json();
          if (amapData.status === '1') {
            const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${amapData.adcode}`);
            const wData = await wRes.json();
            if (wData.lives?.length > 0) {
                const L = wData.lives[0];
                setWeather({ city: L.city, temp: L.temperature, info: L.weather });
            }
          }
        }
      } catch (e) { console.error(e) }
    };
    fetchData();

    // 汇率
    const fetchRate = async () => {
      const now = new Date().getTime();
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const p = JSON.parse(cached);
        if (now - p.timestamp < CACHE_DURATION) {
          setRateData({ val: p.rate, loading: false, cached: true }); return;
        }
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          setRateData({ val: d.conversion_rates.CNY, loading: false, cached: false });
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: d.conversion_rates.CNY, timestamp: now }));
        }
      } catch (e) { setRateData({ val: 7.25, loading: false, cached: false }); }
    };
    fetchRate();
  }, []);

  // 时钟
  useEffect(() => {
    const getStatus = (tz) => {
      const h = new Date(new Date().toLocaleString("en-US", {timeZone: tz})).getHours();
      const d = new Date(new Date().toLocaleString("en-US", {timeZone: tz})).getDay();
      if (d === 0 || d === 6) return { text: '周末', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
      return (h >= 9 && h < 18) ? { text: '工作', color: '#059669', bg: 'rgba(5,150,105,0.1)', pulse: true } : { text: '休市', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
    };
    const update = () => {
      const zones = [{k:'cn',t:'Asia/Shanghai',n:'北京'},{k:'uk',t:'Europe/London',n:'伦敦'},{k:'us',t:'America/New_York',n:'纽约'},{k:'la',t:'America/Los_Angeles',n:'加州'}];
      const res = {};
      zones.forEach(z => {
        res[z.k] = { time: new Date().toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',timeZone:z.t}), status: getStatus(z.t), name:z.n };
      });
      setTimes(res);
    };
    const t = setInterval(update, 1000); update(); return () => clearInterval(t);
  }, []);

  const cnyResult = (usd * rateData.val).toFixed(2);

  const calculateCBM = () => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      const total = (l * w * h / 1000000) * pcs;
      const sug = total < 28 ? `占20GP ${((total/28)*100).toFixed(0)}%` : total < 68 ? '荐40HQ' : '需分柜';
      setCbmResult({ val: total.toFixed(3), sug });
    }
  };
  useEffect(calculateCBM, [dims]);

  const handleSearch = () => {
    if (!searchKw) return;
    window.open(searchType === 'hs' ? `https://www.hsbianma.com/search?keywords=${encodeURIComponent(searchKw)}` : `https://www.google.com/search?q=${encodeURIComponent(searchKw)}`, '_blank');
  };

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 15px; font-family: -apple-system, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; opacity: ${copyTip ? 1 : 0}; z-index: 9999; }
        .clock-row { display: flex; gap: 6px; margin-bottom: 8px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 4px 8px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-city { font-size: 0.7rem; color: #64748b; }
        .c-time { font-size: 0.85rem; font-weight: 700; }
        .c-status { font-size: 0.55rem; padding: 1px 3px; border-radius: 3px; margin-left: 4px; }
        .status-pulse { animation: glow 2s infinite; }
        @keyframes glow { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 10px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.03); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .header-title { font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; }
        .header-title::before { content: ''; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; margin-right: 5px; }
        .std-input { width: 100%; padding: 5px 8px; border: 1px solid #cbd5e1; border-radius: 5px; font-size: 0.85rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 5px; }
        .tab-wrap { display: flex; gap: 3px; background: rgba(0,0,0,0.05); padding: 2px; border-radius: 4px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.65rem; padding: 2px 6px; border-radius: 3px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; }
        .wa-btn { background: #25d366; color: white; border: none; padding: 5px 12px; border-radius: 5px; font-weight: 600; cursor: pointer; font-size: 0.75rem; white-space: nowrap; }
        .status-tag { font-size: 0.6rem; padding: 0px 4px; border-radius: 3px; background: #f1f5f9; color: #64748b; margin-left: 6px; font-weight: 400; }
        :global(body.dark) .status-tag { background: #334155; color: #94a3b8; }
        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; padding: 5px; border-radius: 5px; text-align: center; font-size: 0.8rem; color: #3b82f6; margin-top: 6px; cursor: pointer; }
        .card-footer { position: absolute; bottom: 4px; width: calc(100% - 20px); display: flex; justify-content: space-between; align-items: center; font-size: 0.6rem; color: #94a3b8; }
        @media (max-width: 768px) { .clock-row { display: grid; grid-template-columns: 1fr 1fr; } .main-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span className="c-city">{times[k]?.name}</span>
            <div style={{display:'flex', alignItems:'center'}}>
              <span className="c-time">{times[k]?.time||'--:--'}</span>
              {times[k]?.status && <span className={`c-status ${times[k].status.pulse?'status-pulse':''}`} style={{color:times[k].status.color, background:times[k].status.bg}}>{times[k].status.text}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          <div className="dash-card">
            <div className="header-title">
              报价换算 ($→¥)
              <span className="status-tag">{rateData.loading ? '同步中' : (rateData.cached ? '已缓存' : '实时')}</span>
            </div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cnyResult, '价格')}>{cnyResult}</div>
            </div>
            <div style={{marginTop:'4px', fontSize:'0.65rem', opacity:0.5, textAlign:'right'}}>1$ ≈ {rateData.val}</div>
          </div>

          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="input-row">
               <input className="std-input" placeholder="区号+号码 (如 86138...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'24px'}}>
          <div className="header-title">
            常用工具
            <div className="tab-wrap">
              <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
              <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
              <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'5px'}}>
              <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})} onBlur={calculateCBM}/>
              <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})} onBlur={calculateCBM}/>
            </div>
          )}

          {calcMode === 'unit' && (
            <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
               <div style={{display:'flex', gap:10, justifyContent:'center'}}>
                 <label style={{fontSize:'0.65rem'}}><input type="radio" checked={unitType==='len'} onChange={()=>setUnitType('len')}/> 长度</label>
                 <label style={{fontSize:'0.65rem'}}><input type="radio" checked={unitType==='wt'} onChange={()=>setUnitType('wt')}/> 重量</label>
               </div>
               <input type="number" className="std-input" placeholder="输入数值" value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
            </div>
          )}

          {calcMode === 'search' && (
            <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS编码</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button>
               </div>
               <div className="input-row">
                  <input className="std-input" placeholder="关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
               </div>
            </div>
          )}

          {cbmResult && calcMode === 'cbm' && <div className="res-box" onClick={() => copyToClipboard(cbmResult.val, '体积')}><strong>{cbmResult.val} m³</strong> | {cbmResult.sug}</div>}

          <div className="card-footer">
             <div style={{display:'flex', gap:5}}>
                <span>{weather.city}</span>
                <span>{weather.temp}℃ {weather.info}</span>
             </div>
             <div>
                <span>{ipInfo.flag}</span>
                <span style={{marginLeft:3}}>{ipInfo.country}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
