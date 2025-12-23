import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

/**
 * 活动卡片组件 - 复用逻辑
 */
const ActivityCard = ({ config, isActive }) => {
  if (!isActive) return null

  return (
    <div 
      className={`mb-4 p-3 ${config.bgColor} border ${config.borderColor} rounded-lg shadow-sm border-dashed`}
      role="region"
      aria-label={`${config.title}活动信息`}>
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
        aria-label={`参与${config.title}活动`}
        className={`inline-block ${config.buttonBg} text-white text-[10px] px-2 py-1 rounded mt-2 ${config.buttonHover} transition-colors`}>
        {config.buttonText} →
      </a>
    </div>
  )
}

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()
  const [activities, setActivities] = useState({
    activity1: false,
    activity2: false
  })

  useEffect(() => {
    const now = new Date()

    // --- 活动配置（统一管理） ---
    const activityConfigs = {
      activity1: {
        // 使用明确的时区（北京时间 UTC+8）
        deadline: new Date('2025-12-31T23:59:59+08:00'),
        title: '活动一：图灵搜岁末活动',
        productName: '外贸获客工具',
        description: '原价 ¥2180，现仅需 ¥1600！限时：2025.12.31',
        emoji: '🔥',
        link: 'http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6',
        buttonText: '立即参与',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
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
        description: '限时赠送社媒搜索工具、138届广交会名录！限时：2025.12.31',
        emoji: '🚀',
        link: 'http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6',
        buttonText: '查看详情',
        bgColor: 'bg-blue-50 dark:bg-blue-950/30',
        borderColor: 'border-blue-200 dark:border-blue-800',
        textColor: 'text-blue-600 dark:text-blue-400',
        buttonBg: 'bg-blue-500',
        buttonHover: 'hover:bg-blue-600',
        icon: 'fas fa-fire',
        animation: 'animate-pulse'
      }
    }

    // 检查活动是否在有效期内
    const newActivities = {}
    Object.keys(activityConfigs).forEach(key => {
      newActivities[key] = now < activityConfigs[key].deadline
    })
    
    setActivities(newActivities)

    // 可选：在控制台显示倒计时信息（开发调试用）
    if (process.env.NODE_ENV === 'development') {
      Object.keys(activityConfigs).forEach(key => {
        const config = activityConfigs[key]
        const timeLeft = config.deadline - now
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        console.log(`${config.title}: ${daysLeft}天后结束`)
      })
    }
  }, [])

  // 活动配置（用于渲染）
  const activityConfigs = {
    activity1: {
      title: '活动一：图灵搜岁末活动',
      productName: '外贸获客工具',
      description: '原价 ¥2180，现仅需 ¥1600！限时：2025.12.31',
      emoji: '🔥',
      link: 'http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6',
      buttonText: '立即参与',
      bgColor: 'bg-orange-50 dark:bg-orange-950/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      textColor: 'text-orange-600 dark:text-orange-400',
      buttonBg: 'bg-orange-500',
      buttonHover: 'hover:bg-orange-600',
      icon: 'fas fa-gift',
      animation: 'animate-bounce'
    },
    activity2: {
      title: '活动二：顶易云岁末活动',
      productName: '高阶获客工具',
      description: '限时赠送社媒搜索工具、138届广交会名录！限时：2025.12.31',
      emoji: '🚀',
      link: 'http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6',
      buttonText: '查看详情',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-600 dark:text-blue-400',
      buttonBg: 'bg-blue-500',
      buttonHover: 'hover:bg-blue-600',
      icon: 'fas fa-fire',
      animation: 'animate-pulse'
    }
  }

  return (
    <div className={className}>
      <section 
        id='announcement-wrapper' 
        className="dark:text-gray-300 rounded-xl px-2 py-4"
        role="complementary"
        aria-label="活动公告区域">
        
        {/* 渲染活动卡片 */}
        <ActivityCard 
          config={activityConfigs.activity1} 
          isActive={activities.activity1} 
        />
        <ActivityCard 
          config={activityConfigs.activity2} 
          isActive={activities.activity2} 
        />

        {/* 原有的 Notion 公告内容 */}
        {post?.blockMap && (
          <>
            <div className='text-sm font-bold mb-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-gray-400 dark:text-gray-500'>
              <i className='mr-2 fas fa-bullhorn' aria-hidden="true" />
              {locale.COMMON.ANNOUNCEMENT}
            </div>
            <div id="announcement-content">
              <NotionPage post={post} className='text-center' />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default Announcement
