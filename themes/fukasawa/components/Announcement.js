'use client'

import { useGlobal } from '@/lib/global'
import {
  trackSiteInteraction,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

const LazyNotionContent = dynamic(() => import('./LazyNotionContent'))

// 活动提醒整体关闭：24 小时内不再显示
const ANNOUNCEMENT_DISMISS_KEY = 'fukasawa_activity_announcement_dismissed_at'
const ANNOUNCEMENT_DISMISS_MS = 24 * 60 * 60 * 1000

/**
 * 侧边栏内嵌活动卡片
 */
const InlineActivityCard = ({ config, isActive }) => {
  if (!isActive) return null

  return (
    <div
      className={`group relative mb-3 overflow-hidden rounded-xl border-2 ${config.borderColor} ${config.bgColor} p-3.5 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg`}
      role='region'
    >
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${config.topBarClass}`}
        aria-hidden='true'
      />
      <div className='mb-2 flex items-start justify-between gap-2'>
        <div
          className={`flex min-w-0 items-center ${config.textColor} text-sm font-bold`}
        >
          <span
            className={`mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg shadow-sm ${config.iconBg}`}
          >
            <i className={`${config.icon} text-xs`} aria-hidden='true' />
          </span>
          <span className='line-clamp-1'>{config.title}</span>
        </div>
      </div>
      <p className='pl-10 text-xs leading-5 text-stone-700 dark:text-stone-300'>
        {config.emoji} <strong>{config.productName}</strong>{' '}
        {config.description}
      </p>
      <a
        href={config.link}
        target='_blank'
        rel='sponsored noopener noreferrer'
        onClick={() =>
          trackToolOutboundClick({
            source: `${config.trackSource}_inline`,
            target: config.link,
            tool: config.tool,
            sourceGroup: 'activity'
          })
        }
        className={`brand-btn ml-10 mt-3 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold shadow-sm ${config.buttonClass}`}
      >
        {config.buttonText} →
      </a>
    </div>
  )
}

// --- 活动配置 (统一管理) ---
const activityConfigs = {
  activity1: {
    title: '图灵搜',
    productName: '图灵搜',
    description: '双十一活动，查看活动方案与优惠信息。',
    emoji: '🎯',
    link: 'https://h.topeasysoft.com/20261111tls/index.html?i=BB54F6#pricing',
    tool: 'turingsearch',
    trackSource: 'tool_turingsearch',
    buttonText: '查看双十一活动',
    badgeText: '推荐',
    bgColor: 'bg-white dark:bg-stone-900',
    borderColor: 'border-stone-200 dark:border-stone-700',
    textColor: 'text-stone-900 dark:text-stone-100',
    iconBg: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
    badgeClass: 'bg-stone-950 text-white dark:bg-stone-300 dark:text-stone-950',
    topBarClass: 'bg-stone-700',
    buttonClass: 'brand-btn-primary',
    icon: 'fas fa-gift',
    animation: 'animate-bounce',
    // 活动结束后侧栏卡片和悬浮卡自动消失，避免过期文案长期挂着
    deadline: new Date('2026-11-30T23:59:59+08:00')
  },
  activity2: {
    title: '顶易云',
    productName: '顶易云',
    description: '双十一活动，查看活动方案与优惠信息。',
    emoji: '🔎',
    link: 'https://h.topeasysoft.com/20261111dyy/index.html?i=BB54F6',
    tool: 'dingyiyun',
    trackSource: 'tool_dingyiyun',
    buttonText: '查看双十一活动',
    badgeText: '推荐',
    bgColor: 'bg-white dark:bg-stone-900',
    borderColor: 'border-stone-300 dark:border-stone-700/80',
    textColor: 'text-stone-900 dark:text-stone-100',
    iconBg: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300',
    badgeClass: 'bg-stone-950 text-white dark:bg-stone-300 dark:text-stone-950',
    topBarClass: 'bg-stone-700',
    buttonClass: 'brand-btn-primary',
    icon: 'fas fa-fire',
    animation: 'animate-pulse',
    deadline: new Date('2026-11-30T23:59:59+08:00')
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
  const [announcementDismissed, setAnnouncementDismissed] = useState(false)
  const announcementRef = useRef(null)

  // 读取活动提醒整体关闭状态（24 小时内不再显示）
  useEffect(() => {
    try {
      const dismissedAt = Number(
        window.localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY)
      )
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
          className='rounded-xl border border-stone-200 bg-stone-50 px-2 py-3 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300'
          role='complementary'
        >
          {/* 标题栏 + 关闭按钮 */}
          <div className='mb-3 flex items-center justify-between gap-2 px-1'>
            <div className='flex items-center text-[12px] font-black tracking-wide text-stone-700 dark:text-stone-300'>
              <span className='mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-900 text-white shadow-none ring-1 ring-stone-700 dark:bg-stone-100 dark:text-stone-900 dark:ring-stone-600'>
                <i className='fas fa-star text-[11px]'></i>
              </span>
              <span>常用工具</span>
            </div>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                aria-label='关闭活动提醒'
                onClick={dismissAnnouncement}
                title='关闭活动提醒（24小时内不再显示）'
                className='flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 bg-white text-[10px] text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 dark:border-stone-800 dark:bg-stone-950/40 dark:text-stone-300 dark:hover:bg-stone-800/60'
              >
                <i className='fas fa-times' aria-hidden='true' />
              </button>
            </div>
          </div>

          {/* 活动并排/堆叠显示 */}
          <InlineActivityCard
            config={activityConfigs.activity1}
            isActive={activities.activity1}
          />
          <InlineActivityCard
            config={activityConfigs.activity2}
            isActive={activities.activity2}
          />

          {post?.blockMap && (
            <div className='mt-4 pt-4 border-t border-stone-100 dark:border-stone-800'>
              <div className='text-[11px] font-bold mb-2 text-stone-400 uppercase tracking-widest'>
                <i className='mr-2 fas fa-bullhorn' />
                {locale.COMMON.ANNOUNCEMENT}
              </div>
              <LazyNotionContent post={post} />
            </div>
          )}
        </section>
      </div>

      {/* 悬浮活动卡片：侧栏卡片和手机端跑马灯已经覆盖同一内容，
          这里不再叠加，避免遮住正文与右下角按钮 */}
    </>
  )
}

export default Announcement
