import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

/**
 * 顶部导航（移动端专用）- 支持多活动多链接
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // --- 活动配置区：在这里修改你的文字和链接 ---
  const activity1 = {
    text: "🔥 活动一：图灵搜岁末活动，限时 1600 元！",
    link: "http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6" // 修改为活动一的链接
  }
  
  const activity2 = {
    text: "🚀 活动二：顶易云岁末活动，限时赠送社群工具！",
    link: "http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6" // 修改为活动二的链接
  }

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  // 活动内容组件：方便重复调用实现无缝滚动
  const MarqueeItems = () => (
    <div className='flex items-center'>
      {/* 活动一 */}
      <a href={activity1.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity1.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>
      
      {/* 间隔 */}
      <div className='w-[100px]'></div>

      {/* 活动二 */}
      <a href={activity2.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity2.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>

      {/* 尾部大间隔（确保首尾循环时不拥挤） */}
      <div className='w-[100px]'></div>
    </div>
  )

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2.5 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 左侧固定图标 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动区域 */}
            <div className='marquee-container flex-grow overflow-hidden'>
                <div className='marquee-content whitespace-nowrap flex'>
                   <MarqueeItems />
                   <MarqueeItems />
                </div>
            </div>
        </div>
      </div>

      {/* 2. 导航栏主体 */}
      <div id='sticky-nav' className='relative w-full top-0 z-40 bg-white dark:bg-black border-b'>
        <div className='w-full flex justify-between items-center p-4'>
          <Logo {...props} />
          <div onClick={toggleMenuOpen} className='cursor-pointer text-lg p-2 dark:text-gray-200'>
             <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`} />
          </div>
        </div>
        <Collapse type='vertical' isOpen={isOpen} collapseRef={collapseRef}>
          <div className='py-1 px-5'>
            <MenuList {...props} onHeightChange={param => collapseRef.current?.updateCollapseHeight(param)} />
            <SearchInput {...props} />
          </div>
        </Collapse>
      </div>

      <style jsx global>{`
        .marquee-container { width: 100%; }
        .marquee-content { 
          display: flex; 
          animation: marquee 35s linear infinite; /* 活动多了，建议速度调慢一点点 */
          width: max-content;
        }
        
        .marquee-item {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 14px !important;
        }

        .detail-badge {
          background: rgba(0,0,0,0.8); /* 黑色背景 */
          color: #FACC15 !important; /* 黄色文字 */
          padding: 1px 8px;
          border-radius: 999px;
          font-size: 10px;
          margin-left: 8px;
          font-weight: bold;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* 触摸时停止滚动，方便精准点击 */
        .marquee-container:active .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

export default Header
