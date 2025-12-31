import React, { useState, useEffect } from 'react'

/**
 * 侧边栏悬浮组件 - 修复语法错误并集成一键复制功能 + 浏览进度
 */
const FloatButton = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copyText, setCopyText] = useState('复制微信号')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 150)
      
      // 计算浏览进度
      const currentScrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (scrollHeight > 0) {
        const progress = Math.min((currentScrollY / scrollHeight) * 100, 100)
        setScrollProgress(progress)
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 一键复制功能
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyText('已复制！')
      setTimeout(() => setCopyText('复制微信号'), 2000)
    })
  }

  // 圆环进度计算
  const circumference = 2 * Math.PI * 18 // 半径为 18
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <div className="fixed bottom-8 right-6 md:right-10 flex flex-col items-center space-y-6" style={{ zIndex: 9999 }}>  
      
      {/* 1. 返回顶部按钮 - 加进度圆环 */}
      <div 
        onClick={scrollToTop}
        className={`mb-10 w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-slate-600 dark:text-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:text-orange-600 transition-all duration-500 border border-white/20 dark:border-gray-700 group relative ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* 进度圆环背景 */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90"
          style={{ opacity: 0.3 }}
        >
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        {/* 进度圆环 - 动态 */}
        <svg 
          className="absolute inset-0 w-full h-full -rotate-90 transition-all duration-300"
          style={{ opacity: scrollProgress > 5 ? 1 : 0 }}
        >
          <circle
            cx="24"
            cy="24"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="text-orange-500 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))'
            }}
          />
        </svg>

        {/* 进度数字显示 */}
        {scrollProgress > 5 && (
          <span className="absolute text-[8px] font-bold text-orange-600 dark:text-orange-400">
            {Math.round(scrollProgress)}%
          </span>
        )}

        {/* 返回顶部图标 */}
        <i className="fas fa-chevron-up text-lg group-hover:-translate-y-1 transition-transform relative z-10"></i>
      </div>

      {/* 2. 礼品包悬浮球区域 */}
      <div className="relative flex flex-col items-center">
        {showPopup && (
          <div className="absolute bottom-16 right-0 w-56 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl border border-white/20 dark:border-gray-800 p-5 transition-all transform scale-100 origin-bottom-right animate__animated animate__fadeInUp">
            <div className="text-center">
              <h3 className="font-black text-slate-800 dark:text-white text-sm tracking-tight">情报局长助手</h3>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] mt-1 mb-3 leading-relaxed">
                扫码添加微信或点击下方按钮<br/>
                备注<span className="text-orange-600 font-black italic">"获客"</span>领资料包
              </p>
              
              <div className="bg-white dark:bg-black/20 p-2 rounded-xl mb-3 border border-gray-100 dark:border-gray-800 shadow-inner">
                 <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-auto rounded-lg" />
              </div>

              {/* 增强功能：一键复制 */}
              <button 
                onClick={() => copyToClipboard('waimao071')}
                className="mb-3 w-full py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-bold rounded-lg transition-colors shadow-sm"
              >
                {copyText}
              </button>

              <button 
                onClick={() => setShowPopup(false)} 
                className="text-gray-400 text-[9px] font-bold hover:text-orange-600 transition-colors uppercase tracking-[0.2em]"
              >
                [ Close ]
              </button>
            </div>
          </div>
        )}

        {!showPopup && (
          <div className="absolute -top-10 right-0 backdrop-blur-md bg-slate-900/80 text-white text-[9px] py-1.5 px-3 rounded-full whitespace-nowrap shadow-xl animate-bounce border border-white/10 font-bold tracking-wider">
            领资料包 🎁
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-slate-900/80 rotate-45 border-r border-b border-white/10"></div>
          </div>
        )}

        <div 
          onClick={() => setShowPopup(!showPopup)}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 active:scale-90 ${
            showPopup ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-tr from-orange-600 to-orange-400 shadow-orange-500/30 animate-pulse-orange'
          }`}
        >
          <i className={`fas ${showPopup ? 'fa-times' : 'fa-gift'} text-white text-lg`}></i>
        </div>
      </div>

      <style jsx>{`
        .animate-pulse-orange {
          animation: pulse-orange 2s infinite;
        }
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
