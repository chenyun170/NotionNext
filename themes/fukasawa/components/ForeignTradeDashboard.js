import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V6.5 (深色模式适配旗舰版)
 * 特色：
 * 1. [深色模式] 自动识别 NotionNext 主题的暗色开关，支持平滑过渡。
 * 2. [响应式] 完美适配手机端、平板与 PC。
 * 3. [稳定性] 多接口 IP 漂移检测，确保移动端不再显示“未知”。
 */
const ForeignTradeDashboard = () => {
  // --- 状态管理 (保持核心逻辑) ---
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: null, loading: true });
  
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
  const [ipInfo, setIpInfo] = useState({ country: '检测中...', loading: true });

  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  // --- 逻辑处理 ---
  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  useEffect(() => {
    const fetchIP = async () => {
      const endpoints = [
        'https://ipapi.co/json/',
        'https://api.ipify.org?format=json',
        'https://ip.seeip.org/jsonip'
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const data = await res.json();
          const ip = data.ip || data.query || '未知';
          const country = data.country_name || data.country || '海外';
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
        if (day === 0 || day === 6) return { text: '周末', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' };
        if (hour < 9 || hour >= 18) return { text: '休市', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
        return { text: '工作', color: '#10b981', bg: 'rgba(16,185,129,0.1)' };
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
            setRateData({ val: p.rate, loading: false }); return;
          }
        } catch (e) {}
      }
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          const r = d.conversion_rates.CNY;
          setRateData({ val: r, loading: false });
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: r, timestamp: now }));
        } else { setRateData({ val: 7.28, loading: false }); }
      } catch (e) { setRateData({ val: 7.28, loading: false }); }
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
    <div className="ft-dashboard-container" id="trade-tools">
      <style jsx>{`
        /* 变量定义：适配 NotionNext 深色模式 */
        .ft-dashboard-container {
          --dash-bg: #ffffff;
          --dash-card-bg: #ffffff;
          --dash-border: #f1f5f9;
          --dash-text-main: #0f172a;
          --dash-text-sub: #64748b;
          --dash-input-bg: #ffffff;
          --dash-input-border: #cbd5e1;
          --dash-res-bg: #f0f9ff;
          --dash-res-border: #bae6fd;
          --dash-res-text: #0369a1;
          margin-bottom: 25px;
          font-family: -apple-system, sans-serif;
          transition: all 0.3s ease;
        }

        /* 当 body 包含 dark 类时（NotionNext 标准暗号） */
        :global(body.dark) .ft-dashboard-container {
          --dash-bg: transparent;
          --dash-card-bg: #1e293b;
          --dash-border: #334155;
          --dash-text-main: #f1f5f9;
          --dash-text-sub: #94a3b8;
          --dash-input-bg: #0f172a;
          --dash-input-border: #475569;
          --dash-res-bg: rgba(30, 58, 138, 0.3);
          --dash-res-border: #1e40af;
          --dash-res-text: #60a5fa;
        }

        .copy-toast {
          position: fixed; top: 15%; left: 50%; transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.9); color: #fff; padding: 10px 20px; border-radius: 30px;
          font-size: 0.85rem; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; z-index: 9999;
        }

        .monitor-row { margin-bottom: 12px; }
        .clock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .clock-item { 
          background: var(--dash-card-bg); border-radius: 8px; padding: 8px; border: 1px solid var(--dash-border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .c-city { font-size: 0.8rem; font-weight: 600; color: var(--dash-text-sub); }
        .c-time { font-size: 0.95rem; font-weight: 700; color: var(--dash-text-main); font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.6rem; padding: 1px 4px; border-radius: 3px; margin-left: 5px; }

        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .dash-card { background: var(--dash-card-bg); border-radius: 10px; padding: 12px; border: 1px solid var(--dash-border); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .header-title { font-size: 0.85rem; font-weight: 700; color: var(--dash-text-main); display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .title-left::before { content: ''; display: inline-block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; margin-right: 6px; }
        
        .std-input { 
          width: 100%; padding: 8px; background: var(--dash-input-bg); border: 1px solid var(--dash-input-border); 
          color: var(--dash-text-main); border-radius: 6px; font-size: 0.95rem; outline: none; 
        }
        .input-row { display: flex; align-items: center; gap: 8px; }
        .res-box { background: var(--dash-res-bg); border: 1px dashed var(--dash-res-border); padding: 10px; border-radius: 6px; text-align: center; font-size: 0.9rem; color: var(--dash-res-text); cursor: pointer; margin-top: 10px; }
        
        .tab-wrap { display: flex; gap: 3px; background: var(--dash-border); padding: 2px; border-radius: 5px; }
        .tab-btn { border: none; background: none; font-size: 0.75rem; padding: 4px 8px; border-radius: 4px; cursor: pointer; color: var(--dash-text-sub); }
        .tab-btn.active { background: var(--dash-card-bg); color: #3b82f6; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        
        .wa-btn, .search-btn { background: #22c55e; color: white; border: none; padding: 0 18px; border-radius: 6px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; }
        .wa-btn:hover, .search-btn:hover { opacity: 0.9; }
        .search-btn { background: #3b82f6; }
        
        @media (max-width: 768px) {
          .clock-grid { grid-template-columns: repeat(2, 1fr); }
          .main-grid { grid-template-columns: 1fr; }
          .clock-item { padding: 12px; }
          .std-input { padding: 12px; font-size: 1rem; }
          .wa-btn, .search-btn { padding: 12px 20px; }
        }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 时钟显示 */}
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
          {/* 2. 报价换算 */}
          <div className="dash-card">
            <div className="header-title"><span className="title-left">报价换算 ($→¥)</span></div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'var(--dash-input-border)'}}>⇄</span>
               <div className="std-input" style={{background:'var(--dash-border)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cny, '价格')}>{cny}</div>
            </div>
          </div>

          {/* 3. WhatsApp 直连 */}
          <div className="dash-card">
            <div className="header-title"><span className="title-left">WhatsApp 直连</span></div>
            <div className="input-row">
               <input className="std-input" placeholder="号码..." value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        {/* 4. 常用工具箱 */}
        <div className="dash-card">
          <div className="header-title">
            <span className="title-left">常用工具</span>
            <div className="tab-wrap">
              <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
              <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
              <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
            </div>
          </div>

          {calcMode === 'cbm' && (
            <>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
                <input placeholder="长" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
                <input placeholder="宽" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
                <input placeholder="高" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
                <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
              </div>
              {cbmResult && <div className="res-box" onClick={() => copyToClipboard(`${cbmResult.val} m³`, '体积')}><strong>{cbmResult.val} m³</strong> | {cbmResult.sug}</div>}
            </>
          )}

          {calcMode === 'unit' && (
            <>
              <div style={{display:'flex', gap:10, justifyContent:'center', marginBottom:8, color:'var(--dash-text-sub)', fontSize:'0.8rem'}}>
                 <label><input type="radio" checked={unitType==='len'} onChange={()=>setUnitType('len')}/> 长度</label>
                 <label><input type="radio" checked={unitType==='wt'} onChange={()=>setUnitType('wt')}/> 重量</label>
              </div>
              <input type="number" className="std-input" placeholder="输入数值..." value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
              {unitRes.line1 && <div className="res-box" onClick={() => copyToClipboard(unitRes.line1, '结果')}>{unitRes.line1}<br/>{unitRes.line2}</div>}
            </>
          )}

          {calcMode === 'search' && (
            <>
              <div style={{display:'flex', gap:10, justifyContent:'center', marginBottom:8, color:'var(--dash-text-sub)', fontSize:'0.8rem'}}>
                 <label><input type="radio" checked={searchType==='hs'} onChange={()=>setSearchType('hs')}/> HS编码</label>
                 <label><input type="radio" checked={searchType==='google'} onChange={()=>setSearchType('google')}/> 谷歌</label>
              </div>
              <div className="input-row">
                 <input className="std-input" placeholder="搜索关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                 <button className="search-btn" onClick={handleSearch}>GO</button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* 5. 底部信息 */}
      <div style={{textAlign:'right', fontSize:'0.6rem', color:'var(--dash-text-sub)', marginTop:'8px', paddingRight:'5px'}}>
        环境: {ipInfo.country}
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
