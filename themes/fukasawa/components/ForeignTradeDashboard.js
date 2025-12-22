import React, { useState, useEffect, useCallback } from 'react';

const ForeignTradeDashboard = () => {
  // --- 1. 核心状态 ---
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.25, cached: false, sync: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '', info: '' });
  const [ipInfo, setIpInfo] = useState({ code: '', ip: '', country: '检测中' });
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
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs');
  const [copyTip, setCopyTip] = useState('');

  // --- 2. 交互逻辑 ---
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

  // --- 3. 环境检测 (国旗/IP/天气/汇率) ---
  useEffect(() => {
    const initEnv = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setIpInfo({ code: data.country_code?.toLowerCase(), ip: data.ip, country: data.country_name });
        
        // 尝试高德天气
        const amapRes = await fetch(`https://restapi.amap.com/v3/ip?key=${WEATHER_KEY}`);
        const amapData = await amapRes.json();
        if (amapData.status === '1') {
          const wRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${WEATHER_KEY}&city=${amapData.adcode}`);
          const wData = await wRes.json();
          if (wData.lives?.length > 0) {
            setWeather({ city: wData.lives[0].city, temp: wData.lives[0].temperature, info: wData.lives[0].weather });
          }
        }
      } catch (e) { console.error("Env Error"); }
    };
    initEnv();

    const fetchRate = async () => {
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
            setRateData({ val: d.conversion_rates.CNY, cached: false, sync: true });
        }
      } catch (e) { setRateData({ val: 7.25, cached: true, sync: false }); }
    };
    fetchRate();
  }, []);

  // --- 4. 动态时钟 ---
  useEffect(() => {
    const update = () => {
      const zones = [
        {k:'cn',t:'Asia/Shanghai',n:'北京'},{k:'uk',t:'Europe/London',n:'伦敦'},
        {k:'us',t:'America/New_York',n:'纽约'},{k:'la',t:'America/Los_Angeles',n:'加州'}
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: z.t}));
        const h = date.getHours();
        const d = date.getDay();
        const isWork = d !== 0 && d !== 6 && h >= 9 && h < 18;
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'}), 
          name: z.n,
          status: isWork ? '工作' : (d === 0 || d === 6 ? '周末' : '休市'),
          isWork
        };
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
        .ft-dashboard-container { margin-bottom: 12px; font-family: system-ui, sans-serif; }
        .copy-toast { position: fixed; top: 15%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; z-index: 9999; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; }
        
        .clock-row { display: flex; gap: 6px; margin-bottom: 8px; }
        .clock-item { flex: 1; background: #fff; border-radius: 10px; padding: 6px 10px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        
        .c-status { font-size: 0.55rem; padding: 1px 4px; border-radius: 4px; margin-left: 5px; font-weight: 600; }
        .pulse { animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .dash-card { background: #fff; border-radius: 12px; padding: 10px 12px; border: 1px solid #f1f5f9; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }

        .header-title { font-size: 0.8rem; font-weight: 700; margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
        .header-title::before { content: ''; width: 3px; height: 12px; background: #3b82f6; border-radius: 2px; }
        
        .std-input { flex: 1; min-width: 0; padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; background: transparent; color: inherit; transition: all 0.3s; }
        .std-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.1); }
        
        .sync-tag { font-size: 0.6rem; padding: 1px 5px; border-radius: 4px; background: #f1f5f9; color: #64748b; margin-left: auto; }
        .rate-shine { animation: shine 1.5s infinite; color: #10b981; }
        @keyframes shine { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }

        .wa-btn { background: #25d366; color: white; border: none; padding: 6px 15px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 5px; transition: 0.3s; }
        .wa-btn:hover { background: #128c7e; transform: scale(1.02); }

        .tab-wrap { display: flex; gap: 3px; background: rgba(0,0,0,0.05); padding: 2px; border-radius: 6px; margin-left: auto; }
        .tab-btn { border: none; background: none; font-size: 0.65rem; padding: 3px 8px; border-radius: 4px; cursor: pointer; color: inherit; }
        .tab-btn.active { background: #fff; color: #3b82f6; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        :global(body.dark) .tab-btn.active { background: #334155; color: #60a5fa; }

        .res-box { background: rgba(59,130,246,0.05); border: 1px dashed #3b82f6; border-radius: 6px; padding: 4px 10px; font-size: 0.8rem; color: #3b82f6; cursor: pointer; display: flex; align-items: center; gap: 5px; }
        
        .footer-info { position: absolute; bottom: 6px; width: calc(100% - 24px); display: flex; justify-content: space-between; align-items: center; font-size: 0.6rem; color: #94a3b8; }
        .flag-img { width: 16px; height: 11px; object-fit: cover; border-radius: 1px; }

        @media (max-width: 768px) { .main-grid { grid-template-columns: 1fr; } .clock-row { display: grid; grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 动态世界时钟 */}
      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span style={{fontSize:'0.7rem', fontWeight:'600'}}>{times[k]?.name}</span>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:'0.9rem', fontWeight:'800', fontVariantNumeric:'tabular-nums'}}>{times[k]?.time||'--:--'}</div>
              <span className={`c-status ${times[k]?.isWork?'pulse':''}`} style={{background: times[k]?.isWork?'#ecfdf5':'#f1f5f9', color: times[k]?.isWork?'#059669':'#64748b'}}>
                {times[k]?.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
          {/* 报价模块 */}
          <div className="dash-card">
            <div className="header-title">
              报价换算 (USD/CNY)
              <span className={`sync-tag ${rateData.sync?'rate-shine':''}`}>{rateData.sync?'实时同步':'已缓存'}</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1'}}>⇄</span>
               <div className="std-input" style={{fontWeight:'800', background:'rgba(59,130,246,0.02)', cursor:'pointer', color:'#2563eb'}} onClick={() => copyToClipboard(cnyVal, '报价')}>
                 {cnyVal} ¥
               </div>
            </div>
          </div>

          {/* WhatsApp 模块 */}
          <div className="dash-card">
            <div className="header-title">WhatsApp 商务直连</div>
            <div style={{display:'flex', gap:'6px'}}>
               <input className="std-input" placeholder="输入区号号码 (例: 86138...)" value={waPhone} onChange={e=>setWaPhone(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleWaClick()}/>
               <button className="wa-btn" onClick={handleWaClick}>
                  <i className="fab fa-whatsapp"></i> 直达
               </button>
            </div>
          </div>
        </div>

        {/* 常用工具箱 */}
        <div className="dash-card" style={{paddingBottom:'28px'}}>
          <div className="header-title">
            全能工具箱
            <div className="tab-wrap">
              {['cbm','unit','search'].map(m => (
                <button key={m} className={`tab-btn ${calcMode===m?'active':''}`} onClick={()=>setCalcMode(m)}>
                  {m==='cbm'?'算柜':m==='unit'?'换算':'搜索'}
                </button>
              ))}
            </div>
          </div>

          <div style={{minHeight:'40px'}}>
            {calcMode === 'cbm' && (
              <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
                <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'3px', flex:1}}>
                  <input placeholder="长cm" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
                  <input placeholder="宽cm" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
                  <input placeholder="高cm" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
                  <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
                </div>
                {dims.pcs && <div className="res-box" onClick={()=>copyToClipboard(cbmRes,'体积')}>{cbmRes}m³</div>}
              </div>
            )}

            {calcMode === 'unit' && (
              <div style={{display:'flex', gap:'6px', alignItems:'center'}}>
                <input type="number" className="std-input" placeholder={unitType==='len'?'英寸 (in)':'磅 (lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
                <div className="tab-wrap" style={{marginLeft:'0'}}>
                  <button className={`tab-btn ${unitType==='len'?'active':''}`} onClick={()=>setUnitType('len')}>长</button>
                  <button className={`tab-btn ${unitType==='wt'?'active':''}`} onClick={()=>setUnitType('wt')}>重</button>
                </div>
                {unitVal && <div className="res-box" onClick={()=>copyToClipboard(unitLine,'换算')}>{unitLine}</div>}
              </div>
            )}

            {calcMode === 'search' && (
              <div style={{display:'flex', gap:'6px'}}>
                <input className="std-input" placeholder="输入HS编码或产品关键词..." value={searchKw} onChange={e=>setSearchKw(e.target.value)} onKeyPress={e=>e.key==='Enter'&&handleSearch()}/>
                <div className="tab-wrap" style={{marginLeft:'0'}}>
                  <button className={`tab-btn ${searchType==='hs'?'active':''}`} onClick={()=>setSearchType('hs')}>HS</button>
                  <button className={`tab-btn ${searchType==='google'?'active':''}`} onClick={()=>setSearchType('google')}>谷歌</button>
                </div>
                <button className="wa-btn" style={{background:'#3b82f6'}} onClick={handleSearch}>GO</button>
              </div>
            )}
          </div>

          <div className="footer-info">
             <div style={{display:'flex', gap:'8px'}}>
                <span><i className="fas fa-map-marker-alt"></i> {weather.city}</span>
                <span><i className="fas fa-thermometer-half"></i> {weather.temp}℃ {weather.info}</span>
             </div>
             <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                {ipInfo.code && <img className="flag-img" src={`https://flagcdn.com/w20/${ipInfo.code}.png`} alt="flag" />}
                <span>{ipInfo.ip}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
