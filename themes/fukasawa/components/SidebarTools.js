import React, { useState, useEffect } from 'react';

/**
 * 侧边栏工具整合版 - 包含4城时间(带工作状态)、单位换算、算柜
 */
const SidebarTools = () => {
  // 1. 状态管理
  const [calcMode, setCalcMode] = useState('cbm'); // 模式：cbm(算柜), unit(换算), search(搜索)
  const [times, setTimes] = useState({});
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });

  // 2. 核心逻辑：实时计算4个城市的时间及“工作状态”
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
        // 定义工作时间：周一至周五，9:00 - 18:00
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

  // 3. 单位换算逻辑
  const getUnitRes = () => {
    if (!unitVal) return '等待输入...';
    const val = parseFloat(unitVal);
    return unitType === 'len' 
      ? `${val} in = ${(val * 2.54).toFixed(2)} cm` 
      : `${val} lb = ${(val * 0.4536).toFixed(2)} kg`;
  };

  return (
    <div className="flex flex-col gap-4 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg animate__animated animate__fadeIn">
      
      {/* A. 四个城市时间网格 - 带有动态工作状态呼吸灯 */}
      <div className="grid grid-cols-2 gap-2">
        {Object.values(times).map(v => (
          <div key={v.name} className="p-2 bg-white/30 dark:bg-black/20 rounded-xl border border-white/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-gray-400 font-bold">{v.name}</span>
              <div className="flex items-center gap-1">
                <span className={`text-[7px] font-bold ${v.isWorking ? 'text-green-500' : 'text-gray-400'}`}>
                  {v.isWorking ? 'ON' : 'OFF'}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${v.isWorking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></span>
              </div>
            </div>
            <div className="text-sm font-mono font-black text-gray-700 dark:text-gray-200">{v.time}</div>
          </div>
        ))}
      </div>

      {/* B. 常用工具切换头 */}
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
      <div className="min-h-[44px] flex items-center">
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} placeholder={f.toUpperCase()} className="w-full bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}

        {calcMode === 'unit' && (
          <div className="flex gap-2 w-full">
            <input type="number" className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none font-bold" placeholder={unitType==='len'?'英寸(in)':'磅(lb)'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
              <button onClick={() => setUnitType('len')} className={`px-2 text-[9px] font-bold rounded-md ${unitType==='len'?'bg-white text-blue-600 shadow-sm':''}`}>长</button>
              <button onClick={() => setUnitType('wt')} className={`px-2 text-[9px] font-bold rounded-md ${unitType==='wt'?'bg-white text-blue-600 shadow-sm':''}`}>重</button>
            </div>
          </div>
        )}

        {calcMode === 'search' && (
          <div className="flex gap-1.5 w-full">
            <input className="flex-1 bg-white/40 dark:bg-black/40 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder="输入关键词回车搜索..." onKeyDown={e => e.key === 'Enter' && window.open(`https://google.com/search?q=${e.target.value}`)}/>
          </div>
        )}
      </div>

      {/* D. 计算/换算结果展示条 */}
      <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/20 text-center">
        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">
          {calcMode === 'unit' ? getUnitRes() : calcMode === 'cbm' ? 'Ready to Calc' : 'Terminal Ready'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
