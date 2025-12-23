import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm'); // 默认显示算柜
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState('');
  const [rate, setRate] = useState(7.25);
  const [searchQuery, setSearchQuery] = useState('');

  // 时间刷新逻辑
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
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          name: z.n,
          isWorking: hour >= 9 && hour < 18
        };
      });
      setTimes(res);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    if (searchQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 backdrop-blur-md border border-white/30 shadow-xl text-slate-800 dark:text-gray-200">
      {/* 4城时间网格 */}
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

      {/* 功能切换按钮 */}
      <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-1 rounded-xl">
        {['cbm', 'unit', 'ex', 'search'].map(m => (
          <button key={m} onClick={() => setCalcMode(m)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-all ${calcMode === m ? 'bg-white dark:bg-gray-600 text-blue-600 shadow-sm' : 'text-gray-400'}`}>
            {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : m === 'ex' ? '报价' : '搜索'}
          </button>
        ))}
      </div>

      {/* 动态输入区：修复之前漏掉的输入框 */}
      <div className="py-2 min-h-[50px]">
        {/* 1. 算柜输入框 */}
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1.5">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} type="number" placeholder={f.toUpperCase()} className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none focus:border-blue-500" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}

        {/* 2. 报价换算输入框 */}
        {calcMode === 'ex' && (
          <div className="flex gap-2">
            <input type="number" className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder="美金报价 ($)" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <input type="number" className="w-16 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-[10px]" value={rate} onChange={e=>setRate(e.target.value)}/>
          </div>
        )}

        {/* 3. 搜索输入框 */}
        {calcMode === 'search' && (
          <div className="flex gap-2">
            <input className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder="Google 搜索..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            <button onClick={handleSearch} className="px-3 bg-blue-600 text-white text-[10px] rounded-lg font-bold">Go</button>
          </div>
        )}

        {/* 4. 单位换算输入框 */}
        {calcMode === 'unit' && (
          <div className="flex gap-2">
            <input type="number" className="flex-1 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-xs outline-none" placeholder={unitType==='len'?'英寸':'磅'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <button onClick={() => setUnitType(unitType==='len'?'wt':'len')} className="px-2 bg-blue-600 text-white text-[9px] rounded-lg">{unitType==='len'?'长':'重'}</button>
          </div>
        )}
      </div>

      {/* 结果显示区 */}
      <div className="p-3 bg-blue-600/10 border border-blue-500/20 rounded-xl text-center">
        <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
          {calcMode === 'cbm' ? `结果: ${((dims.l*dims.w*dims.h*(dims.pcs||1))/1000000).toFixed(3)} CBM` : 
           calcMode === 'ex' ? `约合: ¥${(exVal * rate).toFixed(2)}` :
           calcMode === 'unit' ? (unitType==='len'?`${unitVal}in=${(unitVal*2.54).toFixed(2)}cm`:`${unitVal}lb=${(unitVal*0.4536).toFixed(2)}kg`) : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
