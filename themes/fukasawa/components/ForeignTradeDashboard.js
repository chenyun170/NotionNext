import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 V3.0 (终极完整版)
 * 集成功能：
 * 1. 全球商机时钟 (含工作/周末/下班状态判定)
 * 2. 实时汇率 (带缓存策略)
 * 3. CBM 装箱量计算器 (20GP/40HQ 装柜参考)
 * 4. WhatsApp 直连工具
 */
const ForeignTradeDashboard = () => {
  // --- 1. 状态管理 ---
  // 时钟
  const [times, setTimes] = useState({});
  // 汇率
  const [usd, setUsd] = useState(100);
  const [cny, setCny] = useState('');
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCached, setIsCached] = useState(false);
  // WhatsApp
  const [waPhone, setWaPhone] = useState('');
  // CBM 计算器
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [cbmResult, setCbmResult] = useState(null);

  // 配置
  const CACHE_DURATION = 24 * 60 * 60 * 1000; 
  const CACHE_KEY = 'ft_dashboard_rate_cache';

  // --- 2. 核心逻辑 ---

  // A. 智能时钟 + 状态判断 (避坑神器)
  useEffect(() => {
    const getCityStatus = (timeZone) => {
      try {
        const now = new Date();
        // 获取当地时间对象
        const localTimeStr = now.toLocaleString("en-US", { timeZone });
        const localDate = new Date(localTimeStr);
        const day = localDate.getDay(); // 0=周日, 6=周六
        const hour = localDate.getHours();

        // 判定逻辑
        if (day === 0 || day === 6) return { text: '周末', color: '#f59e0b', bg: '#fffbeb' }; // 黄色
        if (hour < 9 || hour >= 18) return { text: '休市', color: '#94a3b8', bg: '#f1f5f9' }; // 灰色
        return { text: '工作', color: '#10b981', bg: '#ecfdf5' }; // 绿色
      } catch (e) {
        return { text: '--', color: '#ccc', bg: '#fff' };
      }
    };

    const updateTime = () => {
      const now = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      
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
          status: getCityStatus(z.tz)
        };
      });
      setTimes(newTimes);
    };

    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, []);

  // B. 汇率获取 (保持不变，带缓存)
  useEffect(() => {
    const fetchRate = async () => {
      const now = new Date().getTime();
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        try {
          const parsed = JSON.parse(cachedData);
          if (now - parsed.timestamp < CACHE_DURATION) {
            setRate(parsed.rate); setLoading(false); setIsCached(true); return;
          }
        } catch (e) {}
      }
      try {
        const response = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const data = await response.json();
        if (data.result === 'success') {
          const cnyRate = data.conversion_rates.CNY;
          setRate(cnyRate); setLoading(false); setIsCached(false);
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: cnyRate, timestamp: now }));
        } else { setRate(7.28); setLoading(false); }
      } catch (error) { setRate(7.28); setLoading(false); }
    };
    fetchRate();
  }, []);

  useEffect(() => {
    if (rate !== null) setCny((usd * rate).toFixed(2));
  }, [usd, rate]);

  // C. CBM 计算逻辑
  const calculateCBM = () => {
    const { l, w, h, pcs } = dims;
    if (l && w && h && pcs) {
      // 假设输入单位是 cm
      const totalCBM = (l * w * h / 1000000) * pcs;
      
      // 装柜估算
      // 20GP ≈ 28cbm, 40GP ≈ 58cbm, 40HQ ≈ 68cbm
      let container = '';
      if (totalCBM < 28) container = `约占 20GP 的 ${(totalCBM/28*100).toFixed(0)}%`;
      else if (totalCBM < 58) container = `建议走 40GP`;
      else if (totalCBM < 68) container = `建议走 40HQ`;
      else container = `超过一个高柜，需分柜`;

      setCbmResult({ cbm: totalCBM.toFixed(3), suggestion: container });
    } else {
      setCbmResult(null);
    }
  };

  // D. WhatsApp 逻辑
  const handleWaClick = () => {
    if (!waPhone) return;
    const cleanNum = waPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanNum}`, '_blank');
  };

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container {
          margin-bottom: 30px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #334155;
        }
        
        /* 布局网格 */
        .dashboard-row-1 { margin-bottom: 15px; }
        .dashboard-row-2 { 
          display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; 
        }
        .dashboard-row-3 { display: block; }

        /* 通用卡片 */
        .dash-card {
          background: #fff; border-radius: 10px; padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
          height: 100%;
        }
        .card-header {
          font-size: 0.9rem; font-weight: 700; color: #1e293b; margin-bottom: 12px;
          display: flex; align-items: center; gap: 6px;
        }
        .card-header::before {
          content: ''; display: block; width: 3px; height: 12px; background: #3b82f6; border-radius: 2px;
        }

        /* 1. 时钟卡片 */
        .clock-wrapper { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
        .clock-box { 
          text-align: center; background: #f8fafc; padding: 10px 4px; border-radius: 8px; border: 1px solid #e2e8f0;
          position: relative; overflow: hidden;
        }
        .city-name { font-size: 0.7rem; color: #64748b; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;}
        .time-text { font-size: 1.1rem; font-weight: 700; color: #0f172a; line-height: 1.2; font-variant-numeric: tabular-nums; }
        .status-badge {
          font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; font-weight: 600;
        }

        /* 2. 汇率 & CBM 计算通用输入框 */
        .calc-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px;}
        .input-group { position: relative; flex: 1; }
        .std-input {
          width: 100%; padding: 6px 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem; outline: none; transition: 0.2s;
        }
        .std-input:focus { border-color: #3b82f6; }
        .input-label { position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 0.75rem; }
        
        .cbm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .result-box { background: #f0f9ff; padding: 8px; border-radius: 6px; text-align: center; font-size: 0.85rem; color: #0369a1; border: 1px dashed #bae6fd;}

        /* 3. WhatsApp */
        .wa-box { display: flex; gap: 10px; }
        .wa-btn {
          background: #25d366; color: white; border: none; padding: 0 20px; border-radius: 6px; font-weight: 600; cursor: pointer;
        }
        .wa-btn:hover { background: #128c7e; }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .dashboard-row-2 { grid-template-columns: 1fr; } /* 手机端汇率和CBM上下排 */
          .clock-wrapper { grid-template-columns: 1fr 1fr; }
          .wa-box { flex-direction: column; }
          .wa-btn { padding: 10px; }
        }
      `}</style>

      {/* 第一行：全能时钟 */}
      <div className="dashboard-row-1">
        <div className="dash-card">
          <div className="card-header">全球商机监控 (当地状态)</div>
          <div className="clock-wrapper">
            {['cn','uk','us','la'].map(k => (
              <div className="clock-box" key={k}>
                <div className="city-name">{times[k]?.status?.name || (k==='cn'?'北京':k==='uk'?'伦敦':k==='us'?'纽约':'加州')}</div>
                <div className="time-text">{times[k]?.time || '--:--'}</div>
                {times[k]?.status && (
                  <span className="status-badge" style={{ color: times[k].status.color, background: times[k].status.bg }}>
                    {times[k].status.text}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第二行：算钱 + 算货 */}
      <div className="dashboard-row-2">
        {/* 左：汇率计算 */}
        <div className="dash-card">
          <div className="card-header">报价换算 (USD → CNY)</div>
          <div className="calc-row">
            <input type="number" className="std-input" value={usd} onChange={(e) => setUsd(e.target.value)} />
            <span style={{color:'#94a3b8'}}>⇄</span>
            <input type="text" className="std-input" value={cny} readOnly style={{background:'#f8fafc'}} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
             <span>{loading ? '更新中...' : '● 汇率已更新'}</span>
             <span>1$ ≈ {rate}¥</span>
          </div>
        </div>

        {/* 右：CBM 算货 */}
        <div className="dash-card">
          <div className="card-header">装箱计算 (单位: cm)</div>
          <div className="cbm-grid">
            <div className="input-group"><input placeholder="长" className="std-input" onChange={e => setDims({...dims, l:e.target.value})} onBlur={calculateCBM} /><span className="input-label">L</span></div>
            <div className="input-group"><input placeholder="宽" className="std-input" onChange={e => setDims({...dims, w:e.target.value})} onBlur={calculateCBM} /><span className="input-label">W</span></div>
            <div className="input-group"><input placeholder="高" className="std-input" onChange={e => setDims({...dims, h:e.target.value})} onBlur={calculateCBM} /><span className="input-label">H</span></div>
            <div className="input-group"><input placeholder="箱数" className="std-input" onChange={e => setDims({...dims, pcs:e.target.value})} onBlur={calculateCBM} /><span className="input-label">Pcs</span></div>
          </div>
          {cbmResult ? (
            <div className="result-box">
              <strong>{cbmResult.cbm} m³</strong> <span style={{opacity:0.6}}>|</span> {cbmResult.suggestion}
            </div>
          ) : (
             <div style={{fontSize:'0.75rem', color:'#94a3b8', textAlign:'center', marginTop:'5px'}}>输入尺寸自动计算体积</div>
          )}
        </div>
      </div>

      {/* 第三行：WhatsApp */}
      <div className="dashboard-row-3">
        <div className="dash-card" style={{ padding: '12px 15px' }}>
          <div className="wa-box">
            <input 
              type="text" 
              className="std-input" 
              placeholder="WhatsApp 极速对话 (输入号码，如 86138000000)" 
              value={waPhone}
              onChange={(e) => setWaPhone(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleWaClick()}
            />
            <button className="wa-btn" onClick={handleWaClick}>开始对话</button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ForeignTradeDashboard;
