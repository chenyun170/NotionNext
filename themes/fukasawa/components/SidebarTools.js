import React, { useState } from 'react';

const SidebarTools = () => {
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, search
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [unitType, setUnitType] = useState('len'); 
  const [unitVal, setUnitVal] = useState('');
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs');

  // 集装箱容积建议
  const CONTAINERS = { '20GP': 28, '40GP': 58, '40HQ': 68 };

  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (!l || !w || !h) return { v: 0, t: '等待数据' };
    const total = (parseFloat(l) * parseFloat(w) * parseFloat(h) * (pcs || 1)) / 1000000;
    return { v: total, t: `${total.toFixed(3)} m³` };
  };

  const getUnitRes = () => {
    if (!unitVal) return '等待输入';
    const v = parseFloat(unitVal);
    return unitType === 'len' ? `${v}in = ${(v*2.54).toFixed(2)}cm` : `${v}lb = ${(v*0.4536).toFixed(2)}kg`;
  };

  const cbm = getCbmRes();

  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-blue-600/80 uppercase tracking-widest">Tools Terminal</span>
        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
          {['cbm', 'unit', 'search'].map(m => (
            <button key={m} onClick={() => setCalcMode(m)} className={`px-2 py-1 text-[9px] font-bold rounded-md ${calcMode === m ? 'bg-white dark:bg-gray-700 text-blue-600' : 'text-gray-400'}`}>
              {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : '搜索'}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[42px] flex items-center">
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input key={f} placeholder={f.toUpperCase()} className="w-full bg-white/20 dark:bg-black/20 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" value={dims[f]} onChange={e => setDims({...dims, [f]: e.target.value})}/>
            ))}
          </div>
        )}
        {calcMode === 'unit' && (
          <div className="flex gap-2 w-full">
            <input type="number" className="flex-1 bg-white/20 dark:bg-black/20 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder={unitType==='len'?'英寸':'磅'} value={unitVal} onChange={e=>setUnitVal(e.target.value)}/>
            <button onClick={() => setUnitType(unitType === 'len' ? 'wt' : 'len')} className="px-3 py-1 bg-blue-500 text-white text-[9px] rounded-lg font-bold">{unitType === 'len' ? '长' : '重'}</button>
          </div>
        )}
        {calcMode === 'search' && (
          <div className="flex gap-1.5 w-full">
            <input className="flex-1 bg-white/20 dark:bg-black/20 border border-white/10 rounded-lg p-1.5 text-[10px] outline-none" placeholder="HS/谷歌搜索..." value={searchKw} onChange={e=>setSearchKw(e.target.value)}/>
            <button onClick={() => window.open(searchType==='hs'?`https://www.hsbianma.com/Search?keywords=${searchKw}`:`https://google.com/search?q=${searchKw}`)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold">GO</button>
          </div>
        )}
      </div>

      <div className="p-2 bg-blue-500/5 rounded-xl border border-blue-500/10 text-center">
        <div className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">
          {calcMode === 'cbm' ? cbm.t : calcMode === 'unit' ? getUnitRes() : 'Ready'}
        </div>
        {calcMode === 'cbm' && cbm.v > 0 && (
          <div className="flex justify-between gap-1 mt-1">
            {Object.entries(CONTAINERS).map(([n, vol]) => (
              <div key={n} className="flex-1">
                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{width: `${Math.min((cbm.v/vol)*100, 100)}%`}}></div>
                </div>
                <div className="text-[7px] text-gray-400 mt-0.5">{n}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarTools;
