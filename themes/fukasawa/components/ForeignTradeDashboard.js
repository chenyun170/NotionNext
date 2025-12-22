import React, { useState, useEffect, useCallback } from 'react';

/**
 * 外贸工作台组件 V13.0 (国旗 IP 稳定版)
 * 1. 恢复自动匹配小国旗功能
 * 2. 修复 IP 显示失效：采用高德 + 国际 IP 接口联动
 * 3. 布局微调：确保 WhatsApp 按钮不折行，输入框自适应
 */
const ForeignTradeDashboard = () => {
  // --- 状态定义 ---
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.25, loading: true, cached: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '', info: '' });
  const [ipInfo, setIpInfo] = useState({ country: '检测中...', flag: '🌐' });
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
  const [copyTip, setCopyTip] = useState('');

  // --- 工具函数 ---
  
  // 国家代码转国旗 Emoji (如 CN -> 🇨🇳)
  const getFlagEmoji = (countryCode) => {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  };

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
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

  const calculateCBM = useCallback(() => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      const total = (parseFloat(l) * parseFloat(w) * parseFloat(h) / 1000000) * parseFloat(pcs);
      const sug = total < 28 ? `占20GP ${((total/28)*100).toFixed(0)}%` : total < 68 ? '荐40HQ' : '需分柜';
      setCbmResult({ val: total.toFixed(3), sug });
    } else {
      setCbmResult(null);
    }
  }, [dims]);

  useEffect(() => { calculateCBM(); }, [calculateCBM]);

  // --- IP 与数据获取逻辑 ---
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        // 1. 优先尝试 ipapi.co 获取国际化 IP 和国家代码 (用于国旗)
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        
        if (data && data.ip) {
          setIpInfo({ 
            country: `${data.country_name} [${data.ip}]`, 
            flag: getFlagEmoji(data.country_code) 
          });

          // 2. 如果是国内，尝试用高德细化天气
          const amapIp = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
          const amapData = await amapIp.json();
          if (amapData.status === '1') {
            const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${amapData.adcode}`);
            const wData = await wRes.json();
            if (wData.lives?.length > 0) {
              const L = wData.lives[0];
              setWeather({ city: L.city, temp: L.temperature, info: L.weather });
            }
          } else {
            // 海外环境则直接显示 ipapi 的城市
            setWeather({ city: data.city || '海外', temp: '-', info: '环境正常' });
          }
        }
      } catch (e) {
        setIpInfo({ country: '检测超时', flag: '⚠️' });
      }
    };
    fetchEnv();

    const fetchRate = async () => {
      const now = Date.now();
      const cached = localStorage.getItem('ft_dashboard_rate_cache');
      if (cached) {
        const p = JSON.parse(cached);
        if (now - p.timestamp < 86400000) {
          setRateData({ val: p.rate, loading: false, cached: true }); return;
        }
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          const rate = d.conversion_rates.CNY;
          setRateData({ val: rate, loading: false, cached: false });
          localStorage.setItem('ft_dashboard_rate_cache', JSON.stringify({ rate, timestamp: now }));
        }
      } catch (e) { setRateData({ val: 7.25, loading: false, cached: false }); }
    };
    fetchRate();
  }, []);

  // --- 时钟逻辑 ---
  useEffect(() => {
    const update = () => {
      const zones = [{k:'cn',t:'Asia/Shanghai',n:'北京'},{k:'uk',t:'Europe/London',n:'伦敦'},{k:'us',t:'America/New_York',n:'纽约'},{k:'la',t:'America/Los_Angeles',n:'加州'}];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: z.t}));
        const h = date.getHours();
        const d = date.getDay();
        const status = (d === 0 || d === 6) ? { text: '周末', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' } 
                     : (h >= 9 && h < 18) ? { text: '工作', color: '#059669', bg: 'rgba(5,150,105,0.1)', pulse: true } 
                     : { text: '休市', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        res[z.k] = { time: date.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'}), status, name: z.n };
      });
      setTimes(res);
    };
    const t = setInterval(update, 1000); update(); return () => clearInterval(t);
  }, []);

  const cnyVal = (usd * rateData.val).toFixed(2);

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 10px; font-family: system-ui, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; z-index: 9999; pointer-events: none; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; }
        .clock-row { display: flex; gap: 4px; margin-bottom: 6px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 2px 6px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-city { font-size: 0.65rem; color: #64748b; }
        .c-time { font-size: 0.75rem; font-weight: 700; }
        .c-status { font-size: 0.5rem; padding: 0px 2px; border-radius: 2px; margin-left: 2px; }
        .status-pulse { animation: glow 2s infinite; }
        @keyframes glow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 6px 10px; border: 1px solid #f1f5f9; box-shadow: 0 1px 3px rgba(0,0,0,0.02); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .header-title { font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; }
        .header-title::before { content: ''; width: 3px; height: 8px; background: #3b82f6; border-radius: 2px; margin-right: 4px; }
        .std-input { flex: 1; min-width: 0; padding: 3px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.8rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 4px; }
        .tab-wrap { display: flex; gap: 2px; background: rgba(0,0,0,0.05); padding: 1px; border-radius: 4px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.6rem; padding: 1px 5px; border-radius: 3px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; }
        :global(body.dark) .tab-btn.active { background: #334155; }
        .wa-btn { background: #25d366; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; }
        .status-tag { font-size: 0.55rem; padding: 0px 3px; border-radius: 2px; background: rgba(0,0,0,0.05); margin-left: 4px; color: #64748b; }
        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; padding: 3px; border-radius: 4px; text-align: center; font-size: 0.7rem; color: #3b82f6; margin-top: 4px; cursor: pointer; }
        .card-footer { position: absolute; bottom: 2px; width: calc(100% - 20px); display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: #94a3b8; }
        @media (max-width: 768px) { .clock-row { display: grid; grid-template-columns: 1fr 1fr; } .main-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 时钟区 */}
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
        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
          <div className="dash-card">
            <div className="header-title">报价换算 <span className="status-tag">{rateData.cached?'已缓存':'实时'}</span></div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1', fontSize:'0.7rem'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cnyVal, '价格')}>{cnyVal}</div>
            </div>
            <div style={{marginTop:'1px', fontSize:'0.55rem', opacity:0.5, textAlign:'right'}}>1$ ≈ {rateData.val}</div>
          </div>
          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="input-row">
               <input className="std-input" placeholder="号码 (例: 86138...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'20px'}}>
          <div className="header-title">常用工具
            <div className="tab-wrap">
              {['cbm','unit','search'].map(m => <button key={m} className={`tab-btn ${calcMode===m?'active':''}`} onClick={()=>setCalcMode(m)}>{m==='cbm'?'算柜':m==='unit'?'换算':'搜索'}</button>)}
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px'}}>
              <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
              <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
              <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
              <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
            </div>
          )}

          {calcMode === 'unit' && (
            <div style={{display:'flex', flexDirection:'column', gap:'3px'}}>
               <div style={{display:'flex', gap:6, justifyContent:'center'}}>
                 {['len','wt'].map(t => <label key={t} style={{fontSize:'0.6rem'}}><input type="radio" checked={unitType===t} onChange={()=>setUnitType(t)}/> {t==='len'?'长度':'重量'}</label>)}
               </div>
               <input type="number" className="std-input" placeholder="输入数值" value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
            </div>
          )}

          {calcMode === 'search' && (
            <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  {['hs','google'].map(t => <button key={t} className={`tab-btn ${searchType===t?'active':''}`} onClick={()=>setSearchType(t)}>{t==='hs'?'HS编码':'谷歌'}</button>)}
               </div>
               <div className="input-row">
                  <input className="std-input" placeholder="输入关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
               </div>
            </div>
          )}

          {cbmResult && calcMode === 'cbm' && <div className="res-box" onClick={() => copyToClipboard(cbmResult.val, '体积')}><strong>{cbmResult.val} m³</strong> | {cbmResult.sug}</div>}

          <div className="card-footer">
             <div style={{display:'flex', gap:3}}>
                <span>{weather.city} {weather.temp}℃ {weather.info}</span>
             </div>
             <div>
                <span>{ipInfo.flag} {ipInfo.country}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
