import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件
 * 包含：常用工具链接、活动推广卡片、世界时钟、汇率计算
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({ cn: '', uk: '', us: '', la: '' });
  const [usd, setUsd] = useState(100);
  const [cny, setCny] = useState('');
  const RATE = 7.28; // 固定汇率，你可以改为 API 获取

  // 1. 时钟逻辑
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimes({
        cn: now.toLocaleTimeString('en-US', { ...opts, timeZone: 'Asia/Shanghai' }),
        uk: now.toLocaleTimeString('en-US', { ...opts, timeZone: 'Europe/London' }),
        us: now.toLocaleTimeString('en-US', { ...opts, timeZone: 'America/New_York' }),
        la: now.toLocaleTimeString('en-US', { ...opts, timeZone: 'America/Los_Angeles' }),
      });
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, []);

  // 2. 汇率逻辑
  useEffect(() => {
    setCny((usd * RATE).toFixed(2));
  }, [usd]);

  return (
    <div className="ft-dashboard-container">
      {/* 嵌入样式 */}
      <style jsx>{`
        .ft-dashboard-container {
          margin-bottom: 40px;
          color: #333;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .section-card {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: ''; display: block; width: 4px; height: 16px; background: #2563eb; border-radius: 2px;
        }
        /* 工具链接 */
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 10px;
        }
        .tool-item {
          background: #f1f5f9; padding: 10px; text-align: center; border-radius: 6px;
          font-size: 0.9rem; color: #333; text-decoration: none; transition: 0.2s;
        }
        .tool-item:hover { background: #e2e8f0; transform: translateY(-2px); }

        /* 活动卡片 */
        .activities-wrapper {
          display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;
        }
        .activity-card {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white; padding: 25px; border-radius: 12px;
          position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: center;
          min-height: 100px; transition: transform 0.2s; cursor: pointer;
        }
        .activity-card:hover { transform: scale(1.02); }
        .activity-card.secondary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .act-title { font-size: 1.2rem; font-weight: bold; margin-bottom: 5px; z-index: 2; }
        .act-desc { font-size: 0.85rem; opacity: 0.9; z-index: 2; }
        .activity-card::after {
          content: ''; position: absolute; right: -20px; bottom: -20px;
          width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 50%;
        }

        /* 仪表盘 */
        .utility-bar { display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; }
        .clock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; }
        .clock-item { text-align: center; padding: 8px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0; }
        .c-city { font-size: 0.7rem; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
        .c-time { font-size: 1rem; font-weight: 700; color: #1e293b; font-variant-numeric: tabular-nums; }
        
        .currency-calc { display: flex; align-items: center; gap: 8px; background: #f8fafc; padding: 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
        .c-input { flex: 1; width: 100%; padding: 6px; border: 1px solid #cbd5e1; border-radius: 4px; }
        .ex-icon { font-weight: bold; color: #2563eb; }
        .rate-hint { font-size: 12px; color: #94a3b8; margin-top: 5px; }

        @media (max-width: 768px) {
          .activities-wrapper, .utility-bar { grid-template-columns: 1fr; }
          .clock-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* 1. 工具链接区域 */}
      <div className="section-card">
        <div className="section-title">外贸获客黑科技</div>
        <div className="tools-grid">
          <a href="#" className="tool-item">WhatsApp 群发</a>
          <a href="#" className="tool-item">LinkedIn 抓取</a>
          <a href="#" className="tool-item">海关数据</a>
          <a href="#" className="tool-item">谷歌地图获客</a>
          <a href="#" className="tool-item">社媒分析</a>
        </div>
      </div>

      {/* 2. 核心活动区域 */}
      <div className="activities-wrapper">
        <div className="activity-card">
          <div className="act-title">🚀 独立站训练营</div>
          <div className="act-desc">7天打造询盘收割机</div>
        </div>
        <div className="activity-card secondary">
          <div className="act-title">🔥 2025选品报告</div>
          <div className="act-desc">欧美爆款清单下载</div>
        </div>
      </div>

      {/* 3. 仪表盘 (时钟+汇率) */}
      <div className="utility-bar">
        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-title">全球商机时间</div>
          <div className="clock-grid">
            <div className="clock-item"><div className="c-city">北京</div><div className="c-time">{times.cn}</div></div>
            <div className="clock-item"><div className="c-city">伦敦</div><div className="c-time">{times.uk}</div></div>
            <div className="clock-item"><div className="c-city">纽约</div><div className="c-time">{times.us}</div></div>
            <div className="clock-item"><div className="c-city">加州</div><div className="c-time">{times.la}</div></div>
          </div>
        </div>

        <div className="section-card" style={{ marginBottom: 0 }}>
          <div className="section-title">快速报价 (USD→CNY)</div>
          <div className="currency-calc">
            <input type="number" className="c-input" value={usd} onChange={(e) => setUsd(e.target.value)} />
            <span className="ex-icon">⇄</span>
            <input type="text" className="c-input" value={cny} readOnly />
          </div>
          <div className="rate-hint">* 参考汇率: {RATE}</div>
        </div>
      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
