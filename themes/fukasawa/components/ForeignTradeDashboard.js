import React, { useState, useEffect, useCallback } from 'react';

/**
 * 外贸工作台组件 V13.6 (单位增强版)
 * 1. 明确标明工具单位 (cm, kg, in, lb)
 * 2. 强化 IP 检测稳定性
 * 3. 极致压缩高度并防止按钮折行
 */
const ForeignTradeDashboard = () => {
  // --- 1. 交互函数 ---
  const handleWaClick = (phone) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  const handleSearch = (kw, type) => {
    if (!kw) return;
    const url = type === 'hs' 
      ? `https://www.hsbianma.com/search?keywords=${encodeURIComponent(kw)}` 
      : `https://www.google.com/search?q=${encodeURIComponent(kw)}`;
    window.open(url, '_blank');
  };

  // --- 2. 状态管理 ---
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.25, loading: true, cached: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '', info: '' });
  const [ipInfo, setIpInfo] = useState({ country: '检测中...' });
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

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  // --- 3. 计算逻辑 ---
  const calculateCBM = useCallback(() => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      const total = (parseFloat(l) * parseFloat(w) * parseFloat(h) / 1000000) * parseFloat(pcs);
      const sug = total < 28 ? `占20GP ${((total/28)*100).toFixed(0)}%` : total < 68 ? '荐40HQ' : '需分柜';
      setCbmResult({ val: total.toFixed(3), sug });
    } else { setCbmResult(null); }
  }, [dims]);

  useEffect(() => { calculateCBM(); }, [calculateCBM]);

  useEffect(() => {
    if (!unitVal) { setUnitRes({ line1: '', line2: '' }); return; }
    const v = parseFloat(unitVal);
    if (isNaN(v)) return;
    if (unitType === 'len') {
      setUnitRes({ line1: `${(v * 2.54).toFixed(1)}cm`, line2: `${(v / 2.54).toFixed(1)}in` });
    } else {
      setUnitRes({ line1: `${(v * 0.45).toFixed(1)}kg`, line2: `${(v / 0.45).toFixed(1)}lb` });
    }
  }, [unitVal, unitType]);

  // --- 4. 环境检测 ---
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        const amapRes = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
        const amapData = await amapRes.json();
        if (amapData.status === '1' && amapData.adcode) {
          setIpInfo({ country: `${amapData.province}${amapData.city} [${amapData.ip}]` });
          const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${amapData.adcode}`);
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
          setIpInfo({ country: `${data.country_name} ${data.city} [${data.ip}]` });
          setWeather({ city: data.city || '海外', temp: '-', info: '正常' });
        } catch (e2) { setIpInfo({ country: '检测超时' }); }
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

  // 时钟刷新
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
        .ft-dashboard-container { margin-bottom: 5px; font-family: system-ui, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; z-index: 9999; pointer-events: none; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; }
        .clock-row { display: flex; gap: 4px; margin-bottom: 5px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 1px 6px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-city { font-size: 0.6rem; color: #64748b; }
        .c-time { font-size: 0.75rem; font-weight: 700; }
        .c-status { font-size: 0.5rem; padding: 0px 2px; border-radius: 2px; margin-left: 2px; }
        .status-pulse { animation: glow 2s infinite; }
        @keyframes glow { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 5px 8px; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.01); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .header-title { font-size: 0.7rem; font-weight: 700; margin-bottom: 3px; display: flex; align-items: center; }
        .header-title::before { content: ''; width: 2px; height: 7px; background: #3b82f6; border-radius: 2px; margin-right: 3px; }
        .std-input { flex: 1; min-width: 0; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.75rem; outline: none; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 4px; }
        .tab-wrap { display: flex; gap: 2px; background: rgba(0,0,0,0.05); padding: 1px; border-radius: 3px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.55rem; padding: 1px 4px; border-radius: 2px; cursor: pointer; color: inherit; opacity: 0.6; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; opacity: 1; }
        :global(body.dark) .tab-btn.active { background: #334155; }
        .wa-btn { background: #25d366; color: white; border: none; padding: 3px 10px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.7rem; white-space: nowrap; flex-shrink: 0; }
        .status-tag { font-size: 0.55rem; padding: 0px 2px; border-radius: 2px; background: rgba(0,0,0,0.05); margin-left: 2px; color: #64748b; }
        .res-box-side { background: rgba(59,130,246,0.03); border: 1px dashed #3b82f6; border-radius: 4px; padding: 2px 5px; font-size: 0.7rem; color: #3b82f6; display: flex; align-items: center; gap: 4px; flex-shrink: 0; cursor: pointer; }
        .card-footer { position: absolute; bottom: 2px; width: calc(100% - 16px); display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: #94a3b8; }
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
        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
          <div className="dash-card">
            <div className="header-title">报价换算 <span className="status-tag">{rateData.cached?'缓存':'实时'}</span></div>
            <div className="input-row">
               <input type="number" className="std-input" placeholder="输入美元($)" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1', fontSize:'0.6rem'}}>⇄</span>
               <div className="std-input" style={{background:'rgba(0,0,0,0.01)', fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cnyVal, '价格')}>{cnyVal} (¥)</div>
            </div>
          </div>
          <div className="dash-card">
            <div className="header-title">WhatsApp</div>
            <div className="input-row">
               <input className="std-input" placeholder="区号+号码 (如: 8613...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick(waPhone)}/>
               <button className="wa-btn" onClick={() => handleWaClick(waPhone)}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'18px'}}>
          <div className="header-title">常用工具
            <div className="tab-wrap">
              {['cbm','unit','search'].map(m => <button key={m} className={`tab-btn ${calcMode===m?'active':''}`} onClick={()=>setCalcMode(m)}>{m==='cbm'?'算柜':m==='unit'?'换算':'搜索'}</button>)}
            </div>
          </div>

          {calcMode === 'cbm' && (
            <div className="input-row">
               <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'2px', flex:1}}>
                  <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
                  <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
                  <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
                  <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
               </div>
               {cbmResult && <div className="res-box-side" onClick={() => copyToClipboard(cbmResult.val, '体积')}>{cbmResult.val}m³</div>}
            </div>
          )}

          {calcMode === 'unit' && (
            <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
              <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                {['len','wt'].map(t => <button key={t} className={`tab-btn ${unitType===t?'active':''}`} onClick={()=>setUnitType(t)}>{t==='len'?'长度':'重量'}</button>)}
              </div>
              <div className="input-row">
                <input type="number" className="std-input" placeholder={unitType==='len'?'输入英寸(in)':'输入磅(lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
                {unitRes.line1 && (
                  <div className="res-box-side" onClick={() => copyToClipboard(`${unitRes.line1}/${unitRes.line2}`, '结果')}>
                    {unitRes.line1} | {unitRes.line2}
                  </div>
                )}
              </div>
            </div>
          )}

          {calcMode === 'search' && (
            <div style={{display:'flex', flexDirection:'column', gap:'2px'}}>
               <div className="tab-wrap" style={{marginLeft:'0', marginRight:'auto'}}>
                  {['hs','google'].map(t => <button key={t} className={`tab-btn ${searchType===t?'active':''}`} onClick={()=>setSearchType(t)}>{t==='hs'?'HS':'谷歌'}</button>)}
               </div>
               <div className="input-row">
                  <input className="std-input" placeholder="关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch(searchKw, searchType)}/>
                  <button className="wa-btn" style={{background:'#3b82f6'}} onClick={() => handleSearch(searchKw, searchType)}>GO</button>
               </div>
            </div>
          )}

          <div className="card-footer">
             <div>{weather.city} {weather.temp}℃</div>
             <div>IP: {ipInfo.country}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
