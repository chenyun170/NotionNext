import React, { useState, useEffect } from 'react';

/**
 * SidebarTools - 侧边栏专属外贸工具箱
 * 特点：垂直化布局、响应式设计、实时汇率与全球时钟
 */
const SidebarTools = () => {
  // --- 状态管理 ---
  const [usd, setUsd] = useState(1);
  const [rateData, setRateData] = useState({ val: 7.23, sync: false });
  const [waPhone, setWaPhone] = useState('');
  const [times, setTimes] = useState({});
    return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg">
      {/* 内部组件样式保持一致 */}
      {/* 建议将内部的小卡片也设为 bg-white/20 或 bg-black/20 */}
    </div>
  )
}

  // --- 核心逻辑：时钟与工作状态 ---
  useEffect(() => {
    const updateTime = () => {
      const zones = [
        { k: 'CN', t: 'Asia/Shanghai', n: '北京' },
        { k: 'UK', t: 'Europe/London', n: '伦敦' },
        { k: 'US', t: 'America/New_York', n: '纽约' },
        { k: 'LA', t: 'America/Los_Angeles', n: '洛杉矶' }
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: z.t }));
        const h = date.getHours();
        const d = date.getDay();
        const isWork = d !== 0 && d !== 6 && h >= 9 && h < 18;
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          name: z.n, 
          isWork 
        };
      });
      setTimes(res);
    };
    updateTime();
    const t = setInterval(updateTime, 10000); // 每10秒更新一次
    return () => clearInterval(t);
  }, []);

  // --- 核心逻辑：获取实时汇率 ---
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          setRateData({ val: d.conversion_rates.CNY, sync: true });
        }
      } catch (e) {
        console.error("汇率同步失败，使用缓存值");
      }
    };
    fetchRate();
  }, []);

  // --- 处理 WhatsApp 点击 ---
  const handleWaClick = () => {
    if (!waPhone) return;
    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-3 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      
      {/* 1. 全球时钟 (2x2 网格) */}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase">{v.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${v.isWork ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            </div>
            <div className="text-sm font-mono font-bold text-gray-700 dark:text-gray-200">{v.time}</div>
          </div>
        ))}
      </div>

      {/* 2. 汇率换算 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Exchange Rate</label>
          <span className="text-[9px] text-blue-500 font-bold">{rateData.sync ? 'LIVE' : 'CACHE'}</span>
        </div>
        <div className="relative flex flex-col gap-1">
          <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-1">
            <span className="pl-2 text-xs font-bold text-gray-400">$</span>
            <input 
              type="number" 
              value={usd} 
              onChange={e => setUsd(e.target.value)}
              className="w-full bg-transparent p-2 text-sm font-bold outline-none dark:text-gray-100"
            />
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">结果 (CNY)</span>
            <span className="text-sm font-black text-blue-700 dark:text-blue-300">¥ {(usd * rateData.val).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 3. WhatsApp 快速直连 */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter px-1">WhatsApp Direct</label>
        <div className="flex flex-col gap-2">
          <input 
            placeholder="手机号 (含区号, 如86...)" 
            value={waPhone} 
            onChange={e => setWaPhone(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-2.5 text-xs outline-none focus:ring-2 ring-green-500/20 transition-all dark:text-gray-100"
          />
          <button 
            onClick={handleWaClick}
            className="w-full bg-green-500 hover:bg-green-600 active:scale-[0.98] text-white text-[11px] font-black py-2.5 rounded-xl transition-all shadow-md shadow-green-500/20 flex items-center justify-center gap-2"
          >
            <i className="fab fa-whatsapp text-sm"></i>
            发起对话
          </button>
        </div>
      </div>

      {/* 4. 底边微型信息 */}
      <div className="flex justify-center pt-1">
        <span className="text-[9px] text-gray-300 dark:text-gray-600 font-medium tracking-widest uppercase italic">Trade Intelligence Terminal</span>
      </div>

    </div>
  );
};

export default SidebarTools;
