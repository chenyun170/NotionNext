import React, { useState, useEffect, useCallback } from 'react';

const ForeignTradeDashboard = () => {
  // 核心交互函数
  const handleWaClick = () => {
    const phone = localStorage.getItem('ft_wa_phone') || '';
    if (!phone) return;
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  const handleSearch = (kw, type) => {
    if (!kw) return;
    const url = type === 'hs' 
      ? `https://www.hsbianma.com/search?keywords=${encodeURIComponent(kw)}` 
      : `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
    window.open(url, '_blank');
  };

  // 状态管理
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.05, cached: true, sync: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '' });
  const [ipInfo, setIpInfo] = useState({ country: '检测中', code: '', ip: '' });
  const AMAP_KEY = "41151e8e6a20ccd713ae595cd3236735";

  // 持久化 Hook
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

  const [usd, setUsd] = usePersistentState('ft_usd', 1);
  const [waPhone, setWaPhone] = usePersistentState('ft_wa_phone', '');
  const [dims, setDims] = usePersistentState('ft_dims', { l: '', w: '', h: '', pcs: '' });
  const [calcMode, setCalcMode] = useState('cbm'); 
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs');
  const [copyTip, setCopyTip] = useState('');

  // 1. IP 与 24小时汇率逻辑
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setIpInfo({ country: data.country_name, code: data.country_code?.toLowerCase(), ip: data.ip });
      } catch (e) { console.error("IP Error"); }
    };
    fetchEnv();

    const fetchRate = async () => {
      const now = Date.now();
      const CACHE_KEY = 'ft_rate_v16';
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rate, ts } = JSON.parse(cached);
        if (now - ts < 86400000) {
          setRateData({ val: rate, cached: true, sync: false }); return;
        }
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          const r = d.conversion_rates.CNY;
          setRateData({ val: r, cached: false, sync: true });
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: r, ts: now }));
        }
      } catch (e) { setRateData({ val: 7.05, cached: true, sync: false }); }
    };
    fetchRate();
  }, []);

  // 2. 横向秒显时钟逻辑
  useEffect(() => {
    const update = () => {
      const zones = [{k:'cn',t:'Asia/Shanghai',n:'北京'},{k:'uk',t:'Europe/London',n:'伦敦'},{k:'us',t:'America/New_York',n:'纽约'},{k:'la',t:'America/Los_Angeles',n:'加州'}];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: z.t}));
        const h = date.getHours();
        const d = date.getDay();
        const isWork = d !== 0 && d !== 6 && h >= 9 && h < 18;
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit',second:'2-digit'}), 
          name: z.n,
          status: isWork ? '工作' : '休市',
          isWork
        };
      });
      setTimes(res);
    };
    const t = setInterval(update, 1000); update(); return () => clearInterval(t);
  }, []);

  const cnyVal = (usd * rateData.val).toFixed(2);
  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) return (parseFloat(l)*parseFloat(w)*parseFloat(h)/1000000*parseFloat(pcs)).toFixed(3) + ' m³';
    return null;
  };
  const unitRes = unitType === 'len' ? (parseFloat(unitVal)*2.54).toFixed(1)+'cm' : (parseFloat(unitVal)*0.45).toFixed(1)+'kg';

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 5px; font-family: system-ui, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; z-index: 9999; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; }
        .clock-row { display: flex; gap: 4px; margin-bottom: 5px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 1px 6px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-time { font-size: 0.8rem; font-weight: 700; font-family: monospace; }
        .c-status { font-size: 0.55rem; padding: 0px 3px; border-radius: 3px; margin-left: 3px; }
        .pulse { animation: glow 2s infinite; }
        @keyframes glow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 5px 8px; border: 1px solid #f1f5f9; position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .header-title { font-size: 0.75rem; font-weight: 700; margin-bottom: 4px; display: flex; align-items: center; gap: 4px; }
        .header-title::before { content: ''; width: 3px; height: 9px; background: #3b82f6; border-radius: 2px; }
        .status-tag { font-size: 0.55rem; padding: 0px 3px; border-radius: 2px; background: rgba(0,0,0,0.05); color: #64748b; font-weight: normal; }
        .std-input { flex: 1; min-width: 0; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.75rem; outline: none; background: transparent; color: inherit; }
        .tab-btn { border: none; background: none; font-size: 0.6rem; padding: 1px 5px; border-radius: 2px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .wa-btn { background: #25d366; color: white; border: none; padding: 3px 10px; border-radius: 5px; font-weight: 600; cursor: pointer; font-size: 0.75rem; }
        .card-footer { position: absolute; bottom: 2px; width: calc(100% - 16px); display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: #94a3b8; }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 横向秒显时钟 */}
      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span style={{fontSize:'0.6rem'}}>{times[k]?.name}</span>
            <div style={{display:'flex', alignItems:'center'}}>
              <span className="c-time">{times[k]?.time||'--:--:--'}</span>
              {times[k]?.status && (
                <span className={`c-status ${times[k].isWork?'pulse':''}`} style={{color:times[k].isWork?'#059669':'#94a3b8', background:times[k].isWork?'#ecfdf5':'#f1f5f9'}}>
                  {times[k].status}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
          <div className="dash-card">
            <div className="header-title">
              报价换算 (USD/CNY) 
              <span className="status-tag pulse" style={{marginLeft:'auto'}}>{rateData.sync?'● 实时同步':'● 已缓存'}</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:4}}>
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <div className="std-input" style={{background:'rgba(0,0,0,0.02)', fontWeight:'bold', cursor:'pointer'}} onClick={() => {navigator.clipboard.writeText(cnyVal); setCopyTip('已复制报价'); setTimeout(()=>setCopyTip(''),2000)}}>{cnyVal} ¥</div>
            </div>
          </div>
          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div style={{display:'flex', alignItems:'center', gap:4}}>
               <input className="std-input" placeholder="8613..." value={waPhone} onChange={e=>setWaPhone(e.target.value)} />
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'22px'}}>
          <div className="header-title">常用工具
            <div style={{marginLeft:'auto', display:'flex', background:'rgba(0,0,0,0.05)', borderRadius:4, padding:1}}>
              {['cbm','unit','search'].map(m => <button key={m} className={`tab-btn ${calcMode===m?'active':''}`} onClick={()=>setCalcMode(m)}>{m==='cbm'?'算柜':m==='unit'?'换算':'搜索'}</button>)}
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:2}}>
              <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
              <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
              <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
              <input placeholder="箱pcs" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
            </div>
          )}

          {calcMode === 'unit' && (
            <div style={{display:'flex', alignItems:'center', gap:4}}>
               <input type="number" className="std-input" placeholder={unitType==='len'?'英寸(in)':'磅(lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
               <div style={{display:'flex', gap:2}}><button className={`tab-btn ${unitType==='len'?'active':''}`} onClick={()=>setUnitType('len')}>长</button><button className={`tab-btn ${unitType==='wt'?'active':''}`} onClick={()=>setUnitType('wt')}>重</button></div>
            </div>
          )}

          {calcMode === 'search' && (
            <div style={{display:'flex', alignItems:'center', gap:4}}>
               <input className="std-input" placeholder="输入关键词" value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch(searchKw, searchType)}/>
               <div style={{display:'flex', gap:2}}><button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS</button><button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button></div>
               <button className="wa-btn" style={{background:'#3b82f6', marginLeft:2}} onClick={()=>handleSearch(searchKw, searchType)}>GO</button>
            </div>
          )}

          <div style={{marginTop:4, textAlign:'center', fontSize:'0.75rem', color:'#3b82f6'}}>
            {calcMode === 'cbm' && getCbmRes()}
            {calcMode === 'unit' && unitVal && unitRes}
          </div>

          <div className="card-footer">
             <div>MX Mexico</div>
             <div style={{display:'flex', alignItems:'center', gap:3}}>
                {ipInfo.code && <img style={{width:14, height:10}} src={`https://flagcdn.com/w20/${ipInfo.code}.png`} alt="flag" />}
                <span>{ipInfo.ip}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
