import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

/**
 * 悬浮活动卡片组件
 */
const FloatingActivityCard = ({ config, isActive, isVisible }) => {
  if (!isActive) return null

  return (
    <div 
      className={`fixed bottom-4 right-4 z-50 w-80 transition-all duration-500 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[400px] opacity-0'
      }`}>
      <div 
        className={`p-4 ${config.bgColor} border-2 ${config.borderColor} rounded-xl shadow-2xl backdrop-blur-sm`}
        role="region"
        aria-label={`${config.title}活动信息`}>
        <div className={`flex items-center justify-between ${config.textColor} font-bold text-sm mb-2`}>
          <div className="flex items-center">
            <i className={`${config.icon} mr-2 ${config.animation}`} aria-hidden="true" />
            <span>{config.title}</span>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={(e) => {
              e.currentTarget.closest('.fixed').style.display = 'none'
            }}
            aria-label="关闭活动卡片">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <p className='text-xs text-gray-700 dark:text-gray-300 mb-3 leading-relaxed'>
          {config.emoji} <strong>{config.productName}</strong> {config.description}
        </p>
        <a 
          href={config.link} 
          target="_blank" 
          rel="noopener noreferrer"
          aria-label={`参与${config.title}活动`}
          className={`block text-center ${config.buttonBg} text-white text-xs px-4 py-2 rounded-lg ${config.buttonHover} transition-all hover:shadow-lg font-medium`}>
          {config.buttonText} →
        </a>
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

// --- 活动配置（统一管理）---
const activityConfigs = {
  activity1: {
    deadline: new Date('2025-12-31T23:59:59+08:00'),
    title: '活动一：图灵搜岁末活动',
    productName: '外贸获客工具',
    description: '原价 ¥2180，现仅需 ¥1600！限时：2025.12.31',
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
    description: '限时赠送社媒搜索工具、138届广交会名录！限时：2025.12.31',
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
  const [activities, setActivities] = useState({
    activity1: false,
    activity2: false
  })
  
  const [floatingVisible, setFloatingVisible] = useState(false)
  const announcementRef = useRef(null)

  useEffect(() => {
    const now = new Date()
    const newActivities = {}
    Object.keys(activityConfigs).forEach(key => {
      newActivities[key] = now < activityConfigs[key].deadline
    })
    setActivities(newActivities)

    if (process.env.NODE_ENV === 'development') {
      console.log('当前时间:', now)
      Object.keys(activityConfigs).forEach(key => {
        const config = activityConfigs[key]
        const timeLeft = config.deadline - now
        const daysLeft = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        console.log(`${config.title}: ${newActivities[key] ? `还剩${daysLeft}天` : '已结束'}`)
      })
    }
  }, [])

  // 监听滚动，控制悬浮卡片显示
  useEffect(() => {
    const handleScroll = () => {
      if (!announcementRef.current) return

      const sidebar = document.querySelector('.sideLeft')
      if (!sidebar) return

      const sidebarRect = sidebar.getBoundingClientRect()
      const announcementRect = announcementRef.current.getBoundingClientRect()
      
      // 侧边栏滚动到底部（出现空白区域）且活动卡片不在可视区域内时，显示悬浮卡片
      const sidebarScrolledToBottom = sidebarRect.bottom > window.innerHeight + 200
      const announcementNotVisible = announcementRect.bottom < 0 || announcementRect.top > window.innerHeight
      
      // 检测是否遮挡主内容区域
      const mainContent = document.querySelector('main') || document.querySelector('article')
      let isBlockingContent = false
      
      if (mainContent) {
        const contentRect = mainContent.getBoundingClientRect()
        const floatingCardRight = window.innerWidth - 16 // right-4 = 1rem = 16px
        const floatingCardLeft = floatingCardRight - 320 // w-80 = 20rem = 320px
        
        // 如果悬浮卡片会遮挡主内容，则隐藏
        isBlockingContent = (
          contentRect.right > floatingCardLeft && 
          contentRect.left < floatingCardRight
        )
      }

      setFloatingVisible(
        (sidebarScrolledToBottom || announcementNotVisible) && 
        !isBlockingContent &&
        (activities.activity1 || activities.activity2)
      )
    }

    // 添加滚动监听（包括侧边栏和主窗口）
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    const sidebar = document.querySelector('.sideLeft')
    if (sidebar) {
      sidebar.addEventListener('scroll', handleScroll, { passive: true })
    }

    // 初始检查
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (sidebar) {
        sidebar.removeEventListener('scroll', handleScroll)
      }
    }
  }, [activities])

  return (
    <>
      <div className={className} ref={announcementRef}>
        <section 
          id='announcement-wrapper' 
          className="dark:text-gray-300 rounded-xl px-2 py-4"
          role="complementary"
          aria-label="活动公告区域">
          
          {/* 侧边栏内嵌活动卡片 */}
          <InlineActivityCard 
            config={activityConfigs.activity1} 
            isActive={activities.activity1} 
          />
          <InlineActivityCard 
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

      {/* 悬浮活动卡片（只显示活动1，可改为轮播） */}
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
