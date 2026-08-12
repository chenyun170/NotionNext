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
      
      {/* 悬浮促销卡：实色暖橙，比侧栏更抢眼 */}
      <div className='relative overflow-hidden rounded-2xl border-2 border-orange-400/80 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 p-5 shadow-[0_12px_40px_rgba(234,88,12,0.35)] dark:border-orange-500/70 dark:from-orange-700 dark:via-amber-700 dark:to-orange-800'>
        <div className='pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/20 blur-xl' aria-hidden='true' />
        <div className='pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-amber-200/30 blur-lg' aria-hidden='true' />
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
          className='absolute right-2 top-2 z-[60] flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/25 text-[11px] text-white shadow-sm transition hover:bg-white/40 active:scale-95'
        >
          <i className='fas fa-times' aria-hidden='true' />
        </button>

        {/* 内容区域 */}
        <div className='relative z-10'>
          <div className='mb-3 flex items-center justify-between'>
            <span className='rounded-md bg-white px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-orange-600 shadow-sm'>
              限时活动
            </span>
            <i className='fas fa-bullhorn animate-bounce text-xs text-white/90'></i>
          </div>

          <h3 className='mb-2 text-sm font-black leading-tight text-white drop-shadow-sm'>
            {config.title || '图灵搜免费体验'}
          </h3>

          <p className='mb-4 text-[11px] leading-relaxed text-orange-50/95'>
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
            className='inline-flex w-full items-center justify-center rounded-lg bg-white py-2.5 text-xs font-bold text-orange-600 shadow-md transition hover:bg-orange-50 active:scale-[0.98]'
          >
            {config.buttonText || '去看看'} <i className='fas fa-arrow-right ml-1'></i>
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
      className={`group relative mb-3 overflow-hidden rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
      role="region">
      <div className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${config.topBarClass}`} aria-hidden='true' />
      <div className='mb-2 flex items-start justify-between gap-2'>
        <div className={`flex min-w-0 items-center ${config.textColor} text-sm font-bold`}>
          <span className={`mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ${config.iconBg}`}>
            <i className={`${config.icon} text-xs`} aria-hidden="true" />
          </span>
          <span className='line-clamp-1'>{config.title}</span>
        </div>
        <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide shadow-sm ${config.badgeClass}`}>
          {config.badgeText || '入口'}
        </span>
      </div>
      <p className='pl-10 text-xs leading-5 text-stone-700 dark:text-stone-300'>
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
        className={`brand-btn ml-10 mt-3 px-3 py-1.5 text-[11px] font-bold shadow-sm ${config.buttonClass}`}>
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
    badgeText: 'HOT',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-100/90 dark:from-orange-950/50 dark:to-amber-950/40',
    borderColor: 'border-orange-300 dark:border-orange-700/80',
    textColor: 'text-orange-800 dark:text-orange-200',
    iconBg: 'bg-orange-500 text-white dark:bg-orange-600',
    badgeClass: 'bg-orange-500 text-white dark:bg-orange-600',
    topBarClass: 'bg-gradient-to-r from-orange-500 to-amber-400',
    buttonClass: 'brand-btn-primary',
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
    badgeText: '限时',
    bgColor: 'bg-gradient-to-br from-amber-50 to-orange-100/90 dark:from-amber-950/45 dark:to-orange-950/40',
    borderColor: 'border-amber-300 dark:border-amber-700/80',
    textColor: 'text-amber-900 dark:text-amber-200',
    iconBg: 'bg-amber-600 text-white dark:bg-amber-500',
    badgeClass: 'bg-amber-600 text-white dark:bg-amber-500',
    topBarClass: 'bg-gradient-to-r from-amber-500 to-orange-400',
    buttonClass: 'brand-btn-primary',
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
          className="rounded-xl border border-orange-200/80 bg-gradient-to-b from-orange-50/90 to-amber-50/50 px-2 py-3 dark:border-orange-900/50 dark:from-orange-950/30 dark:to-amber-950/20 dark:text-stone-300"
          role="complementary">

          {/* 标题栏 + 关闭按钮 */}
          <div className="mb-3 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center text-[12px] font-black tracking-wide text-orange-700 dark:text-orange-300">
              <span className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm ring-2 ring-orange-200 dark:bg-orange-600 dark:ring-orange-800">
                <i className="fas fa-bullhorn text-[11px]"></i>
              </span>
              <span>活动提醒</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-black text-white shadow-sm dark:bg-orange-600">
                818 进行中
              </span>
              <button
                type='button'
                aria-label='关闭活动提醒'
                onClick={dismissAnnouncement}
                title='关闭活动提醒（24小时内不再显示）'
                className="flex h-7 w-7 items-center justify-center rounded-full border border-orange-200 bg-white text-[10px] text-orange-600 transition hover:bg-orange-100 hover:text-orange-800 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300 dark:hover:bg-orange-900/50"
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* 活动并排/堆叠显示 */}
          <InlineActivityCard config={activityConfigs.activity1} isActive={activities.activity1} />
          <InlineActivityCard config={activityConfigs.activity2} isActive={activities.activity2} />

          {post?.blockMap && (
            <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800">
              <div className='text-[11px] font-bold mb-2 text-stone-400 uppercase tracking-widest'>
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
