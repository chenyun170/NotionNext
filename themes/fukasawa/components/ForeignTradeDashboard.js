import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V6.0 (旗舰版)
 * 核心升级：
 * 1. [新增] 搜索 Tab：支持 HS Code、港口、谷歌 极速查询
 * 2. [体验] 数据持久化：刷新页面后，输入的尺寸、号码、金额不会丢
 * 3. [安全] IP 简易自检：显示当前 IP 归属地 (需 API 支持，这里做模拟演示或基础检测)
 */
const ForeignTradeDashboard = () => {
  // --- 状态管理 ---
  const [times, setTimes] = useState({});
  const [rateData, setRateData] = useState({ val: null, loading: true });
  
  // 持久化状态 (初始值尝试从 localStorage 读取)
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
  
  // 普通状态
  const [cny, setCny] = useState('');
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, search
  const [cbmResult, setCbmResult] = useState(null);
  
  // 单位换算
  const [unitVal, setUnitVal] = useState('');
  const [unitType, setUnitType] = useState('len');
  const [unitRes, setUnitRes] = useState({ line1: '', line2: '' });
  
  // 搜索
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs'); // hs, google
  
  // 提示
  const [copyTip, setCopyTip] = useState('');
  const [ipInfo, setIpInfo] = useState({ country: '...', loading: true });

  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  // --- 逻辑部分 ---

  const copyToClipboard = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopyTip(`已复制 ${label}`);
      setTimeout(() => setCopyTip(''), 2000);
    });
  };

  // 1. 获取 IP (简单版，不阻塞渲染)
  useEffect(() => {
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setIpInfo({ country: data.ip, loading: false })) // 仅显示IP，因免费API查归属地通常有CORS限制，这里仅做基础展示
      .catch(() => setIpInfo({ country: '未知', loading: false }));
  }, []);

  // 2. 时钟
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

  // 3. 汇率
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

  // 4. CBM 计算
  const calculateCBM = () => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      const total = (l * w * h / 1000000) * pcs;
      let sug = '';
      if (total < 28) sug = `占20GP ${((total/28)*100).toFixed(0)}%`;
      else if (total < 58) sug = '荐40GP';
      else if (total < 68) sug = '荐40HQ';
      else sug = '需分柜';
      setCbmResult({ val: total.toFixed(3), sug });
    } else { setCbmResult(null); }
  };
  // 首次加载或 dims 变化时触发计算
  useEffect(() => { calculateCBM(); }, [dims]);

  // 5. 单位换算
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

  // 6. 搜索跳转
  const handleSearch = () => {
    if (!searchKw) return;
    let url = '';
    if (searchType === 'hs') {
      // 使用通用的 HS 编码搜索 (示例: hsbianma.com)
      url = `https://www.hsbianma.com/search?keywords=${encodeURIComponent(searchKw)}`;
    } else {
      // 谷歌搜索
      url = `https://www.google.com/search?q=${encodeURIComponent(searchKw)}`;
    }
    window.open(url, '_blank');
  };

  const handleWaClick = () => {
    if (!waPhone) return;
    window.open(`https://wa.me/${waPhone.replace(/[^0-9]/g, '')}`, '_blank');
  };

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container { margin-bottom: 25px; font-family: -apple-system, sans-serif; color: #334155; position: relative; }
        
        .copy-toast {
          position: absolute; top: -30px; left: 50%; transform: translateX(-50%);
          background: #1e293b; color: #fff; padding: 4px 12px; border-radius: 4px;
          font-size: 0.75rem; opacity: ${copyTip ? 1 : 0}; transition: opacity 0.3s; pointer-events: none; z-index: 10;
        }

        .monitor-row { margin-bottom: 12px; }
        .clock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .clock-item { 
          background: #fff; border-radius: 8px; padding: 8px 12px; 
          border: 1px solid #f1f5f9; box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          display: flex; justify-content: space-between; align-items: center;
        }
        .c-city { font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .c-right { text-align: right; line-height: 1; }
        .c-time { font-size: 0.95rem; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
        .c-status { font-size: 0.6rem; margin-top: 2px; display: inline-block; padding: 1px 4px; border-radius: 3px; }

        .main-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .left-col { display: flex; flex-direction: column; gap: 12px; }
        .right-col { display: flex; flex-direction: column; } 

        .dash-card {
          background: #fff; border-radius: 10px; padding: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
        }
        .h-full { height: 100%; min-height: 140px; }
        
        .header-title {
          font-size: 0.85rem; font-weight: 700; color: #334155; margin-bottom: 8px;
          display: flex; align-items: center; gap: 6px; justify-content: space-between;
        }
        .title-left { display: flex; align-items: center; gap: 6px; }
        .title-left::before { content: ''; display: block; width: 3px; height: 10px; background: #3b82f6; border-radius: 2px; }
        
        .std-input { 
          width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; 
          font-size: 0.9rem; outline: none; transition: 0.2s; 
        }
        .std-input:focus { border-color: #3b82f6; }
        .input-row { display: flex; align-items: center; gap: 6px; }

        .res-box {
          background: #f0f9ff; border: 1px dashed #bae6fd; padding: 6px; border-radius: 6px;
          text-align: center; font-size: 0.85rem; color: #0369a1; cursor: pointer; margin-top: 8px;
        }

        .tab-wrap { display: flex; gap: 2px; background: #f1f5f9; padding: 2px; border-radius: 4px; }
        .tab-btn { border: none; background: none; font-size: 0.7rem; padding: 2px 6px; border-radius: 3px; cursor: pointer; color: #64748b; }
        .tab-btn.active { background: #fff; color: #3b82f6; font-weight: 600; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

        .wa-row { display: flex; gap: 6px; }
        .wa-btn { 
          background: #25d366; color: white; border: none; padding: 0 12px; 
          border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.8rem; white-space: nowrap; 
        }
        .search-btn {
          background: #3b82f6; color: white; border: none; padding: 0 12px; border-radius: 6px; cursor: pointer; font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .clock-grid { grid-template-columns: 1fr 1fr; }
          .main-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="copy-toast">{copyTip}</div>

      {/* 1. 商机监控 */}
      <div className="monitor-row">
        <div className="clock-grid">
          {['cn','uk','us','la'].map(k => (
            <div className="clock-item" key={k}>
              <div className="c-city">{times[k]?.name}</div>
              <div className="c-right">
                <div className="c-time">{times[k]?.time||'--:--'}</div>
                {times[k]?.status && 
                  <span className="c-status" style={{color:times[k].status.color, background:times[k].status.bg}}>
                    {times[k].status.text}
                  </span>
                }
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 功能区 */}
      <div className="main-grid">
        
        {/* 左栏 */}
        <div className="left-col">
          <div className="dash-card">
            <div className="header-title">
              <span className="title-left">报价换算 ($→¥)</span>
            </div>
            <div className="input-row">
               <input type="number" className="std-input" value={usd} onChange={e=>setUsd(e.target.value)} />
               <span style={{color:'#cbd5e1', fontSize:'0.8rem'}}>⇄</span>
               <div className="std-input" style={{background:'#f8fafc', cursor:'pointer'}} onClick={() => copyToClipboard(cny, '价格')}>
                 {cny}
               </div>
            </div>
            <div style={{fontSize:'0.7rem', color:'#94a3b8', marginTop:'4px', display:'flex', justifyContent:'space-between'}}>
               <span>{rateData.loading?'更新...':'● 已更新'}</span>
               <span>1$≈{rateData.val}</span>
            </div>
          </div>

          <div className="dash-card">
            <div className="header-title"><span className="title-left">WhatsApp 直连</span></div>
            <div className="wa-row">
               <input 
                 className="std-input" 
                 placeholder="输入号码..." 
                 value={waPhone} 
                 onChange={e=>setWaPhone(e.target.value)}
                 onKeyPress={e=>e.key==='Enter'&&handleWaClick()}
                 style={{background:'#f8fafc'}}
               />
               <button className="wa-btn" onClick={handleWaClick}>对话</button>
            </div>
          </div>
        </div>

        {/* 右栏 (Tab 升级) */}
        <div className="right-col">
          <div className="dash-card h-full">
            <div className="header-title">
              <span className="title-left">常用工具</span>
              <div className="tab-wrap">
                <button className={`tab-btn ${calcMode==='cbm'?'active':''}`} onClick={()=>setCalcMode('cbm')}>算柜</button>
                <button className={`tab-btn ${calcMode==='unit'?'active':''}`} onClick={()=>setCalcMode('unit')}>换算</button>
                <button className={`tab-btn ${calcMode==='search'?'active':''}`} onClick={()=>setCalcMode('search')}>搜索</button>
              </div>
            </div>

            {/* Tab 1: CBM */}
            {calcMode === 'cbm' && (
              <>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px'}}>
                  <input placeholder="长" className="std-input" value={dims.l} onChange={e=>setDims({...dims,l:e.target.value})}/>
                  <input placeholder="宽" className="std-input" value={dims.w} onChange={e=>setDims({...dims,w:e.target.value})}/>
                  <input placeholder="高" className="std-input" value={dims.h} onChange={e=>setDims({...dims,h:e.target.value})}/>
                  <input placeholder="箱数" className="std-input" value={dims.pcs} onChange={e=>setDims({...dims,pcs:e.target.value})}/>
                </div>
                {cbmResult ? (
                  <div className="res-box" onClick={() => copyToClipboard(`${cbmResult.val} m³`, '体积')}>
                     <strong>{cbmResult.val} m³</strong> | {cbmResult.sug}
                  </div>
                ) : <div style={{textAlign:'center', fontSize:'0.7rem', color:'#cbd5e1', padding:'10px'}}>输入尺寸计算</div>}
              </>
            )}

            {/* Tab 2: 换算 */}
            {calcMode === 'unit' && (
              <>
                <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:6}}>
                   <label style={{fontSize:'0.75rem'}}><input type="radio" checked={unitType==='len'} onChange={()=>setUnitType('len')}/> 长度</label>
                   <label style={{fontSize:'0.75rem'}}><input type="radio" checked={unitType==='wt'} onChange={()=>setUnitType('wt')}/> 重量</label>
                </div>
                <input type="number" className="std-input" placeholder="输入数值..." value={unitVal} onChange={e=>setUnitVal(e.target.value)} />
                {unitRes.line1 ? (
                   <div className="res-box" style={{textAlign:'left', paddingLeft:12}} onClick={() => copyToClipboard(unitRes.line1, '结果')}>
                      <div>{unitRes.line1}</div>
                      <div>{unitRes.line2}</div>
                   </div>
                ) : <div style={{textAlign:'center', fontSize:'0.7rem', color:'#cbd5e1', padding:'10px'}}>输入数字换算</div>}
              </>
            )}

            {/* Tab 3: 搜索 (新增) */}
            {calcMode === 'search' && (
              <>
                <div style={{display:'flex', gap:8, justifyContent:'center', marginBottom:6}}>
                   <label style={{fontSize:'0.75rem'}}><input type="radio" checked={searchType==='hs'} onChange={()=>setSearchType('hs')}/> HS编码</label>
                   <label style={{fontSize:'0.75rem'}}><input type="radio" checked={searchType==='google'} onChange={()=>setSearchType('google')}/> 谷歌</label>
                </div>
                <div className="wa-row">
                   <input 
                     className="std-input" 
                     placeholder={searchType==='hs' ? "输入品名/代码..." : "Google 搜索..."}
                     value={searchKw} 
                     onChange={e=>setSearchKw(e.target.value)}
                     onKeyPress={e=>e.key==='Enter'&&handleSearch()}
                   />
                   <button className="search-btn" onClick={handleSearch}>GO</button>
                </div>
                <div style={{textAlign:'center', fontSize:'0.7rem', color:'#cbd5e1', marginTop:'8px'}}>
                  {searchType==='hs' ? '直达 HS 编码库' : '外贸人必备搜索'}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
      
      {/* 底部 IP 显示 */}
      <div style={{textAlign:'right', fontSize:'0.65rem', color:'#cbd5e1', marginTop:'-15px', marginRight:'5px'}}>
         您的 IP: {ipInfo.country} {ipInfo.loading?'...':''}
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
