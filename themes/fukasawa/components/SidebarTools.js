import React, { useState, useEffect } from 'react';

/**
 * 侧边栏工具终极版 - 包含：4城时间、算柜、单位换算、报价汇率、搜索
 */
const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, ex, search
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [exVal, setExVal] = useState(''); // 报价输入
  const [rate, setRate] = useState(7.25); // 默认汇率，可手动修改
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 实时时间逻辑
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
        const day = date.getDay();
        const isWorking = day >= 1 && day <= 5 && hour >= 9 && hour < 18;
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          name: z.n,
          isWorking: isWorking
        };
      });
      setTimes(res);
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  // 2. 算柜结果
  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (!l || !w || !h) return '请输入尺寸(CM)';
    const total = (parseFloat(l) * parseFloat(w) * parseFloat(h) * (parseFloat(pcs) || 1)) / 1000000;
    return `结果: ${total.toFixed(3)} CBM`;
  };

  // 3. 单位换算结果
  const getUnitRes = () => {
    if (!unitVal) return '输入数值';
    const val = parseFloat(unitVal);
    return unitType === 'len' 
      ? `${val} in = ${(val * 2.54).toFixed(2)} cm` 
      : `${val} lb = ${(val * 0.4536).toFixed(2)} kg`;
  };

  // 4. 报价汇率换算
  const getExRes = () => {
    if (!exVal) return '输入美金报价';
    const res = (parseFloat(exVal) * rate).toFixed(2);
    return `约合: ¥${res} (汇率:${rate})`;
  };

  const handleSearch = () => {
    if (searchQuery) window.open(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`, '_blank');
  };

  return (
    <div className="flex flex-col gap-4 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg text-slate-800 dark:text-gray-200">
      
      {/* A. 4城时间网格 */}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/30 dark:bg-black/20 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400 font-bold">{v.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${v.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
            </div>
            <div className="text-sm font-mono font-black">{v.time}</div>
          </div>
        ))}
      </div>

      {/* B. 功能导航 */}
      <div className="flex items-center justify-between border-t border-white/20 pt-3">
        <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-widest">Tools</span>
        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg overflow-x-auto no-scrollbar">
          {[
            {id:'cbm', n:'算柜'}, {id:'unit', n:'换算'}, 
            {id:'ex', n:'报价'}, {id:'search', n:'搜索'}
          ].map(m => (
            <button key={m.id} onClick={() => setCalcMode(m.id)} className={`px-2 py-1 text-[9px] font-bold rounded-md whitespace-nowrap transition-all ${calcMode === m.id ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}>
              {m.n}
            </button>
          ))}
        </div>
      </div>

      {/* C. 动态输入区 */}
      <div className="min-h-[44px] flex items-center">
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1 w-full">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} type="number" placeholder={f.toUpperCase()} className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}

        {calcMode === 'unit' && (
          <div className="flex gap-2 w-full">
            <input type="number" className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder={unitType==='len'?'英寸':'磅'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <button onClick={() => setUnitType(unitType==='len'?'wt':'len')} className="px-2 bg-blue-600 text-white text-[9px] rounded-lg font-bold">{unitType==='len'?'长':'重'}</button>
          </div>
        )}

        {calcMode === 'ex' && (
          <div className="flex gap-2 w-full">
            <input type="number" className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none font-bold text-blue-600" placeholder="美金报价 ($)" value={exVal} onChange={e=>setExVal(e.target.value)}/>
            <input type="number" className="w-12 bg-gray-100 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[9px] outline-none" placeholder="汇率" value={rate} onChange={e=>setRate(e.target.value)}/>
          </div>
        )}

        {calcMode === 'search' && (
          <div className="flex gap-1.5 w-full">
            <input className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder="输入搜索内容..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}/>
            <button onClick={handleSearch} className="px-2 bg-blue-600 text-white text-[9px] rounded-lg font-bold">Go</button>
          </div>
        )}
      </div>

      {/* D. 结果显示 */}
      <div className="p-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-center">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-relaxed">
          {calcMode === 'unit' ? getUnitRes() : 
           calcMode === 'cbm' ? getCbmRes() : 
           calcMode === 'ex' ? getExRes() : 'Ready'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
