import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, ex, search
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState('');
  const [rate, setRate] = useState(7.25);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const zones = [
        { k: 'BJ', t: 'Asia/Shanghai', n: '北京' },
        { k: 'LD', t: 'Europe/London', n: '伦敦' },
        { k: 'NY', t: 'America/New_York', n: '纽约' },
        { k: 'LS', t: 'America/Los_Angeles', n: '洛杉矶' }
      ];
      const res = {};
      zones.forEach(z => {
        const date = new Date(new Date().toLocaleString("en-US", { timeZone: z.t }));
        const hour = date.getHours();
        const isWorking = hour >= 9 && hour < 18;
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          name: z.n,
          isWorking
        };
      });
      setTimes(res);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (!l || !w || !h) return '输入尺寸(CM)';
    return `结果: ${((l*w*h*(pcs||1))/1000000).toFixed(3)} CBM`;
  };

  const getExRes = () => {
    if (!exVal) return '输入美金报价';
    return `约合: ¥${(exVal * rate).toFixed(2)}`;
  };

  return (
    <div className="flex flex-col gap-4 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 shadow-lg">
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/30 dark:bg-black/20 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400 font-bold">{v.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${v.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            </div>
            <div className="text-sm font-mono font-black">{v.time}</div>
          </div>
        ))}
      </div>
      
      <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
        {['cbm', 'unit', 'ex', 'search'].map(m => (
          <button key={m} onClick={() => setCalcMode(m)} className={`flex-1 py-1 text-[9px] font-bold rounded-md ${calcMode === m ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}>
            {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : m === 'ex' ? '报价' : '搜索'}
          </button>
        ))}
      </div>

      <div className="min-h-[40px] flex items-center">
        {calcMode === 'ex' && (
          <div className="flex gap-2 w-full">
            <input type="number" className="flex-1 bg-white/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder="美金($)" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <input type="number" className="w-12 bg-white/40 border border-white/10 rounded-lg p-1.5 text-[9px]" value={rate} onChange={e=>setRate(e.target.value)}/>
          </div>
        )}
        {/* 其他输入逻辑... */}
      </div>

      <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-center text-[10px] font-black text-blue-600">
        {calcMode === 'ex' ? getExRes() : calcMode === 'cbm' ? getCbmRes() : 'Ready'}
      </div>
    </div>
  );
};

export default SidebarTools;
