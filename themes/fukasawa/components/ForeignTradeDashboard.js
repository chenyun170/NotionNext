import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V7.5 (全功能巅峰版)
 * 优化重点：
 * 1. [搜索] 增加 HS编码 / 谷歌 胶囊切换按钮，视觉更统一。
 * 2. [WhatsApp] 增加详细占位符提示，优化左右横排布局。
 * 3. [IP] 位置移至“常用工具”内部右下角，保持界面整洁。
 * 4. [深色模式] 完美支持 NotionNext 暗黑切换。
 */
const ForeignTradeDashboard = () => {
  // --- 状态管理 ---
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
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, search
  const [searchType, setSearchType] = useState('hs'); // hs, google
  const [searchKw, setSearchKw] = useState('');
  
  const [cbmResult, setCbmResult] = useState(null);
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [unitRes, setUnitRes] = useState({ line1: '', line2: '' });
  const [copyTip, setCopyTip] = useState('');
  const [ipInfo, setIpInfo] = useState({ country: '...', loading: true });

  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  // --- 核心逻辑 ---

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
        if (day === 0 || day === 6) return { text: '周末', color: '#d97706', bg: 'rgba(217,119,6,0.1)' };
        if (hour < 9 || hour >= 18) return { text: '休市', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return { text: '工作', color: '#059669', bg: 'rgba(5,150,105,0.1)' };
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
        .ft-dashboard-container {
          --dash-card-bg: #fff;
          --dash-text: #334155;
          --dash-border: #f1f5f9;
          --dash-input-bg: #fff;
          --dash-input-border: #cbd5e1;
          margin-bottom: 25px; font-family: -apple-system, sans-serif; position: relative;
        }
        :global(body.dark) .ft-dashboard-container {
          --dash-card-bg: #1e293b;
          --dash-text: #f1f5f9;
          --dash-border: #334155;
          --dash-input-bg: #0f172a;
          --dash-input-border: #475569;
        }
        .copy-toast { position: fixed; top: 15%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; z-index: 9999; }
        .clock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
        .clock-item { background: var(--dash-card-bg); border-radius: 8px; padding: 8px 12px; border: 1px solid var(--dash-border); display: flex; justify-content: space-between; align-items: center; }
        .c-city { font-size: 0.8rem; font-weight: 600; color: var(--dash-text); opacity: 0.7; }
        .c-time { font-size: 0.95rem; font-weight: 700; color: var(--dash-text); font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dash-card { background: var(--dash-card-bg); border-radius: 10px; padding: 12px; border: 1px solid var(--dash-border); box-shadow: 0 2px 4px rgba(0,0,0,0.03); position: relative; }
        .header-title { font-size: 0.85rem; font-weight: 700; color: var(--dash-text); margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
        .header-title::before { content: ''; display: block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; }
        .std-input { width: 100%; padding: 6px 8px; background: var(--dash-input-bg); border: 1px solid var(--dash-input-border); color: var(--dash-text); border-radius: 6px; font-size: 0.9rem; outline: none; }
        .input-row { display: flex; align-items: center; gap: 8px; width: 100%; }
        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; padding: 8px; border-radius: 6px; text-align: center; font-size: 0.85rem; color: #3b82f6; cursor: pointer; margin-top: 8px; }
        .tab-wrap { display: flex; gap: 2px; background: var(--dash-border); padding: 2px; border-radius: 6px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; cursor: pointer; color: var(--dash-text); opacity: 0.6; }
        .tab-btn.active { background: var(--dash-card-bg); color: #3b82f6; font-weight: 600; opacity: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .wa-btn { background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; white-space: nowrap; flex-shrink: 0; }
        .status-tag { font-size: 0.65rem; padding: 1px 5px; border-radius: 4px; background: var(--dash-border); opacity: 0.8; margin-left: auto; }
        .ip-inline { position: absolute; bottom: 8px; right: 10px; font-size: 0.6rem; color: var(--dash-text); opacity: 0.3; }
        @media (max-width: 768px) { .clock-grid { grid-template-columns: 1fr 1fr; } .main-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 时钟栏 */}
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

      <div className="main-grid">
        {/* 左侧工具组 */}
        <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
          {/* 汇率 */}
          <div className="dash-card">
            <div className="header-title">
              报价换算 ($→¥)
              <span className="status-tag">{rateData.loading ? '同步中' : (rateData.cached ? '已缓存' : '实时')}</span>
            </div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'var(--dash-input-border)'}}>⇄</span>
               <div className="std-input" style={{background:'var(--dash-border)', cursor:'pointer', fontWeight:'bold'}} onClick={() => copyToClipboard(cny, '价格')}>{cny}</div>
            </div>
            <div style={{fontSize:'0.7rem', color:'var(--dash-text)', opacity: 0.5, marginTop:'4px', textAlign:'right'}}>1$ ≈ {rateData.val}</div>
          </div>

          {/* WhatsApp */}
          <div className="dash-card">
            <div className="header-title">WhatsApp 直连</div>
            <div className="input-row">
               <input 
                 className="std-input" 
                 placeholder="输入区号和号码 (如 86138...)" 
                 value={waPhone} 
                 onChange={e=>setWaPhone(e.target.value)}
                 onKeyPress={e=>e.key==='Enter'&&handleWaClick()}
               />
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        {/* 右侧工具组 */}
        <div className="dash-card">
          <div className="header-title">
            常用工具
            <div className="tab-wrap">
              <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
              <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
              <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
            </div>
          </div>

          {/* CBM 算柜 */}
          {calcMode === 'cbm' && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})} onBlur={calculateCBM}/>
                <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})} onBlur={calculateCBM}/>
              </div>
              {cbmResult && <div className="res-box" onClick={() => copyToClipboard(cbmResult.val, '体积')}><strong>{cbmResult.val} m³</strong> | {cbmResult.sug}</div>}
            </>
          )}

          {/* 单位换算 */}
          {calcMode === 'unit' && (
            <>
              <div style={{display:'flex', gap:10, justifyContent:'center', marginBottom:8}}>
                 <label style={{fontSize:'0.75rem', color:'var(--dash-text)'}}><input type="radio" checked={unitType==='len'} onChange={()=>setUnitType('len')}/> 长度</label>
                 <label style={{fontSize:'0.75rem', color:'var(--dash-text)'}}><input type="radio" checked={unitType==='wt'} onChange={()=>setUnitType('wt')}/> 重量</label>
              </div>
              <input type="number" className="std-input" placeholder="输入数值..." value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
              {unitRes.line1 && <div className="res-box" onClick={() => copyToClipboard(unitRes.line1, '结果')}>{unitRes.line1}<br/>{unitRes.line2}</div>}
            </>
          )}

          {/* 搜索 Tab - 修复版 */}
          {calcMode === 'search' && (
            <div style={{display:'flex', flexDirection:'column', gap:'8px', marginTop:'4px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS编码</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button>
               </div>
               <div className="input-row">
                  <input 
                    className="std-input" 
                    placeholder={searchType==='hs' ? "输入品名或代码..." : "Google 搜索商机..."} 
                    value={searchKw} 
                    onChange={e=>setSearchKw(e.target.value)} 
                    onKeyPress={e=>e.key==='Enter'&&handleSearch()}
                  />
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
               </div>
            </div>
          )}
          
          <div className="ip-inline">环境: {ipInfo.country}</div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
