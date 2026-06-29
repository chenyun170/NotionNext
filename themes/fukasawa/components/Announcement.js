'use client'

import { useGlobal } from '@/lib/global'
import {
  trackSiteInteraction,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const FLOATING_AD_DISMISS_KEY = 'fukasawa_floating_activity_dismissed_at'
const FLOATING_AD_DISMISS_DAYS = 3
const FLOATING_AD_DISMISS_MS = FLOATING_AD_DISMISS_DAYS * 24 * 60 * 60 * 1000

/**
 * 悬浮活动卡片 - 毛玻璃版
 */
const FloatingActivityCard = ({ config, isActive, isVisible, onDismiss }) => {
  if (!isActive) return null

  return (
    <div 
      className={`fixed bottom-48 right-6 z-[70] w-72 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[400px] opacity-0 pointer-events-none'
      }`}>
      
      {/* 核心毛玻璃容器 */}
      <div className={`relative overflow-hidden p-5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md bg-white/70 dark:bg-[#1a1a1a]/70`}>
        <button
          type='button'
          aria-label='关闭活动广告'
          onClick={onDismiss}
          className='absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[11px] text-gray-500 shadow-sm transition hover:bg-orange-50 hover:text-orange-600 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-orange-300'
        >
          <i className='fas fa-times' aria-hidden='true' />
        </button>
        
        {/* 装饰性背景光晕 */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
        
        {/* 内容区域 */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">
              Limited Offer
            </span>
            <i className="fas fa-bullhorn text-orange-500 animate-bounce text-xs"></i>
          </div>
          
          <h3 className="text-sm font-black text-gray-800 dark:text-white mb-2 leading-tight">
            {config.title || '图灵搜618优惠'}
          </h3>
          
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            🔥 不仅价格便宜， <span className="text-orange-600 font-bold">还赠送功能!</span>
          </p>
          
          <a 
            href={config.link}
            target='_blank'
            rel='sponsored noopener noreferrer'
            onClick={() =>
              trackToolOutboundClick({
                source: config.trackSource,
                target: config.link,
                tool: config.tool,
                sourceGroup: 'activity'
              })
            }
            className="block w-full py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-center text-xs font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all active:scale-95"
          >
            立即参与 <i className="fas fa-arrow-right ml-1"></i>
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * 侧边栏内嵌活动卡片
 */
const InlineActivityCard = ({ config, isActive }) => {
  if (!isActive) return null

  return (
    <div
      className={`group mb-3 rounded-xl border ${config.borderColor} ${config.bgColor} p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
      role="region">
      <div className='mb-2 flex items-start justify-between gap-2'>
        <div className={`flex min-w-0 items-center ${config.textColor} font-bold text-sm`}>
          <span className={`mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
            <i className={`${config.icon} text-xs`} aria-hidden="true" />
          </span>
          <span className='line-clamp-1'>{config.title}</span>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${config.badgeClass}`}>
          限时
        </span>
      </div>
      <p className='pl-9 text-xs leading-5 text-zinc-600 dark:text-zinc-400'>
        {config.emoji} <strong>{config.productName}</strong> {config.description}
      </p>
      <a 
        href={config.link} 
        target="_blank" 
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackToolOutboundClick({
            source: `${config.trackSource}_inline`,
            target: config.link,
            tool: config.tool,
            sourceGroup: 'activity'
          })
        }
        className={`ml-9 mt-3 inline-flex items-center rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors ${config.buttonClass}`}>
        {config.buttonText} →
      </a>
    </div>
  )
}

// --- 活动配置 (统一管理) ---
const activityConfigs = {
  activity1: {
    deadline: new Date('2026-07-01T00:00:00+08:00'),
    title: '618图灵搜优惠',
    productName: '外贸获客工具',
    description: '价格便宜，功能升级！',
    emoji: '🔥',
    link: 'https://h.topeasysoft.com/20260618tls/index.html?i=BB54F6',
    tool: 'turingsearch',
    trackSource: 'activity_turingsearch',
    buttonText: '立即参与',
    bgColor: 'bg-amber-50/45 dark:bg-amber-950/20',
    borderColor: 'border-amber-100 dark:border-amber-900/50',
    textColor: 'text-amber-700 dark:text-amber-300',
    iconBg: 'bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    badgeClass: 'bg-amber-100/70 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    buttonClass: 'border-amber-200 bg-white/70 text-amber-700 hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/20 dark:text-amber-300 dark:hover:bg-amber-950/50',
    icon: 'fas fa-gift',
    animation: 'animate-bounce'
  },
  activity2: {
    deadline: new Date('2026-07-01T00:00:00+08:00'),
    title: '活动二：顶易云618活动',
    productName: '高阶获客工具',
    description: '限时赠送功能升级！',
    emoji: '🚀',
    link: 'https://h.topeasysoft.com/20260618dyy/index.html?i=BB54F6',
    tool: 'dingyiyun',
    trackSource: 'activity_dingyiyun',
    buttonText: '查看详情',
    bgColor: 'bg-blue-50/45 dark:bg-blue-950/20',
    borderColor: 'border-blue-100 dark:border-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badgeClass: 'bg-blue-100/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    buttonClass: 'border-blue-200 bg-white/70 text-blue-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-300 dark:hover:bg-blue-950/50',
    icon: 'fas fa-fire',
    animation: 'animate-pulse'
  }
}

const getActiveActivities = () => {
  const now = new Date()
  const activeActivities = {}
  Object.keys(activityConfigs).forEach(key => {
    activeActivities[key] = now < activityConfigs[key].deadline
  })
  return activeActivities
}

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
  const [activities, setActivities] = useState(getActiveActivities)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const [floatingDismissed, setFloatingDismissed] = useState(false)
  const announcementRef = useRef(null)

  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(FLOATING_AD_DISMISS_KEY))
      const stillDismissed = dismissedAt && Date.now() - dismissedAt < FLOATING_AD_DISMISS_MS

      if (stillDismissed) {
        setFloatingDismissed(true)
      } else {
        window.localStorage.removeItem(FLOATING_AD_DISMISS_KEY)
      }
    } catch (error) {
      console.warn('Failed to read floating activity dismiss state:', error)
    }
  }, [])

  useEffect(() => {
    const checkActivityDeadlines = () => {
      setActivities(getActiveActivities())
    }

    checkActivityDeadlines()
    const timer = setInterval(checkActivityDeadlines, 60000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!announcementRef.current) return
      const announcementRect = announcementRef.current.getBoundingClientRect()
      
      // 当侧边栏内的活动卡片滚出视野后显示悬浮版
      const isOutOfView = announcementRect.bottom < 0
      
      // 检查屏幕宽度，防止在窄屏遮挡内容
      const isWideScreen = typeof window !== 'undefined' && window.innerWidth > 1024
      
      setFloatingVisible(!floatingDismissed && isOutOfView && isWideScreen && (activities.activity1 || activities.activity2))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activities, floatingDismissed])

  const dismissFloatingAd = () => {
    setFloatingVisible(false)
    setFloatingDismissed(true)
    trackSiteInteraction({
      source: 'activity_floating_dismiss',
      sourceGroup: 'activity',
      action: 'dismiss_activity_ad'
    })

    try {
      window.localStorage.setItem(FLOATING_AD_DISMISS_KEY, String(Date.now()))
    } catch (error) {
      console.warn('Failed to save floating activity dismiss state:', error)
    }
  }

  return (
    <>
      <div className={className} ref={announcementRef}>
        <section 
          id='announcement-wrapper' 
          className="dark:text-gray-300 rounded-xl px-1 py-2"
          role="complementary">
          
          {/* 活动并排/堆叠显示 */}
          <InlineActivityCard config={activityConfigs.activity1} isActive={activities.activity1} />
          <InlineActivityCard config={activityConfigs.activity2} isActive={activities.activity2} />

          {post?.blockMap && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className='text-[11px] font-bold mb-2 text-gray-400 uppercase tracking-widest'>
                <i className='mr-2 fas fa-bullhorn' />
                {locale.COMMON.ANNOUNCEMENT}
              </div>
              <NotionPage post={post} />
            </div>
          )}
        </section>
      </div>

      {/* 悬浮活动卡片 - 仅在活动有效且滚动到下方时显示 */}
      {activities.activity1 && (
        <FloatingActivityCard 
          config={activityConfigs.activity1} 
          isActive={activities.activity1}
          isVisible={floatingVisible} 
          onDismiss={dismissFloatingAd}
        />
      )}
    </>
  )
}

export default Announcement
