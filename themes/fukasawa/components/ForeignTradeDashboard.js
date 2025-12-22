import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V7.0 (深度定制优化版)
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: null, loading: true, cached: false });
  
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
  const [cbmResult, setCbmResult] = useState(null);
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [unitRes, setUnitRes] = useState({ line1: '', line2: '' });
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs'); 
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

  useEffect(() => {
    const fetchIP = async () => {
      const endpoints = ['https://ipapi.co/json/', 'https://api.ipify.org?format=json'];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          const ip = data.ip || data.query || '未知';
          const country = data.country_name || data.country || '';
          setIpInfo({ country: `${country} [${ip}]`, loading: false });
          return;
        } catch (e) {}
      }
      setIpInfo({ country: '检测超时', loading: false });
    };
    fetchIP();
  }, []);

  useEffect(() => {
    const getCityStatus = (tz) => {
      try {
        const now = new Date();
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz }));
        const day = localTime.getDay();
        const hour = localTime.getHours();
        if (day === 0 || day === 6) return { text: '周末', color: '#d97706', bg: '#fffbeb' };
        if (hour < 9 || hour >= 18) return { text: '休市', color: '#94a3b8', bg: '#f1f5f9' };
        return { text: '工作', color: '#059669', bg: '#ecfdf5' };
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

  useEffect(() => {
    if (!unitVal) { setUnitRes({ line1: '', line2: '' }); return; }
    const v = parseFloat(unitVal);
    if (isNaN(v)) return;
    if (unitType === 'len') {
      setUnitRes({ line1: `${v}in=${(v*2.54).toFixed(1)}cm`, line2: `${v}cm=${(v/2.54).toFixed(1)}in` });
    } else {
      setUnitRes({ line1: `${v}lb=${(v*0.45).toFixed(1)}kg`, line2: `${v}kg=${(v/0.45).toFixed(1)}lb` });
    }
  }, [unitVal, unitType]);

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
        .monitor-row { margin-bottom: 12px; }
        .clock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .clock-item { background: #fff; border-radius: 8px; padding: 8px 12px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .c-city { font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .c-time { font-size: 0.95rem; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.6rem; margin-top: 2px; display: inline-block; padding: 1px 4px; border-radius: 3px; }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dash-card { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #f1f5f9; box-shadow: 0 2px 4px rgba(0,0,0,0.03); position: relative; }
        .header-title { font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
        .header-title::before { content: ''; display: block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; }
        .std-input { width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; }
        .input-row { display: flex; align-items: center; gap: 6px; }
        .res-box { background: #f0f9ff; border: 1px dashed #bae6fd; padding: 6px; border-radius: 6px; text-align: center; font-size: 0.85rem; color: #0369a1; cursor: pointer; margin-top: 8px; }
        .tab-wrap { display: flex; gap: 4px; background: #f1f5f9; padding: 2px; border-radius: 4px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.7rem; padding: 2px 8px; border-radius: 3px; cursor: pointer; color: #64748b; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .wa-row { display: flex; align-items: center; gap: 8px; width: 100%; }
        .wa-btn { background: #25d366; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.75rem; white-space: nowrap; flex-shrink: 0; }
        .status-tag { font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; background: #f1f5f9; color: #64748b; font-weight: normal; margin-left: 4px; }
        .ip-inline { position: absolute; bottom: 6px; right: 10px; font-size: 0.6rem; color: #cbd5e1; pointer-events: none; }
        @media (max-width: 768px) { .clock-grid { grid-template-columns: 1fr 1fr; } .main-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      <div className="monitor-row">
        <div className="clock-grid">
          {['cn','uk','us','la'].map(k => (
            <div className="clock-item" key={k}>
              <div className="c-city">{times[k]?.name}</div>
              <div style={{textAlign:'right'}}>
                <div className="c-time">{times[k]?.time||'--:--'}</div>
                {times[k]?.status && <span className="c-status" style={{color:times[k].status.color, background:times[k].status.bg}}>{times[k].status.text}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          <div className="dash-card">
            <div className="header-title">
              报价换算 ($→¥)
              <span className="status-tag">{rateData.loading ? '正在同步...' : (rateData.cached ? '缓存数据' : '实时数据')}</span>
            </div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1', fontSize:'0.8rem'}}>⇄</span>
               <div className="std-input" style={{background:'#f8fafc', cursor:'pointer'}} onClick={() => copyToClipboard(cny, '价格')}>{cny}</div>
            </div>
            <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:'4px', textAlign:'right'}}>1$ ≈ {rateData.val}</div>
          </div>

          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="wa-row">
               <input 
                 className="std-input" 
                 placeholder="输入区号和号码 (例: 86138...)" 
                 value={waPhone} 
                 onChange={e=>setWaPhone(e.target.value)}
                 onKeyPress={e=>e.key==='Enter'&&handleWaClick()}
                 style={{background:'#f8fafc'}}
               />
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card">
          <div className="header-title">
            常用工具
            <div className="tab-wrap">
              <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
              <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
              <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
            </div>
          </div>

          {calcMode === 'cbm' && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                <input placeholder="长cm" className="std-input" onChange={e=>setDims({...dims,l:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="宽cm" className="std-input" onChange={e=>setDims({...dims,w:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="高cm" className="std-input" onChange={e=>setDims({...dims,h:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="箱数" className="std-input" onChange={e=>setDims({...dims,pcs:e.target.value})} onBlur={calculateCBM}/>
              </div>
              {cbmResult && <div className="res-box" onClick={() => copyToClipboard(cbmResult.val, '体积')}><strong>{cbmResult.val} m³</strong> | {cbmResult.sug}</div>}
            </>
          )}

          {calcMode === 'unit' && (
            <>
              <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:6}}>
                 <label style={{fontSize:'0.75rem'}}><input type="radio" checked={unitType==='len'} onChange={()=>setUnitType('len')}/> 长度</label>
                 <label style={{fontSize:'0.75rem'}}><input type="radio" checked={unitType==='wt'} onChange={()=>setUnitType('wt')}/> 重量</label>
              </div>
              <input type="number" className="std-input" placeholder="输入数值..." value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
              {unitRes.line1 && <div className="res-box" onClick={() => copyToClipboard(unitRes.line1, '结果')}>{unitRes.line1}<br/>{unitRes.line2}</div>}
            </>
          )}

          {calcMode === 'search' && (
            <div className="input-row" style={{marginTop:'10px'}}>
               <input className="std-input" placeholder="搜索品名或代码..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
               <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
            </div>
          )}
          
          <div className="ip-inline">环境: {ipInfo.country}</div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
