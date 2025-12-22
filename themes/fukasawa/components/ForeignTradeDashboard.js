import React, { useState, useEffect, useCallback } from 'react';

/**
 * Foreign Trade Dashboard V15.5 (Ultra-Compact Edition)
 * Features:
 * 1. Horizontal clock row with live seconds (HH:mm:ss)
 * 2. Greatly reduced vertical padding for a thinner layout
 * 3. 24-hour persistent exchange rate cache
 * 4. Automatic IP/Weather detection with international fallback
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.25, cached: true, sync: false });
  const [weather, setWeather] = useState({ city: '...', temp: '', info: '' });
  const [ipInfo, setIpInfo] = useState({ country: 'Detecting...', flag: '🌐' });
  
  const AMAP_KEY = "41151e8e6a20ccd713ae595cd3236735";

  // Persistent Input State
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
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs');
  const [copyTip, setCopyTip] = useState('');

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`Copied ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  const handleWaClick = () => {
    if (!waPhone) return;
    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleSearch = () => {
    if (!searchKw) return;
    const url = searchType === 'hs' 
      ? `https://www.hsbianma.com/search?keywords=${encodeURIComponent(searchKw)}` 
      : `https://www.google.com/search?q=${encodeURIComponent(searchKw)}`;
    window.open(url, '_blank');
  };

  // 1. IP & Environment Detection
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const amapRes = await fetch(`https://restapi.amap.com/v3/ip?key=${AMAP_KEY}`);
        const amapData = await amapRes.json();
        if (amapData.status === '1' && amapData.adcode) {
          setIpInfo({ country: `${amapData.province}${amapData.city} [${amapData.ip}]`, flag: '🇨🇳' });
          const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${amapData.adcode}`);
          const wData = await wRes.json();
          if (wData.lives?.length > 0) {
            const L = wData.lives[0];
            setWeather({ city: L.city, temp: L.temperature, info: L.weather });
          }
        } else { throw new Error('Retry'); }
      } catch (e) {
        try {
          const res = await fetch('https://ipapi.co/json/');
          const data = await res.json();
          const flag = data.country_code ? data.country_code.toUpperCase().replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397)) : '🌐';
          setIpInfo({ country: `${data.country_name} [${data.ip}]`, flag });
          setWeather({ city: data.city || 'Overseas', temp: '-', info: 'Normal' });
        } catch (e2) { setIpInfo({ country: 'Detection Error', flag: '⚠️' }); }
      }
    };
    fetchEnv();

    const fetchRate = async () => {
      const now = Date.now();
      const CACHE_KEY = 'ft_rate_cache_v2';
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const p = JSON.parse(cached);
        if (now - p.timestamp < 86400000) {
          setRateData({ val: p.rate, cached: true, sync: false }); return;
        }
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          const r = d.conversion_rates.CNY;
          setRateData({ val: r, cached: false, sync: true });
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: r, timestamp: now }));
        }
      } catch (e) { setRateData({ val: 7.25, cached: true, sync: false }); }
    };
    fetchRate();
  }, []);

  // 2. Real-time Clock (HH:mm:ss)
  useEffect(() => {
    const update = () => {
      const zones = [
        {k:'cn',t:'Asia/Shanghai',n:'Beijing'},{k:'uk',t:'Europe/London',n:'London'},
        {k:'us',t:'America/New_York',n:'New York'},{k:'la',t:'America/Los_Angeles',n:'California'}
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: z.t}));
        const h = date.getHours();
        const d = date.getDay();
        const status = (d === 0 || d === 6) ? { text: 'Weekend', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' } 
                     : (h >= 9 && h < 18) ? { text: 'Open', color: '#059669', bg: 'rgba(5,150,105,0.1)', pulse: true } 
                     : { text: 'Closed', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        res[z.k] = { time: date.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), status, name: z.n };
      });
      setTimes(res);
    };
    const t = setInterval(update, 1000); update(); return () => clearInterval(t);
  }, []);

  const cnyVal = (usd * rateData.val).toFixed(2);
  const cbmRes = (parseFloat(dims.l) * parseFloat(dims.w) * parseFloat(dims.h) / 1000000 * parseFloat(dims.pcs)).toFixed(3);
  const unitLine = unitType === 'len' ? `${(parseFloat(unitVal)*2.54).toFixed(1)}cm` : `${(parseFloat(unitVal)*0.45).toFixed(1)}kg`;

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 8px; font-family: system-ui, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; z-index: 9999; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; pointer-events: none; }
        
        /* Compact Horizontal Clock Row */
        .clock-row { display: flex; gap: 4px; margin-bottom: 6px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 3px 8px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 2px rgba(0,0,0,0.02); }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-city { font-size: 0.65rem; color: #64748b; font-weight: 600; }
        .c-time { font-size: 0.85rem; font-weight: 700; font-family: 'Courier New', monospace; letter-spacing: -0.5px; }
        .c-status { font-size: 0.55rem; padding: 1px 3px; border-radius: 3px; margin-left: 4px; }
        .pulse { animation: glow 2s infinite; }
        @keyframes glow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }

        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 6px 10px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        
        .header-title { font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .header-title::before { content: ''; width: 3px; height: 9px; background: #3b82f6; border-radius: 2px; }
        .std-input { flex: 1; min-width: 0; padding: 3px 8px; border: 1px solid #cbd5e1; border-radius: 5px; font-size: 0.8rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 4px; }
        
        .tab-wrap { display: flex; gap: 3px; background: rgba(0,0,0,0.05); padding: 2px; border-radius: 5px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.65rem; padding: 2px 6px; border-radius: 3px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        :global(body.dark) .tab-btn.active { background: #334155; }
        
        .wa-btn { background: #25d366; color: white; border: none; padding: 4px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; }
        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; padding: 4px; border-radius: 5px; text-align: center; font-size: 0.75rem; color: #3b82f6; margin-top: 4px; cursor: pointer; }
        .card-footer { position: absolute; bottom: 3px; width: calc(100% - 20px); display: flex; justify-content: space-between; align-items: center; font-size: 0.6rem; color: #94a3b8; }
        @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } .clock-row { display: grid; grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. Horizontal Clock Row */}
      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span className="c-city">{times[k]?.name}</span>
            <div style={{display:'flex', alignItems:'center'}}>
              <span className="c-time">{times[k]?.time||'--:--:--'}</span>
              {times[k]?.status && (
                <span className={`c-status ${times[k].status.pulse ? 'pulse' : ''}`} style={{color:times[k].status.color, background:times[k].status.bg}}>
                  {times[k].status.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          <div className="dash-card">
            <div className="header-title">Exchange (USD/CNY) <span style={{fontSize:'0.6rem', fontWeight:'400', opacity:0.6}}>{rateData.sync ? '• Live' : '• Cached'}</span></div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1', fontSize:'0.7rem'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cnyVal, 'Price')}>{cnyVal} ¥</div>
            </div>
          </div>
          <div className="dash-card">
            <div className="header-title">WhatsApp Direct</div>
            <div className="input-row">
               <input className="std-input" placeholder="86138..." value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>Chat</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'28px'}}>
          <div className="header-title">Tools
            <div className="tab-wrap">
              {['cbm','unit','search'].map(m => <button key={m} className={`tab-btn ${calcMode===m?'active':''}`} onClick={()=>setCalcMode(m)}>{m.toUpperCase()}</button>)}
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'3px'}}>
              <input placeholder="L" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
              <input placeholder="W" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
              <input placeholder="H" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
              <input placeholder="PCS" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
            </div>
          )}

          {calcMode === 'unit' && (
            <div className="input-row">
               <input type="number" className="std-input" placeholder={unitType==='len'?'Inches':'Lbs'} value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
               <div className="tab-wrap" style={{marginLeft:'4px'}}>
                  <button className={`tab-btn ${unitType==='len'?'active':''}`} onClick={()=>setUnitType('len')}>LEN</button>
                  <button className={`tab-btn ${unitType==='wt'?'active':''}`} onClick={()=>setUnitType('wt')}>WT</button>
               </div>
            </div>
          )}

          {calcMode === 'search' && (
            <div className="input-row">
               <input className="std-input" placeholder="Keyword..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
               <div className="tab-wrap" style={{marginLeft:'4px'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>G</button>
               </div>
            </div>
          )}

          {calcMode === 'cbm' && dims.pcs && <div className="res-box" onClick={() => copyToClipboard(cbmRes, 'Volume')}>{cbmRes} m³</div>}
          {calcMode === 'unit' && unitVal && <div className="res-box" onClick={() => copyToClipboard(unitLine, 'Unit')}>{unitLine}</div>}

          <div className="card-footer">
             <div>{weather.city} {weather.temp}℃ {weather.info}</div>
             <div>{ipInfo.flag} {ipInfo.country}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
