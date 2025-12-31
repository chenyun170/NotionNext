import Collapse from '@/components/Collapse'
import { useRef, useState, useEffect, useCallback } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

/**
 * 顶部导航（移动端专用）
 * 已集成：1. 顶部跑马灯 2. 阅读进度条（含节流优化）
 */

// ========== 活动配置 ==========
const ACTIVITIES = [
  {
    icon: '🔥',
    text: '图灵搜岁末活动，限时 1600 元！',
    link: 'http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6'
  },
  {
    icon: '🚀',
    text: '顶易云岁末活动，限时赠送社群工具！',
    link: 'http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6'
  }
]

// z-index 层级管理
const Z_INDEX = {
  marquee: 'z-[110]',
  nav: 'z-50',
  progress: 'z-40'
}

const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showMarquee, setShowMarquee] = useState(true)
  const collapseRef = useRef(null)
  const throttleRef = useRef(null)

  // ========== 检查活动时间是否过期（动态更新） ==========
  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date()
      const deadline = new Date('2025-12-31 23:59:59')
      
      if (now > deadline) {
        setShowMarquee(false)
      } else {
        setShowMarquee(true)
      }
    }

    // 首次加载检查
    checkDeadline()

    // 每分钟检查一次（避免过度检查）
    const timer = setInterval(checkDeadline, 60000)

    return () => clearInterval(timer)
  }, [])

  // ========== 进度条逻辑（含节流优化） ==========
  const updateScrollProgress = useCallback(() => {
    const currentScrollY = window.scrollY
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    
    if (scrollHeight > 0) {
      const progress = Math.min((currentScrollY / scrollHeight) * 100, 100)
      setScrollProgress(progress)
    }
  }, [])

  useEffect(() => {
    // 节流函数：每 16ms（约 60fps）更新一次
    const handleScroll = () => {
      if (throttleRef.current) return
      
      throttleRef.current = true
      updateScrollProgress()
      
      setTimeout(() => {
        throttleRef.current = false
      }, 16)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [updateScrollProgress])

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  // ========== 跑马灯组件 ==========
  const MarqueeItems = () => (
    <div className='flex items-center'>
      {ACTIVITIES.map((activity, idx) => (
        <div key={idx} className='flex items-center'>
          <a 
            href={activity.link}
            target="_blank"
            rel="noopener noreferrer"
            className='marquee-item no-underline flex items-center hover:opacity-80 transition-opacity'
          >
            <span className='marquee-icon'>{activity.icon}</span>
            <span className='marquee-text'>{activity.text}</span>
            <span className='detail-badge'>查看详情</span>
          </a>
          <div className='w-[80px] flex-shrink-0'></div>
        </div>
      ))}
    </div>
  )

  return (
    <div id='top-nav' className='z-50 block lg:hidden sticky top-0 shadow-md'>
      
      {/* 1. 顶部跑马灯横幅 - 时间控制显隐 */}
      {showMarquee && (
      <div 
        className='w-full bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 overflow-hidden relative animate-in fade-in duration-500'
        style={{ zIndex: 100 }}
      >
        <div className='flex items-center'>
          <div className={`pl-3 pr-2 bg-gradient-to-r from-orange-500 to-orange-600 ${Z_INDEX.marquee} relative flex items-center flex-shrink-0`}>
            <i className='fas fa-bullhorn animate-bounce text-white text-xs'></i>
          </div>
          <div className='marquee-container flex-grow overflow-hidden'>
            <div className='marquee-content whitespace-nowrap flex'>
              <MarqueeItems />
              <MarqueeItems />
            </div>
          </div>
        </div>
      </div>
      )}

      {/* 2. 导航栏主体 */}
      <div
        id='sticky-nav'
        className={`relative w-full ${Z_INDEX.nav} bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900`}
      >
        <div className='w-full flex justify-between items-center p-3'>
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>
          <div className='mr-1 flex justify-end items-center text-sm space-x-4 dark:text-gray-200'>
            <div 
              onClick={toggleMenuOpen} 
              className='cursor-pointer text-lg p-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors'
            >
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </div>
          </div>
        </div>

        {/* 3. 阅读进度条 - 优化版本 */}
        <div className='absolute bottom-0 left-0 w-full h-[3px] bg-gray-100 dark:bg-zinc-800 overflow-hidden'>
          <div 
            className='h-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-all duration-150 ease-out'
            style={{ 
              width: `${scrollProgress}%`,
              willChange: 'width'
            }}
          />
        </div>

        {/* 4. 折叠菜单 */}
        <Collapse type='vertical' isOpen={isOpen} collapseRef={collapseRef}>
          <div className='py-1 px-5 bg-white dark:bg-black'>
            <MenuInput
              {...props}
              onHeightChange={param =>
                collapseRef.current?.updateCollapseHeight(param)
              }
            />
            <SearchInput {...props} />
          </div>
        </Collapse>
      </div>

      <style jsx global>{`
        /* ===== 跑马灯优化 ===== */
        .marquee-container {
          width: 100%;
          mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 10%, black 90%, transparent);
        }

        .marquee-content {
          display: flex;
          animation: marquee 40s linear infinite;
          width: max-content;
          will-change: transform;
          transform: translateZ(0);
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .marquee-icon {
          display: inline-block;
          margin-right: 6px;
          font-size: 14px;
        }

        .marquee-text {
          color: #000000 !important;
          font-weight: 700 !important;
          font-size: 13px !important;
          letter-spacing: 0.3px;
        }

        .detail-badge {
          background: #000;
          color: #fff !important;
          padding: 2px 8px;
          border-radius: 3px;
          font-size: 11px !important;
          font-weight: 600;
          margin-left: 8px;
          white-space: nowrap;
          flex-shrink-0;
          transition: all 0.2s;
        }

        .marquee-item:hover .detail-badge {
          background: #ff6b00;
          transform: scale(1.05);
        }

        /* ===== 进度条流光效果 ===== */
        .bg-gradient-to-r.from-orange-400 {
          background: linear-gradient(
            90deg,
            #fb923c 0%,
            #f97316 25%,
            #ea580c 50%,
            #f97316 75%,
            #fb923c 100%
          );
          background-size: 200% 100%;
          animation: progress-shimmer 2.5s ease-in-out infinite;
        }

        @keyframes progress-shimmer {
          0% {
            background-position: -200% 0;
          }
          50% {
            background-position: 0 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* ===== 响应式优化 ===== */
        @media (max-width: 640px) {
          .marquee-text {
            font-size: 12px !important;
          }
          .detail-badge {
            font-size: 10px !important;
            padding: 1px 6px;
          }
        }
      `}</style>
    </div>
  )
}

export default Header
