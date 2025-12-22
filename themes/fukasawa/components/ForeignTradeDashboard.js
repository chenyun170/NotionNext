import React, { useState, useEffect, useCallback } from 'react';

const ForeignTradeDashboard = () => {
  // 核心函数：WA跳转与搜索
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

  // 状态管理
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: 7.25, cached: false });
  const [weather, setWeather] = useState({ city: '定位中', temp: '' });
  const [ipInfo, setIpInfo] = useState({ country: '检测中', code: '', ip: '' }); // 增加code存储国家代码
  const WEATHER_KEY = "41151e8e6a20ccd713ae595cd3236735";

  // 持久化存储
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
  const [unitRes, setUnitRes] = useState({ line1: '', line2: '' });
  const [copyTip, setCopyTip] = useState('');

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  // 1. IP与国旗获取逻辑 (针对代理环境优化)
  useEffect(() => {
    const fetchEnv = async () => {
      try {
        // 使用 ipapi.co 获取，它自带国家代码 (如 CN, US, GB)
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        setIpInfo({ 
          country: data.country_name, 
          code: data.country_code?.toLowerCase(), // 转换为小写供国旗API使用
          ip: data.ip 
        });
        setWeather({ city: data.city || '未知', temp: '-' });
      } catch (e) {
        setIpInfo({ country: '检测失败', code: '', ip: '' });
      }
    };
    fetchEnv();
    
    // 汇率获取
    const fetchRate = async () => {
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') setRateData({ val: d.conversion_rates.CNY, cached: false });
      } catch (e) { setRateData({ val: 7.25, cached: true }); }
    };
    fetchRate();
  }, []);

  // 2. 时钟更新
  useEffect(() => {
    const update = () => {
      const zones = [{k:'cn',t:'Asia/Shanghai',n:'北京'},{k:'uk',t:'Europe/London',n:'伦敦'},{k:'us',t:'America/New_York',n:'纽约'},{k:'la',t:'America/Los_Angeles',n:'加州'}];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", {timeZone: z.t}));
        res[z.k] = { time: date.toLocaleTimeString('en-GB', {hour:'2-digit',minute:'2-digit'}), name: z.n };
      });
      setTimes(res);
    };
    const t = setInterval(update, 1000); update(); return () => clearInterval(t);
  }, []);

  // 3. 换算逻辑
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

  const cnyVal = (usd * rateData.val).toFixed(2);

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 5px; font-family: system-ui, sans-serif; color: #334155; }
        .copy-toast { position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; z-index: 9999; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; }
        .clock-row { display: flex; gap: 4px; margin-bottom: 5px; }
        .clock-item { flex: 1; background: #fff; border-radius: 6px; padding: 1px 6px; border: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        :global(body.dark) .clock-item { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .c-time { font-size: 0.75rem; font-weight: 700; }
        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .dash-card { background: #fff; border-radius: 8px; padding: 5px 8px; border: 1px solid #f1f5f9; position: relative; }
        :global(body.dark) .dash-card { background: #1e293b; border-color: #334155; color: #f1f5f9; }
        .header-title { font-size: 0.7rem; font-weight: 700; margin-bottom: 3px; display: flex; align-items: center; }
        .std-input { flex: 1; min-width: 0; padding: 2px 6px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 0.75rem; background: transparent; color: inherit; }
        .input-row { display: flex; align-items: center; gap: 4px; }
        .wa-btn { background: #25d366; color: white; border: none; padding: 3px 10px; border-radius: 4px; font-weight: 600; cursor: pointer; font-size: 0.7rem; }
        .res-box-side { background: rgba(59,130,246,0.03); border: 1px dashed #3b82f6; border-radius: 4px; padding: 2px 5px; font-size: 0.7rem; color: #3b82f6; cursor: pointer; }
        .card-footer { position: absolute; bottom: 2px; width: calc(100% - 16px); display: flex; justify-content: space-between; align-items: center; font-size: 0.55rem; color: #94a3b8; }
        .flag-icon { width: 14px; height: 10px; margin-right: 4px; border-radius: 1px; object-fit: cover; vertical-align: middle; }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      <div className="clock-row">
        {['cn','uk','us','la'].map(k => (
          <div className="clock-item" key={k}>
            <span style={{fontSize:'0.6rem'}}>{times[k]?.name}</span>
            <span className="c-time">{times[k]?.time||'--:--'}</span>
          </div>
        ))}
      </div>

      <div className="main-grid">
        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
          <div className="dash-card">
            <div className="header-title">报价换算 (USD/CNY)</div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <div className="std-input" style={{fontWeight:'bold', cursor:'pointer'}} onClick={() => copyToClipboard(cnyVal, '价格')}>{cnyVal} ¥</div>
            </div>
          </div>
          <div className="dash-card">
            <div className="header-title">WhatsApp</div>
            <div className="input-row">
               <input className="std-input" placeholder="8613..." value={waPhone} onChange={e=>setWaPhone(e.target.value)} />
               <button className="wa-btn" onClick={() => handleWaClick(waPhone)}>对话</button>
            </div>
          </div>
        </div>

        <div className="dash-card" style={{paddingBottom:'18px'}}>
          <div className="header-title">单位换算
            <div style={{marginLeft:'auto', display:'flex', gap:'2px'}}>
               <button onClick={()=>setUnitType('len')} style={{fontSize:'0.5rem', padding:'1px 3px', background:unitType==='len'?'#3b82f6':'#eee', color:unitType==='len'?'#fff':'#666', border:'none', borderRadius:'2px'}}>长度</button>
               <button onClick={()=>setUnitType('wt')} style={{fontSize:'0.5rem', padding:'1px 3px', background:unitType==='wt'?'#3b82f6':'#eee', color:unitType==='wt'?'#fff':'#666', border:'none', borderRadius:'2px'}}>重量</button>
            </div>
          </div>
          <div className="input-row">
            <input type="number" className="std-input" placeholder={unitType==='len'?'in':'lb'} value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
            {unitRes.line1 && <div className="res-box-side" onClick={() => copyToClipboard(`${unitRes.line1}/${unitRes.line2}`, '结果')}>{unitRes.line1}</div>}
          </div>

          <div className="card-footer">
             <div>{weather.city} {weather.temp}</div>
             <div style={{display:'flex', alignItem:'center'}}>
                {ipInfo.code && <img className="flag-icon" src={`https://flagcdn.com/w20/${ipInfo.code}.png`} alt="flag" />}
                <span>{ipInfo.ip}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
