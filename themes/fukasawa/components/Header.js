import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import Announcement from './Announcement'

/**
 * 顶部导航（移动端专用）- 包含高层级跑马灯
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 - 增加 z-index 确保最前端 */}
      <div className='w-full bg-orange-600 py-2 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 固定的小喇叭 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center shadow-[5px_0_10px_rgba(234,88,12,1)]'>
                <i className='fas fa-bullhorn animate-bounce text-white text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container whitespace-nowrap flex flex-grow'>
                <div className='marquee-content px-4'>
                   <Announcement {...props} />
                </div>
                {/* 循环副本 */}
                <div className='marquee-content px-4'>
                   <Announcement {...props} />
                </div>
            </div>
        </div>
      </div>

      {/* 2. 导航栏主体 */}
      <div
        id='sticky-nav'
        className='relative w-full top-0 z-40 transform duration-500 bg-white dark:bg-black border-b'
      >
        {/* 下拉菜单 */}
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

        {/* Logo 与 菜单按钮 */}
        <div className='w-full flex justify-between items-center p-4'>
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>
          <div className='mr-1 flex justify-end items-center text-sm space-x-4 dark:text-gray-200'>
            <div onClick={toggleMenuOpen} className='cursor-pointer text-lg p-2'>
              {isOpen ? <i className='fas fa-times' /> : <i className='fas fa-bars' />}
            </div>
          </div>
        </div>
      </div>

      {/* 样式优化 */}
      <style jsx global>{`
        .marquee-container {
          display: flex;
          overflow: hidden;
        }
        .marquee-content {
          display: flex;
          animation: marquee 25s linear infinite;
        }
        /* 强制跑马灯文字为亮黄色、加粗、且层级最高 */
        .marquee-content * {
          display: inline !important;
          color: #FFEB3B !important; 
          margin: 0 !important;
          padding: 0 !important;
          white-space: nowrap !important;
          font-weight: 900 !important; /* 极粗字体 */
          text-shadow: 1px 1px 2px rgba(0,0,0,0.2); /* 增加轻微阴影提升清晰度 */
        }
        .marquee-content a {
          margin-right: 60px;
          text-decoration: none;
          border-bottom: 2px solid #FFEB3B;
        }
        /* 触摸暂停 */
        .marquee-container:active .marquee-content {
          animation-play-state: paused;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}

export default Header
