import React, { useState, useEffect } from 'react';

const SidebarTools = () => {
  // 1. 状态管理
  const [calcMode, setCalcMode] = useState('cbm'); // cbm, unit, search
  const [dims, setDims] = useState({ l: '', w: '', h: '', pcs: '' });
  const [unitType, setUnitType] = useState('len'); // len: 长度, wt: 重量
  const [unitVal, setUnitVal] = useState('');
  const [searchKw, setSearchKw] = useState('');
  const [searchType, setSearchType] = useState('hs');

  // 2. 算柜逻辑
  const getCbmRes = () => {
    const { l, w, h, pcs } = dims;
    if (!l || !w || !h) return '---';
    const total = (parseFloat(l) * parseFloat(w) * parseFloat(h) * (pcs || 1)) / 1000000;
    return `结果: ${total.toFixed(3)} m³`;
  };

  // 3. 换算逻辑
  const getUnitRes = () => {
    if (!unitVal) return '---';
    const val = parseFloat(unitVal);
    return unitType === 'len' 
      ? `${val} in = ${(val * 2.54).toFixed(2)} cm` 
      : `${val} lb = ${(val * 0.4536).toFixed(2)} kg`;
  };

  // 4. 搜索逻辑
  const handleSearch = () => {
    if (!searchKw) return;
    const url = searchType === 'hs' 
      ? `https://www.hsbianma.com/Search?keywords=${searchKw}`
      : `https://www.google.com/search?q=${encodeURIComponent(searchKw)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col gap-3 p-3 rounded-2xl bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-lg">
      {/* 头部切换 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-black text-gray-500 uppercase tracking-tighter">常用工具</span>
        <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
          {['cbm', 'unit', 'search'].map(m => (
            <button
              key={m}
              onClick={() => setCalcMode(m)}
              className={`px-2 py-1 text-[9px] font-bold rounded-md transition-all ${
                calcMode === m ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-400'
              }`}
            >
              {m === 'cbm' ? '算柜' : m === 'unit' ? '换算' : '搜索'}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[40px] flex items-center">
        {/* 算柜界面 */}
        {calcMode === 'cbm' && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {['l', 'w', 'h', 'pcs'].map(f => (
              <input
                key={f}
                placeholder={f === 'pcs' ? '箱' : f.toUpperCase()}
                className="w-full bg-white/20 dark:bg-black/20 border border-white/20 rounded-lg p-1.5 text-[10px] outline-none focus:border-blue-500/50 transition-colors"
                value={dims[f]}
                onChange={e => setDims({ ...dims, [f]: e.target.value })}
              />
            ))}
          </div>
        )}

        {/* 换算界面 */}
        {calcMode === 'unit' && (
          <div className="flex gap-2 w-full">
            <input
              type="number"
              className="flex-1 bg-white/20 dark:bg-black/20 border border-white/20 rounded-lg p-1.5 text-[10px] outline-none"
              placeholder={unitType === 'len' ? '英寸(in)' : '磅(lb)'}
              value={unitVal}
              onChange={e => setUnitVal(e.target.value)}
            />
            <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
              <button onClick={() => setUnitType('len')} className={`px-2 py-1 text-[9px] rounded-md ${unitType === 'len' ? 'bg-white dark:bg-gray-700' : ''}`}>长</button>
              <button onClick={() => setUnitType('wt')} className={`px-2 py-1 text-[9px] rounded-md ${unitType === 'wt' ? 'bg-white dark:bg-gray-700' : ''}`}>重</button>
            </div>
          </div>
        )}

        {/* 搜索界面 */}
        {calcMode === 'search' && (
          <div className="flex gap-1.5 w-full">
            <input
              className="flex-1 bg-white/20 dark:bg-black/20 border border-white/20 rounded-lg p-1.5 text-[10px] outline-none"
              placeholder="搜索关键词..."
              value={searchKw}
              onChange={e => setSearchKw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <div className="flex bg-gray-200/50 dark:bg-gray-800/50 p-0.5 rounded-lg">
              <button onClick={() => setSearchType('hs')} className={`px-2 py-1 text-[9px] rounded-md ${searchType === 'hs' ? 'bg-white dark:bg-gray-700' : ''}`}>HS</button>
              <button onClick={() => setSearchType('google')} className={`px-2 py-1 text-[9px] rounded-md ${searchType === 'google' ? 'bg-white dark:bg-gray-700' : ''}`}>谷歌</button>
            </div>
          </div>
        )}
      </div>

      {/* 结果显示区 */}
      <div className="mt-1 text-center py-1.5 bg-blue-500/5 rounded-xl border border-blue-500/10">
        <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase">
          {calcMode === 'cbm' ? getCbmRes() : calcMode === 'unit' ? getUnitRes() : 'Ready to Search'}
        </span>
      </div>
    </div>
  );
};

export default SidebarTools;
