import React, { useState, useEffect } from 'react'

/**
 * 侧边栏悬浮组件 - 彻底解决堆叠与遮挡问题
 */
const FloatButton = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 监听滚动逻辑
  useEffect(() => {
    const handleScroll = () => {
      // 降低触发阈值，让用户尽早看到返回顶部按钮
      setShowScrollTop(window.scrollY > 150)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    // 增加最外层 bottom 距离，并将 space-y 增加到 6，拉开按钮间距
    <div className="fixed bottom-8 right-6 md:right-10 flex flex-col items-center space-y-6" style={{ zIndex: 9999 }}>
      
      {/* 1. 返回顶部按钮 - 增加过渡效果，确保它在礼品包的正上方且有足够空隙 */}
      <div 
        onClick={scrollToTop}
        className={`w-12 h-12 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:text-orange-600 transition-all duration-500 border border-gray-100 dark:border-gray-700 group ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        <i className="fas fa-chevron-up text-lg group-hover:-translate-y-1 transition-transform"></i>
      </div>

      {/* 2. 礼品包悬浮球区域 */}
      <div className="relative flex flex-col items-center">
        {/* 二维码弹窗 - 修改为向左侧或向上弹出，避免挡住上方的返回按钮 */}
        {showPopup && (
          <div className="absolute bottom-20 right-0 w-60 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-5 transition-all transform scale-100 origin-bottom-right">
            <div className="text-center">
              <h3 className="font-bold text-slate-800 dark:text-white text-md">情报局长私域</h3>
              <p className="text-gray-500 text-[10px] mt-1 mb-3 leading-relaxed">
                扫码添加微信<br/>
                备注<span className="text-orange-600 font-bold">“获客”</span>领资料包
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mb-3 border dark:border-gray-700">
                 <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-auto" />
              </div>
              <button onClick={() => setShowPopup(false)} className="text-gray-400 text-[10px] hover:text-orange-600 transition-colors uppercase tracking-widest">[ Close ]</button>
            </div>
          </div>
        )}

        {/* 提示气泡 - 缩小了一点点，减少视觉占用 */}
        {!showPopup && (
          <div className="absolute -top-10 right-0 bg-slate-800 text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap shadow-lg animate-bounce">
            领资料包 🎁
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        )}

        {/* 礼品包主按钮 */}
        <div 
          onClick={() => setShowPopup(!showPopup)}
          className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:bg-orange-700 transition-all duration-300"
          style={{ animation: 'pulse-orange 2s infinite' }}
        >
          <i className={`fas ${showPopup ? 'fa-times' : 'fa-gift'} text-white text-xl`}></i>
        </div>
      </div>

      {/* 呼吸灯动画 */}
      <style jsx>{`
        @keyframes pulse-orange {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(234, 88, 12, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }
      `}</style>
    </div>
  )
}

export default FloatButton
