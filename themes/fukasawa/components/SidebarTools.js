import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm');
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState('');
  const [rate, setRate] = useState(7.25);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 时间逻辑
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

  // 2. 核心功能逻辑
  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (!l || !w || !h) return '输入尺寸(CM)';
    return `结果: ${((l * w * h * (pcs || 1)) / 1000000).toFixed(3)} CBM`;
  };

  const getExRes = () => {
    if (!exVal) return '输入美金报价';
    return `约合: ¥${(parseFloat(exVal) * rate).toFixed(2)}`;
  };

  const handleSearch = () => {
    if (searchQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-xl">
      {/* 时间网格 */}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/40 dark:bg-white/5 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400 font-bold">{v.name}</span>
              <span className={`w-2 h-2 rounded-full ${v.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            </div>
            <div className="text-sm font-mono font-black">{v.time}</div>
          </div>
        ))}
      </div>

      {/* 模式切换按钮 */}
      <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-xl">
        {['cbm', 'unit', 'ex', 'search'].map(m => (
          <button key={m} onClick={() => setCalcMode(m)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${calcMode === m ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>
            {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : m === 'ex' ? '报价' : '搜索'}
          </button>
        ))}
      </div>

      {/* 动态输入区域 - 确保显示 */}
      <div className="py-2">
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-2">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} type="number" placeholder={f.toUpperCase()} className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none focus:border-blue-500" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}

        {calcMode === 'unit' && (
          <div className="flex gap-2">
            <input type="number" className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder={unitType==='len'?'英寸(in)':'磅(lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <button onClick={() => setUnitType(unitType==='len'?'wt':'len')} className="px-3 py-2 bg-blue-600 text-white text-[10px] rounded-lg font-bold">{unitType==='len'?'长':'重'}</button>
          </div>
        )}

        {calcMode === 'ex' && (
          <div className="flex gap-2">
            <input type="number" className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder="美金报价 ($)" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <input type="number" className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-[10px]" value={rate} onChange={e=>setRate(e.target.value)}/>
          </div>
        )}

        {calcMode === 'search' && (
          <div className="flex gap-2">
            <input className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder="Google 搜索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white text-[10px] rounded-lg font-bold">Go</button>
          </div>
        )}
      </div>

      {/* 结果显示条 */}
      <div className="p-3 bg-blue-600 text-white rounded-xl text-center shadow-lg shadow-blue-500/20">
        <span className="text-[11px] font-black uppercase tracking-wider">
          {calcMode === 'unit' ? getUnitRes() : 
           calcMode === 'cbm' ? getCbmRes() : 
           calcMode === 'ex' ? getExRes() : 'Ready to Search'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
