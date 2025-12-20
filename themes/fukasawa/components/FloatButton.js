import React, { useState, useEffect } from 'react'

/**
 * 侧边栏悬浮组件
 * 包含：
 * 1. 自动显示的“返回顶部”按钮
 * 2. 带有呼吸灯效果的“获客弹窗”按钮
 */
const FloatButton = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  // 监听滚动逻辑：超过200px显示返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 回到顶部函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="fixed bottom-10 right-10 flex flex-col items-end space-y-4" style={{ zIndex: 9999 }}>
      
      {/* 1. 返回顶部按钮 - 当页面向下滚动后才出现 */}
      {showScrollTop && (
        <div 
          onClick={scrollToTop}
          className="w-12 h-12 bg-white dark:bg-gray-800 text-slate-600 dark:text-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:text-orange-600 transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
        >
          <i className="fas fa-chevron-up text-lg group-hover:-translate-y-1 transition-transform"></i>
        </div>
      )}

      {/* 2. 点击后弹出的二维码卡片 */}
      {showPopup && (
        <div className="mb-4 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 transition-all transform scale-100 origin-bottom-right">
          <div className="text-center">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">情报局长私域</h3>
            <p className="text-gray-500 text-xs mt-1 mb-4 leading-relaxed">
              扫码添加微信<br/>
              备注<span className="text-orange-600 font-bold">“获客”</span>领资料包
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg mb-4 border dark:border-gray-700">
               <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-auto" />
            </div>

            <button 
              onClick={() => setShowPopup(false)}
              className="text-gray-400 text-xs hover:text-orange-600 transition-colors"
            >
              [ 关闭 ]
            </button>
          </div>
        </div>
      )}

      {/* 3. 主悬浮按钮 - 橙色呼吸灯效果 */}
      <div className="relative group">
        {/* 提示气泡 */}
        {!showPopup && (
          <div className="absolute -top-12 right-0 bg-slate-800 text-white text-xs py-2 px-4 rounded-xl whitespace-nowrap shadow-lg animate-bounce shadow-orange-900/20">
            领外贸获客资料包 🎁
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-800 rotate-45"></div>
          </div>
        )}

        <div 
          onClick={() => setShowPopup(!showPopup)}
          className="w-14 h-14 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-xl hover:bg-orange-700 transition-all duration-300"
          style={{ animation: 'pulse-orange 2s infinite' }}
        >
          <i className={`fas ${showPopup ? 'fa-times' : 'fa-gift'} text-white text-xl`}></i>
        </div>
      </div>

      {/* 呼吸灯动画样式 */}
      <style jsx>{`
        @keyframes pulse-orange {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 15px rgba(234, 88, 12, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }
      `}</style>
    </div>
  )
}

export default FloatButton
