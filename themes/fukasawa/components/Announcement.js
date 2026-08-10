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

// 活动提醒整体关闭：24 小时内不再显示
const ANNOUNCEMENT_DISMISS_KEY = 'fukasawa_activity_announcement_dismissed_at'
const ANNOUNCEMENT_DISMISS_MS = 24 * 60 * 60 * 1000

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
          aria-label='关闭工具入口'
          onClick={() => {
            try {
              window.localStorage.setItem(FLOATING_AD_DISMISS_KEY, Date.now().toString())
            } catch (e) {
              console.warn('[FloatingActivityCard] localStorage failed:', e)
            }
            onDismiss()
          }}
          className='absolute right-2 top-2 z-[60] flex h-11 w-11 items-center justify-center rounded-full border border-white/60 bg-white/90 text-[11px] text-gray-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 active:scale-95 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-300'
        >
          <i className='fas fa-times' aria-hidden='true' />
        </button>

        {/* 内容区域 */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-md uppercase tracking-tighter">
              先试一下
            </span>
            <i className="fas fa-bullhorn text-cyan-600 animate-bounce text-xs"></i>
          </div>
          
          <h3 className="text-sm font-black text-gray-800 dark:text-white mb-2 leading-tight">
            {config.title || '图灵搜免费体验'}
          </h3>
          
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            {config.floatingDescription || '找到客户后，先用数据确认它是不是真的在买。'}
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
            className="brand-btn brand-btn-primary w-full py-2.5 text-xs"
          >
            {config.buttonText || '去看看'} <i className="fas fa-arrow-right ml-1"></i>
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
          {config.badgeText || '入口'}
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
        className={`brand-btn ml-9 mt-3 px-2.5 py-1.5 text-[11px] ${config.buttonClass}`}>
        {config.buttonText} →
      </a>
    </div>
  )
}

// --- 活动配置 (统一管理) ---
const activityConfigs = {
  activity1: {
    title: '818活动图灵搜升级ORA',
    productName: '图灵搜升级ORA',
    description: '818活动期间，图灵搜升级ORA享专属优惠，先到先得。',
    floatingDescription: '818活动期间，图灵搜升级ORA，海关数据+AI开发一条龙。',
    emoji: '🎯',
    link: 'https://h.topeasysoft.com/20260818tls/index.html?i=BB54F6',
    tool: 'turingsearch',
    trackSource: 'activity_turingsearch',
    buttonText: '立即参与',
    badgeText: '先试',
    bgColor: 'bg-cyan-50/45 dark:bg-cyan-950/20',
    borderColor: 'border-cyan-100 dark:border-cyan-900/50',
    textColor: 'text-cyan-700 dark:text-cyan-300',
    iconBg: 'bg-cyan-100/80 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    badgeClass: 'bg-cyan-100/70 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
    buttonClass: 'brand-btn-accent',
    icon: 'fas fa-gift',
    animation: 'animate-bounce'
  },
  activity2: {
    title: '818顶易云ora',
    productName: '顶易云',
    description: '818活动，顶易云+OraAgent联合特惠，外贸开发效率翻倍。',
    floatingDescription: '818活动，顶易云+OraAgent联合特惠，外贸开发效率翻倍。',
    emoji: '☁️',
    link: 'https://h.topeasysoft.com/20260818dyy/index.html?i=BB54F6',
    tool: 'dingyiyun',
    trackSource: 'activity_dingyiyun',
    buttonText: '限时领取',
    badgeText: '工具',
    bgColor: 'bg-blue-50/45 dark:bg-blue-950/20',
    borderColor: 'border-blue-100 dark:border-blue-900/50',
    textColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100/80 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    badgeClass: 'bg-blue-100/70 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    buttonClass: 'brand-btn-secondary',
    icon: 'fas fa-fire',
    animation: 'animate-pulse'
  }
}

const getActiveActivities = () => {
  const now = new Date()
  const activeActivities = {}
  Object.keys(activityConfigs).forEach(key => {
    activeActivities[key] =
      !activityConfigs[key].deadline || now < activityConfigs[key].deadline
  })
  return activeActivities
}

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
  const [activities, setActivities] = useState(getActiveActivities)
  const [floatingVisible, setFloatingVisible] = useState(false)
  const [floatingDismissed, setFloatingDismissed] = useState(false)
  const [announcementDismissed, setAnnouncementDismissed] = useState(false)
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

  // 读取活动提醒整体关闭状态（24 小时内不再显示）
  useEffect(() => {
    try {
      const dismissedAt = Number(window.localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY))
      if (dismissedAt && Date.now() - dismissedAt < ANNOUNCEMENT_DISMISS_MS) {
        setAnnouncementDismissed(true)
      }
    } catch (error) {
      console.warn('Failed to read announcement dismiss state:', error)
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
      
      // 不限制屏幕宽度：移动端只要滚动也会显示悬浮活动卡
      setFloatingVisible(!floatingDismissed && isOutOfView && (activities.activity1 || activities.activity2))
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

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true)
    trackSiteInteraction({
      source: 'activity_announcement_dismiss',
      sourceGroup: 'activity',
      action: 'dismiss_announcement'
    })

    try {
      window.localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, String(Date.now()))
    } catch (error) {
      console.warn('Failed to save announcement dismiss state:', error)
    }
  }

  // 用户点击关闭后，整个活动提醒（内嵌 + 悬浮）24 小时内不再显示
  if (announcementDismissed) return null

  return (
    <>
      <div className={className} ref={announcementRef}>
        <section 
          id='announcement-wrapper' 
          className="dark:text-gray-300 rounded-xl px-1 py-2"
          role="complementary">

          {/* 标题栏 + 关闭按钮 */}
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center text-[11px] font-bold text-amber-700 dark:text-amber-300 tracking-[0.18em] uppercase">
              <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900/60">
                <i className="fas fa-bullhorn text-[10px]"></i>
              </span>
              <span>活动提醒</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex rounded-full border border-amber-100 bg-amber-50/70 px-2 py-1 text-[10px] font-semibold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                工具情报
              </span>
              <button
                type='button'
                aria-label='关闭活动提醒'
                onClick={dismissAnnouncement}
                title='关闭活动提醒（24小时内不再显示）'
                className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-100 bg-amber-50/70 text-[10px] text-amber-600 transition hover:bg-amber-100 hover:text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/50 dark:hover:text-amber-200"
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>
          </div>

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
