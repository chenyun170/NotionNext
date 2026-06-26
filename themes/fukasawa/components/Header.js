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
    text: '139届全球采购商数据新鲜出炉！¥300/行业，¥600/3个行业！',
    link: 'https://h.topeasysoft.com/20260618tls/index.html?i=BB54F6'
  },
  {
    icon: '🚀',
    text: '顶易云 618 活动进行中，6月30日24时截止',
    link: 'https://h.topeasysoft.com/20260618dyy/index.html?i=BB54F6'
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
  const [isSearchActive, setSearchActive] = useState(false)
  const collapseRef = useRef(null)
  const searchInputRef = useRef(null)
  const throttleRef = useRef(null)

  // ========== 检查活动时间是否过期（动态更新） ==========
  useEffect(() => {
    const checkDeadline = () => {
      const now = new Date()
      const deadline = new Date('2026-07-01T00:00:00+08:00')
      
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
    const nextOpen = !isOpen
    changeShow(nextOpen)
    if (!nextOpen) {
      setSearchActive(false)
    }
  }

  const openSearch = () => {
    setSearchActive(true)
    changeShow(true)
    window.setTimeout(() => searchInputRef.current?.focus?.(), 120)
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
    <div id='top-nav' className='z-50 block lg:hidden sticky top-0 shadow-sm'>
      
      {/* 1. 顶部跑马灯横幅 - 时间控制显隐 */}
      {showMarquee && (
      <div
        className='w-full border-b border-amber-100 bg-amber-50/95 px-2 py-1 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-100'
        style={{ zIndex: 100 }}>
        <div className='flex items-center gap-1.5 overflow-x-auto no-scrollbar'>
          <i className='fas fa-bullhorn flex-shrink-0 text-[10px] text-amber-600 dark:text-amber-300'></i>
          {ACTIVITIES.map((activity, idx) => (
            <a
              key={idx}
              href={activity.link}
              target='_blank'
              rel='noopener noreferrer'
              className={`${idx > 0 ? 'hidden sm:flex' : 'flex'} flex-shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-white/75 px-2 py-0.5 text-[10px] font-bold text-amber-800 no-underline dark:border-amber-800 dark:bg-amber-900/50 dark:text-amber-100`}>
              <span>{activity.icon}</span>
              <span>{idx === 0 ? '618 活动' : '顶易云活动'}</span>
              <i className='fas fa-arrow-up-right-from-square text-[9px] opacity-60'></i>
            </a>
          ))}
        </div>
      </div>
      )}

      {/* 2. 导航栏主体 */}
      <div
        id='sticky-nav'
        className={`relative w-full ${Z_INDEX.nav} bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900`}
      >
        <div className='w-full flex justify-between items-center px-3 py-2.5'>
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>
          <div className='mr-1 flex items-center justify-end gap-1 text-sm dark:text-gray-200'>
            <button
              type='button'
              onClick={openSearch}
              aria-label='打开搜索'
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-900 dark:hover:text-orange-400 ${
                isSearchActive && isOpen
                  ? 'bg-orange-50 text-orange-500 dark:bg-orange-950/40 dark:text-orange-300'
                  : 'text-zinc-600 dark:text-zinc-200'
              }`}>
              <i className='fas fa-search text-sm' />
            </button>
            <button
              type='button'
              aria-label={isOpen ? '关闭菜单' : '打开菜单'}
              onClick={toggleMenuOpen} 
              className='flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors hover:bg-zinc-100 hover:text-orange-500 dark:hover:bg-zinc-900 dark:hover:text-orange-400'
            >
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </button>
          </div>
        </div>

        {/* 3. 阅读进度条 - 优化版本 */}
        <div className='absolute bottom-0 left-0 w-full h-[2px] bg-gray-100 dark:bg-zinc-800 overflow-hidden'>
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
          <div className='max-h-[72vh] overflow-y-auto border-b border-zinc-200 bg-white/98 px-4 pb-5 pt-3 shadow-xl backdrop-blur-xl dark:border-zinc-800 dark:bg-black/95'>
            <div className='mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-2 dark:border-zinc-800 dark:bg-zinc-900/70'>
              <SearchInput {...props} cRef={searchInputRef} />
            </div>
            <div className='mb-3 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400'>
              <span>Menu</span>
              <span>Trade Intelligence</span>
            </div>
            <MenuList
              {...props}
              onHeightChange={param =>
                collapseRef.current?.updateCollapseHeight(param)
              }
            />
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
