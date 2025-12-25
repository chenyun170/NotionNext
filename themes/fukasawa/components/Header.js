import Collapse from '@/components/Collapse'
import { useRef, useState, useEffect } from 'react' // 1. 引入 useEffect
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

/**
 * 顶部导航（移动端专用）
 * 已集成：1. 顶部跑马灯 2. 阅读进度条
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0) // 2. 定义进度状态
  const collapseRef = useRef(null)
  
  // --- 进度条逻辑 ---
  useEffect(() => {
    const updateScrollProgress = () => {
      const currentScrollY = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const progress = Number((currentScrollY / scrollHeight).toFixed(2)) * 100
        setScrollProgress(progress)
      }
    }
    window.addEventListener('scroll', updateScrollProgress)
    return () => window.removeEventListener('scroll', updateScrollProgress)
  }, [])

  // --- 活动配置区 ---
  const activity1 = {
    text: "🔥 活动一：图灵搜岁末活动，限时 1600 元！",
    link: "/article/tulingso-promo"
  }
  
  const activity2 = {
    text: "🚀 活动二：顶易云岁末活动，限时赠送社群工具！",
    link: "/article/dingyiyun-promo"
  }

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  const MarqueeItems = () => (
    <div className='flex items-center'>
      <a href={activity1.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity1.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>
      <div className='w-[100px] flex-shrink-0'></div>
      <a href={activity2.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity2.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>
      <div className='w-[100px] flex-shrink-0'></div>
    </div>
  )

  return (
    <div id='top-nav' className='z-50 block lg:hidden sticky top-0 shadow-md'>
      
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2.5 overflow-hidden relative' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            <div className='marquee-container flex-grow overflow-hidden'>
                <div className='marquee-content whitespace-nowrap flex'>
                    <MarqueeItems />
                    <MarqueeItems />
                </div>
            </div>
        </div>
      </div>

      {/* 2. 导航栏主体 */}
      <div
        id='sticky-nav'
        className='relative w-full z-40 bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-900'
      >
        <div className='w-full flex justify-between items-center p-3'>
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>
          <div className='mr-1 flex justify-end items-center text-sm space-x-4 dark:text-gray-200'>
            <div onClick={toggleMenuOpen} className='cursor-pointer text-lg p-2'>
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </div>
          </div>
        </div>

        {/* 3. 阅读进度条 - 放置在导航栏最底部 */}
        <div className='absolute bottom-0 left-0 w-full h-[3px] bg-transparent overflow-hidden'>
             <div 
                className='h-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)] transition-all duration-150 ease-out'
                style={{ width: `${scrollProgress}%` }}
             />
        </div>

        <Collapse type='vertical' isOpen={isOpen} collapseRef={collapseRef}>
          <div className='py-1 px-5 bg-white dark:bg-black'>
            <MenuList
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
        /* 跑马灯动画 */
        .marquee-container { width: 100%; }
        .marquee-content { 
          display: flex; 
          animation: marquee 35s linear infinite; 
          width: max-content;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 13px !important;
        }

        .detail-badge {
          background: #000; 
          color: #fff !important; 
          padding: 1px 8px;
          border-radius: 4px;
          font-size: 10px;
          margin-left: 8px;
        }

        /* 阅读进度条流光效果（可选） */
        .bg-orange-500 {
            background: linear-gradient(90deg, #f97316, #fbbf24, #f97316);
            background-size: 200% 100%;
            animation: progress-shimmer 2s infinite linear;
        }
        @keyframes progress-shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

export default Header
