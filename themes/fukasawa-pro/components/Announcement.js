'use client'

import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

/**
 * 悬浮活动卡片 - 高级毛玻璃版
 */
const FloatingActivityCard = ({ config, isActive, isVisible }) => {
  if (!isActive) return null

  return (
    <div 
      className={`fixed bottom-48 right-6 z-[70] w-72 transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[400px] opacity-0 pointer-events-none'
      }`}>
      
      {/* 核心毛玻璃容器 */}
      <div className={`relative overflow-hidden p-5 rounded-2xl border border-white/20 shadow-2xl backdrop-blur-md bg-white/70 dark:bg-[#1a1a1a]/70`}>
        
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
            {config.title || '活动一：图灵搜岁末活动'}
          </h3>
          
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
            🔥 外贸获客工具 原价 ¥2180，现仅需 <span className="text-orange-600 font-bold">¥1600!</span>
          </p>
          
          <a 
            href={config.link}
            target='_blank'
            rel='noopener noreferrer'
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
      className={`mb-4 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg shadow-sm border-dashed`}
      role="region">
      <div className={`flex items-center ${config.textColor} font-bold text-sm mb-1`}>
        <i className={`${config.icon} mr-2 ${config.animation}`} aria-hidden="true" />
        <span>{config.title}</span>
      </div>
      <p className='text-xs text-gray-700 dark:text-gray-300'>
        {config.emoji} <strong>{config.productName}</strong> {config.description}
      </p>
      <a 
        href={config.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className={`inline-block ${config.buttonBg} text-white text-[10px] px-2 py-1 rounded mt-2 ${config.buttonHover} transition-colors`}>
        {config.buttonText} →
      </a>
    </div>
  )
}

// --- 活动配置 (统一管理) ---
const activityConfigs = {
  activity1: {
    deadline: new Date('2025-12-31T23:59:59+08:00'),
    title: '活动一：图灵搜岁末活动',
    productName: '外贸获客工具',
    description: '原价 ¥2180，现仅需 ¥1600！',
    emoji: '🔥',
    link: 'http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6',
    buttonText: '立即参与',
    bgColor: 'bg-orange-50/95 dark:bg-orange-950/80',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    buttonBg: 'bg-orange-500',
    buttonHover: 'hover:bg-orange-600',
    icon: 'fas fa-gift',
    animation: 'animate-bounce'
  },
  activity2: {
    deadline: new Date('2025-12-31T23:59:59+08:00'),
    title: '活动二：顶易云岁末活动',
    productName: '高阶获客工具',
    description: '限时赠送社媒搜索工具！',
    emoji: '🚀',
    link: 'http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6',
    buttonText: '查看详情',
    bgColor: 'bg-blue-50/95 dark:bg-blue-950/80',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    buttonBg: 'bg-blue-500',
    buttonHover: 'hover:bg-blue-600',
    icon: 'fas fa-fire',
    animation: 'animate-pulse'
  }
}

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
  const [activities, setActivities] = useState({ activity1: false, activity2: false })
  const [floatingVisible, setFloatingVisible] = useState(false)
  const announcementRef = useRef(null)

  useEffect(() => {
    const now = new Date()
    const newActivities = {}
    Object.keys(activityConfigs).forEach(key => {
      newActivities[key] = now < activityConfigs[key].deadline
    })
    setActivities(newActivities)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!announcementRef.current) return
      const announcementRect = announcementRef.current.getBoundingClientRect()
      
      // 当侧边栏内的活动卡片滚出视野后显示悬浮版
      const isOutOfView = announcementRect.bottom < 0
      
      // 检查屏幕宽度，防止在窄屏遮挡内容
      const isWideScreen = typeof window !== 'undefined' && window.innerWidth > 1024
      
      setFloatingVisible(isOutOfView && isWideScreen && (activities.activity1 || activities.activity2))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activities])

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
        />
      )}
    </>
  )
}

export default Announcement
