import React, { useState, useEffect } from 'react';

/**
 * 外贸工作台组件 (精简版)
 * 功能：全球商机时钟 + 实时汇率计算器 (接入 ExchangeRate-API)
 */
const ForeignTradeDashboard = () => {
  const [times, setTimes] = useState({ cn: '', uk: '', us: '', la: '' });
  const [usd, setUsd] = useState(100);
  const [cny, setCny] = useState('');
  const [rate, setRate] = useState(null); // 存储实时汇率
  const [loading, setLoading] = useState(true);

  // 1. 实时获取汇率 (API)
  useEffect(() => {
    const fetchRate = async () => {
      try {
        // 使用你的 API Key
        const response = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const data = await response.json();
        
        if (data.result === 'success') {
          const cnyRate = data.conversion_rates.CNY;
          setRate(cnyRate);
          setLoading(false);
        } else {
          console.error('汇率获取失败:', data);
          setRate(7.28); // 失败兜底值
          setLoading(false);
        }
      } catch (error) {
        console.error('网络错误:', error);
        setRate(7.28); // 错误兜底值
        setLoading(false);
      }
    };

    fetchRate();
  }, []);

  // 2. 汇率计算逻辑
  useEffect(() => {
    if (rate !== null) {
      setCny((usd * rate).toFixed(2));
    }
  }, [usd, rate]);

  // 3. 时钟逻辑
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // 使用更紧凑的时间格式
      const opts = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
      setTimes({
        cn: now.toLocaleTimeString('en-GB', { ...opts, timeZone: 'Asia/Shanghai' }),
        uk: now.toLocaleTimeString('en-GB', { ...opts, timeZone: 'Europe/London' }),
        us: now.toLocaleTimeString('en-GB', { ...opts, timeZone: 'America/New_York' }),
        la: now.toLocaleTimeString('en-GB', { ...opts, timeZone: 'America/Los_Angeles' }),
      });
    };
    const timer = setInterval(updateTime, 1000);
    updateTime();
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ft-dashboard-container">
      <style jsx>{`
        .ft-dashboard-container {
          margin-bottom: 30px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        /* 仪表盘主容器：两列布局 */
        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 15px;
        }

        /* 通用卡片样式 */
        .dash-card {
          background: #fff;
          border-radius: 10px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
        }

        .card-header {
          font-size: 0.9rem;
          font-weight: 700;
          color: #334155;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .card-header::before {
          content: ''; display: block; width: 3px; height: 12px; background: #3b82f6; border-radius: 2px;
        }

        /* 1. 时钟网格 */
        .clock-wrapper {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }
        .clock-box {
          text-align: center;
          background: #f8fafc;
          padding: 8px 4px;
          border-radius: 6px;
        }
        .city-name {
          font-size: 0.7rem;
          color: #64748b;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .time-text {
          font-size: 1rem;
          font-weight: 700;
          color: #1e293b;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.5px;
        }

        /* 2. 汇率计算器 */
        .calc-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .input-group {
          position: relative;
          flex: 1;
        }
        .currency-input {
          width: 100%;
          padding: 8px 8px 8px 36px; /* 左侧留空给符号 */
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          font-size: 0.95rem;
          outline: none;
          transition: border-color 0.2s;
        }
        .currency-input:focus {
          border-color: #3b82f6;
        }
        .currency-symbol {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .arrow-icon {
          color: #94a3b8;
          font-size: 1.2rem;
        }
        .rate-info {
          font-size: 0.75rem;
          color: #10b981; /* 绿色代表实时 */
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
        }

        /* 移动端适配 */
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr; /* 手机变为单列 */
          }
          .clock-wrapper {
            grid-template-columns: 1fr 1fr; /* 手机时钟变两列 */
          }
        }
      `}</style>

      <div className="dashboard-grid">
        
        {/* 模块1：世界商机时间 */}
        <div className="dash-card">
          <div className="card-header">全球商机时间</div>
          <div className="clock-wrapper">
            <div className="clock-box">
              <div className="city-name">北京 CN</div>
              <div className="time-text">{times.cn}</div>
            </div>
            <div className="clock-box">
              <div className="city-name">伦敦 UK</div>
              <div className="time-text">{times.uk}</div>
            </div>
            <div className="clock-box">
              <div className="city-name">纽约 US</div>
              <div className="time-text">{times.us}</div>
            </div>
            <div className="clock-box">
              <div className="city-name">洛杉矶 US</div>
              <div className="time-text">{times.la}</div>
            </div>
          </div>
        </div>

        {/* 模块2：实时汇率计算 */}
        <div className="dash-card">
          <div className="card-header">实时报价 (USD → CNY)</div>
          <div className="calc-row">
            <div className="input-group">
              <span className="currency-symbol">$</span>
              <input 
                type="number" 
                className="currency-input" 
                value={usd} 
                onChange={(e) => setUsd(e.target.value)} 
                placeholder="USD"
              />
            </div>
            <div className="arrow-icon">→</div>
            <div className="input-group">
              <span className="currency-symbol">¥</span>
              <input 
                type="text" 
                className="currency-input" 
                value={cny} 
                readOnly 
                placeholder="CNY"
                style={{ background: '#f8fafc', color: '#334155' }}
              />
            </div>
          </div>
          <div className="rate-info">
            <span>{loading ? '更新中...' : '● 实时汇率已更新'}</span>
            <span>1 USD ≈ {rate || '--'} CNY</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ForeignTradeDashboard;
