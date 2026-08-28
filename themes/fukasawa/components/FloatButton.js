import React, { useState, useEffect } from 'react'
import { trackSiteInteraction } from '@/lib/utils/customsDataSkillTracking'

const GIFT_DISMISS_KEY = 'fukasawa_gift_dismissed_at'
const GIFT_DISMISS_DAYS = 3
const GIFT_DISMISS_MS = GIFT_DISMISS_DAYS * 24 * 60 * 60 * 1000

/**
 * 侧边栏悬浮组件 - 修复语法错误并集成一键复制功能 + 浏览进度
 */
const FloatButton = () => {
  const [showPopup, setShowPopup] = useState(false)
  const [giftDismissed, setGiftDismissed] = useState(false)
  const [giftReady, setGiftReady] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copyText, setCopyText] = useState('复制微信号')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(GIFT_DISMISS_KEY))
      const stillDismissed = dismissedAt && Date.now() - dismissedAt < GIFT_DISMISS_MS

      if (stillDismissed) {
        setGiftDismissed(true)
      } else {
        window.localStorage.removeItem(GIFT_DISMISS_KEY)
      }
    } catch (error) {
      console.warn('Failed to read gift dismiss state:', error)
    }

    const updateFloatingState = () => {
      setShowScrollTop(window.scrollY > 150)

      const isDesktop = window.innerWidth >= 768
      const mobileRevealPoint = Math.min(520, window.innerHeight * 0.65)
      const shouldShowGift = isDesktop || window.scrollY > mobileRevealPoint

      setGiftReady(shouldShowGift)
      if (!shouldShowGift) {
        setShowPopup(false)
      }
      
      // 计算浏览进度
      const currentScrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      
      if (scrollHeight > 0) {
        const progress = Math.min((currentScrollY / scrollHeight) * 100, 100)
        setScrollProgress(progress)
      }
    }

    updateFloatingState()
    window.addEventListener('scroll', updateFloatingState, { passive: true })
    window.addEventListener('resize', updateFloatingState)
    return () => {
      window.removeEventListener('scroll', updateFloatingState)
      window.removeEventListener('resize', updateFloatingState)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 一键复制功能
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyText('已复制！')
      trackSiteInteraction({
        source: 'gift_wechat_copy',
        sourceGroup: 'lead',
        action: 'copy_wechat',
        tool: 'wechat'
      })
      setTimeout(() => setCopyText('复制微信号'), 2000)
    })
  }

  const dismissGift = event => {
    event?.stopPropagation()
    setShowPopup(false)
    setGiftDismissed(true)
    trackSiteInteraction({
      source: 'gift_widget_dismiss',
      sourceGroup: 'lead',
      action: 'dismiss_gift_widget'
    })

    try {
      window.localStorage.setItem(GIFT_DISMISS_KEY, String(Date.now()))
    } catch (error) {
      console.warn('Failed to save gift dismiss state:', error)
    }
  }

  // 圆环进度计算
  const circumference = 2 * Math.PI * 18 // 半径为 18
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

  return (
    <div className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-center space-y-4 print:hidden md:bottom-7 md:right-9 md:space-y-5 lg:bottom-8 lg:right-10">
      
      {/* 1. 返回顶部按钮 - 加进度圆环 */}
      <div 
        onClick={scrollToTop}
        className={`mb-10 w-12 h-12 bg-white/90 backdrop-blur-md text-stone-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:text-stone-800 transition-all duration-500 border border-stone-200 group relative ${showScrollTop && !showPopup ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
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
            className="text-stone-500 transition-all duration-300"
            style={{
              filter: 'drop-shadow(0 0 4px rgba(249, 115, 22, 0.6))'
            }}
          />
        </svg>

        {/* 进度数字显示 */}
        {scrollProgress > 5 && (
          <span className="absolute text-[8px] font-bold text-stone-700 dark:text-stone-300">
            {Math.round(scrollProgress)}%
          </span>
        )}

        {/* 返回顶部图标 */}
        <i className="fas fa-chevron-up text-lg group-hover:-translate-y-1 transition-transform relative z-10"></i>
      </div>

      {/* 2. 礼品包悬浮球区域 */}
      {!giftDismissed && giftReady && (
      <div className="group relative flex flex-col items-center">
        {showPopup && (
          <div className="absolute bottom-16 right-0 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-stone-900 rounded-xl md:rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-700 p-4 md:p-5 text-stone-900 dark:text-stone-100 transition-all transform scale-100 origin-bottom-right animate__animated animate__fadeInUp">
            <button
              type="button"
              aria-label="关闭资料包浮窗"
              onClick={dismissGift}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-xs text-stone-700 shadow-sm transition hover:bg-stone-100 hover:text-stone-800 md:right-2.5 md:top-2.5 md:h-6 md:w-6 md:text-[10px] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700 dark:hover:text-stone-200"
            >
              <i className="fas fa-times"></i>
            </button>
            <div className="text-center">
              <h3 className="font-black text-stone-900 dark:text-white text-sm tracking-tight">情报局长助手</h3>
              <p className="text-stone-500 dark:text-stone-400 text-xs md:text-[10px] mt-1 mb-3 leading-relaxed">
                扫码添加微信或点击下方按钮<br/>
                备注<span className="text-stone-700 font-black italic dark:text-stone-200">&quot;获客&quot;</span>领资料包
              </p>
              
              <div className="bg-stone-50 dark:bg-stone-900/40 p-2 rounded-xl mb-3 border border-stone-200 dark:border-stone-700">
                 <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-auto rounded-lg" />
              </div>

              {/* 增强功能：一键复制 */}
              <button 
                onClick={() => copyToClipboard('waimao071')}
                className="mb-3 w-full py-2 md:py-1.5 bg-stone-950 hover:bg-stone-700 text-white text-xs md:text-[10px] font-bold rounded-lg transition-colors shadow-sm"
              >
                {copyText}
              </button>

              <button 
                onClick={() => setShowPopup(false)} 
                className="text-stone-400 text-[9px] font-bold hover:text-stone-800 transition-colors uppercase tracking-[0.2em]"
              >
                [ Close ]
              </button>
            </div>
          </div>
        )}

        {!showPopup && (
          <div className="pointer-events-none absolute -top-11 right-0 hidden max-w-[calc(100vw-4rem)] whitespace-nowrap rounded-md border border-stone-700 bg-stone-900 px-3 py-1.5 text-[9px] font-bold tracking-wider text-white opacity-0 shadow-xl transition-opacity duration-200 group-hover:opacity-100 sm:block">
            领资料包 🎁
            <div className="absolute -bottom-1 right-6 w-2 h-2 rotate-45 border-r border-b border-stone-700 bg-stone-900"></div>
          </div>
        )}

        <button
          type="button"
          aria-label="关闭资料包浮窗"
          onClick={dismissGift}
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-slate-900/80 text-xs text-white shadow-md transition hover:bg-stone-700 md:-right-2 md:-top-2 md:h-5 md:w-5 md:text-[9px] dark:border-stone-700"
        >
          <i className="fas fa-times"></i>
        </button>

        <div 
          onClick={() => setShowPopup(!showPopup)}
          className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 active:scale-90 ${
            showPopup ? 'bg-[#b45309] rotate-90' : 'bg-[#d97706] shadow-md border border-white/40 animate-pulse-stone'
          }`}
        >
          <i className={`fas ${showPopup ? 'fa-times' : 'fa-gift'} text-white text-lg`}></i>
        </div>
      </div>
      )}

      <style jsx>{`
        .animate-pulse-stone {
          animation: pulse-stone 2s infinite;
        }
        @keyframes pulse-stone {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          70% { transform: scale(1.08); box-shadow: 0 0 0 12px rgba(234, 88, 12, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }
      `}</style>
    </div>
  )
}

export default FloatButton
