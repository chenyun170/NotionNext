import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  // 1. 状态管理
  const [calcMode, setCalcMode] = useState('cbm'); // 默认显示算柜，可选 unit(换算), search(搜索)
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });

  // 2. 实时更新 4 个城市的时间
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
        res[z.k] = { 
          time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }), 
          name: z.n 
        };
      });
      setTimes(res);
    };
    updateTime();
    const t = setInterval(updateTime, 10000);
    return () => clearInterval(t);
  }, []);

  // 3. 单位换算逻辑
  const getUnitRes = () => {
    if (!unitVal) return '等待输入...';
    const val = parseFloat(unitVal);
    return unitType === 'len' 
      ? `${val} in = ${(val * 2.54).toFixed(2)} cm` 
      : `${val} lb = ${(val * 0.4536).toFixed(2)} kg`;
  };

  return (
    <div className="flex flex-col gap-4 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg">
      
      {/* A. 四个城市时间区域 - 紧凑网格 */}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/30 dark:bg-black/20 rounded-xl border border-white/20">
            <div className="text-[9px] text-gray-400 font-bold mb-1">{v.name}</div>
            <div className="text-xs font-mono font-black text-gray-700 dark:text-gray-200">{v.time}</div>
          </div>
        ))}
      </div>

      {/* B. 功能切换头 */}
      <div className="flex items-center justify-between border-t border-white/20 pt-3">
        <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-widest">Trade Tools</span>
        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
          {['cbm', 'unit', 'search'].map(m => (
            <button key={m} onClick={() => setCalcMode(m)} className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${calcMode === m ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'}`}>
              {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : '搜索'}
            </button>
          ))}
        </div>
      </div>

      {/* C. 动态功能区 */}
      <div className="min-h-[44px]">
        {/* 算柜界面 */}
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1.5">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} placeholder={f.toUpperCase()} className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}

        {/* 换算界面 */}
        {calcMode === 'unit' && (
          <div className="flex gap-2">
            <input type="number" className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder={unitType==='len'?'英寸(in)':'磅(lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <button onClick={() => setUnitType(unitType==='len'?'wt':'len')} className="px-3 bg-blue-600 text-white text-[9px] rounded-lg font-bold">{unitType==='len'?'长':'重'}</button>
          </div>
        )}

        {/* 搜索界面 */}
        {calcMode === 'search' && (
          <div className="flex gap-1.5">
            <input className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder="HS/谷歌搜索..." onKeyDown={e => e.key === 'Enter' && window.open(`https://google.com/search?q=${e.target.value}`)}/>
          </div>
        )}
      </div>

      {/* D. 结果显示条 */}
      <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 text-center">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
          {calcMode === 'unit' ? getUnitRes() : calcMode === 'cbm' ? 'Ready to Calc' : 'Ready to Search'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
