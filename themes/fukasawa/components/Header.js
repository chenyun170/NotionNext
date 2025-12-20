import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'

/**
 * 顶部导航（移动端专用）
 * 功能：
 * 1. 顶部无缝跑马灯，支持多活动独立跳转链接
 * 2. 适配深色模式，保持高对比度黑黄配色
 * 3. 彻底隔离文章内容干扰，固定显示活动文案
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // --- 活动配置区：在此修改文字和对应的跳转链接 ---
  const activity1 = {
    text: "🔥 活动一：图灵搜岁末活动，限时 1600 元！",
    link: "/article/tulingso-promo" // 替换为你的实际链接
  }
  
  const activity2 = {
    text: "🚀 活动二：顶易云岁末活动，限时赠送社群工具！",
    link: "/article/dingyiyun-promo" // 替换为你的实际链接
  }

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  // 内部组件：定义滚动的单组活动内容
  const MarqueeItems = () => (
    <div className='flex items-center'>
      {/* 活动一链接块 */}
      <a href={activity1.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity1.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>
      
      {/* 两个活动之间的间距隔离 */}
      <div className='w-[100px] flex-shrink-0'></div>

      {/* 活动二链接块 */}
      <a href={activity2.link} className='marquee-item no-underline flex items-center'>
        <span className='marquee-text'>{activity2.text}</span>
        <span className='detail-badge'>查看详情</span>
      </a>

      {/* 循环末尾的间距隔离 */}
      <div className='w-[100px] flex-shrink-0'></div>
    </div>
  )

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 - 始终保持橙色背景以提醒用户 */}
      <div className='w-full bg-orange-600 py-2.5 overflow-hidden relative border-b border-orange-700 dark:border-orange-500 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 左侧固定图标 - 增加 z-index 确保不被滚动文字遮挡 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center shadow-[5px_0_10px_rgba(234,88,12,1)]'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container flex-grow overflow-hidden'>
                <div className='marquee-content whitespace-nowrap flex'>
                   <MarqueeItems />
                   {/* 复制一份内容实现无缝循环滚动效果 */}
                   <MarqueeItems />
                </div>
            </div>
        </div>
      </div>

      {/* 2. 导航栏主体（Logo 与 菜单按钮） */}
      <div
        id='sticky-nav'
        className='relative w-full top-0 z-40 transform duration-500 bg-white dark:bg-black border-b'
      >
        <div className='w-full flex justify-between items-center p-4'>
          {/* 网站Logo组件 */}
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>
          
          {/* 菜单切换按钮 */}
          <div className='mr-1 flex justify-end items-center text-sm space-x-4 dark:text-gray-200'>
            <div onClick={toggleMenuOpen} className='cursor-pointer text-lg p-2'>
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </div>
          </div>
        </div>

        {/* 移动端下拉导航菜单 */}
        <Collapse type='vertical' isOpen={isOpen} collapseRef={collapseRef}>
          <div className='py-1 px-5'>
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

      {/* 样式定义 */}
      <style jsx global>{`
        .marquee-container { width: 100%; }
        .marquee-content { 
          display: flex; 
          animation: marquee 35s linear infinite; 
          width: max-content;
        }
        
        .marquee-item {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
        }

        /* 文字颜色强制设为黑色，确保在橙色背景下清晰度最高 */
        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 14px !important;
          letter-spacing: 0.025em;
        }

        /* 详情标签样式 - 深色胶囊设计 */
        .detail-badge {
          background: rgba(0, 0, 0, 0.8); 
          color: #FACC15 !important; 
          padding: 1px 10px;
          border-radius: 999px;
          font-size: 10px;
          margin-left: 8px;
          font-weight: bold;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* 无缝位移补间动画 */
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* 用户手指按住时停止滚动，方便点击精准链接 */
        .marquee-container:active .marquee-content {
          animation-play-state: paused;
        }

        /* 适配深色模式切换后的阴影微调 */
        .dark #top-nav {
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
        }
      `}</style>
    </div>
  )
}

export default Header
