import React, { useState, useEffect } from 'react';

/**
 * SidebarTools - 侧边栏精炼版
 */
const SidebarTools = () => {
  const [usd, setUsd] = useState(1);
  const [rateData, setRateData] = useState({ val: 7.23, sync: false });
  const [waPhone, setWaPhone] = useState('');
  const [times, setTimes] = useState({});

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
    const t = setInterval(updateTime, 10000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const res = await fetch('https://v6.exchangerate-api.com/v6/08bd067e490fdc5d9ccac3bd/latest/USD');
        const d = await res.json();
        if (d.result === 'success') {
          setRateData({ val: d.conversion_rates.CNY, sync: true });
        }
      } catch (e) {
        console.error("汇率同步失败");
      }
    };
    fetchRate();
  }, []);

  const handleWaClick = () => {
    if (!waPhone) return;
    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg">
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/20 dark:bg-black/20 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400 font-bold">{v.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${v.isWork ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            </div>
            <div className="text-xs font-mono font-bold text-gray-700 dark:text-gray-200">{v.time}</div>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center bg-white/20 dark:bg-black/20 rounded-xl border border-white/20 p-1">
          <span className="pl-2 text-[10px] font-bold text-gray-400">$</span>
          <input 
            type="number" 
            value={usd} 
            onChange={e => setUsd(e.target.value)}
            className="w-full bg-transparent p-1.5 text-xs font-bold outline-none dark:text-gray-100"
          />
        </div>
        <div className="flex items-center justify-between px-2 py-1.5 bg-blue-500/10 rounded-xl border border-blue-500/20">
          <span className="text-[10px] font-bold text-blue-600">¥ {(usd * rateData.val).toFixed(2)}</span>
          <span className="text-[9px] text-blue-400 font-bold">{rateData.sync ? 'LIVE' : 'CACHE'}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <input 
          placeholder="WhatsApp 号码..." 
          value={waPhone} 
          onChange={e => setWaPhone(e.target.value)}
          className="w-full bg-white/20 dark:bg-black/20 border border-white/20 rounded-xl p-2 text-[10px] outline-none dark:text-gray-100"
        />
        <button 
          onClick={handleWaClick}
          className="w-full bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <i className="fab fa-whatsapp"></i>发起对话
        </button>
      </div>
    </div>
  );
};

export default SidebarTools;
