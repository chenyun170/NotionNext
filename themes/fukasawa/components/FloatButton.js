import React, { useState, useEffect } from 'react'
import { trackSiteInteraction } from '@/lib/utils/customsDataSkillTracking'

const GIFT_DISMISS_KEY = 'fukasawa_gift_dismissed_at'
const GIFT_DISMISS_DAYS = 3
const GIFT_DISMISS_MS = GIFT_DISMISS_DAYS * 24 * 60 * 60 * 1000

/**
 * 统一悬浮交互坞（右下角）：
 * 1. AI 参谋入口
 * 2. 资料包 / 微信交流弹窗（可关闭 3 天）
 * 3. 返回顶部进度按钮
 */
const FloatButton = ({ onOpenChat }) => {
  const [showPopup, setShowPopup] = useState(false)
  const [giftDismissed, setGiftDismissed] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [copyText, setCopyText] = useState('复制微信号')
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(GIFT_DISMISS_KEY))
      const stillDismissed =
        dismissedAt && Date.now() - dismissedAt < GIFT_DISMISS_MS
      if (stillDismissed) {
        setGiftDismissed(true)
      } else {
        window.localStorage.removeItem(GIFT_DISMISS_KEY)
      }
    } catch {
      // ignore storage errors
    }

    const updateFloatingState = () => {
      const y = window.scrollY
      setShowScrollTop(y > 220)
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setScrollProgress(Math.min((y / scrollHeight) * 100, 100))
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

  const copyToClipboard = text => {
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
    } catch {
      // ignore storage error
    }
  }

  const circumference = 2 * Math.PI * 16
  const strokeDashoffset =
    circumference - (scrollProgress / 100) * circumference

  return (
    <div className='fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[80] flex flex-col items-end gap-2.5 print:hidden sm:bottom-6 sm:right-6'>
      {/* 微信资料包弹窗 */}
      {showPopup && !giftDismissed && (
        <div className='w-60 max-w-[calc(100vw-2rem)] rounded-2xl border border-stone-200 bg-white p-4 text-stone-900 shadow-2xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-xs font-bold text-stone-900 dark:text-stone-100'>
              外贸交流 · 领资料包
            </span>
            <button
              type='button'
              aria-label='关闭资料包浮窗'
              onClick={dismissGift}
              className='flex h-6 w-6 items-center justify-center rounded-full text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200'
            >
              <i className='fas fa-times' />
            </button>
          </div>
          <p className='mb-3 text-xs leading-relaxed text-stone-500 dark:text-stone-400'>
            扫码添加微信，备注{' '}
            <strong className='text-[#1c5a4a] dark:text-[#6bc4a6]'>
              “获客”
            </strong>{' '}
            领取实操资料包
          </p>
          <div className='mb-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 p-2 dark:border-stone-700 dark:bg-stone-800/40'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src='/wechat-qr.png'
              alt='微信二维码'
              className='h-auto w-full rounded-lg'
            />
          </div>
          <button
            type='button'
            onClick={() => copyToClipboard('waimao071')}
            className='w-full rounded-lg bg-[#1c5a4a] py-2 text-xs font-semibold text-white transition hover:bg-[#14453a]'
          >
            {copyText}（waimao071）
          </button>
        </div>
      )}

      {/* 统一操作条 */}
      <div className='flex items-center gap-2'>
        {showScrollTop && (
          <button
            type='button'
            onClick={scrollToTop}
            aria-label='返回顶部'
            className='relative flex h-10 w-10 items-center justify-center rounded-full border border-stone-200/90 bg-white/95 text-stone-600 shadow-md backdrop-blur-md transition hover:border-stone-300 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-300'
          >
            <svg className='absolute inset-0 h-full w-full -rotate-90' viewBox='0 0 40 40'>
              <circle
                cx='20'
                cy='20'
                r='16'
                fill='none'
                stroke='currentColor'
                strokeOpacity='0.15'
                strokeWidth='2'
              />
              <circle
                cx='20'
                cy='20'
                r='16'
                fill='none'
                stroke='#1c5a4a'
                strokeWidth='2'
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap='round'
              />
            </svg>
            <i className='fas fa-arrow-up relative z-10 text-xs' />
          </button>
        )}

        {!giftDismissed && (
          <button
            type='button'
            onClick={() => setShowPopup(prev => !prev)}
            aria-label='外贸资料包与微信联系'
            className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold shadow-md backdrop-blur-md transition ${
              showPopup
                ? 'border-[#1c5a4a] bg-[#1c5a4a] text-white'
                : 'border-stone-200/90 bg-white/95 text-stone-700 hover:border-[#1c5a4a]/50 hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900/95 dark:text-stone-200'
            }`}
          >
            <i className='fab fa-weixin text-sm text-[#1c5a4a] dark:text-[#6bc4a6]' />
            <span className='hidden sm:inline'>资料包</span>
          </button>
        )}

        {onOpenChat && (
          <button
            type='button'
            onClick={onOpenChat}
            aria-label='打开 AI 参谋'
            className='ai-assistant-btn inline-flex h-10 items-center gap-2 rounded-full border border-[#e8c9a8]/80 bg-gradient-to-br from-[#d29a63] to-[#b97a52] px-4 text-xs font-bold text-white shadow-lg transition hover:scale-[1.03] hover:from-[#c98a58] hover:to-[#a96a45] active:scale-95'
          >
            <i className='fas fa-robot text-sm' />
            <span>AI 参谋</span>
          </button>
        )}
      </div>
    </div>
  )
}

export default FloatButton
