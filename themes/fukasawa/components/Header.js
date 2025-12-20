import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import { siteConfig } from '@/lib/config'

/**
 * 顶部导航（移动端专用）- 彻底修复公告内容漂移
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // 直接从配置中读取公告字符串，不经过 Announcement 组件
  const noticeText = siteConfig('ANNOUNCEMENT') || ''

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 - 强制 z-index 最前 */}
      <div className='w-full bg-orange-600 py-2 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 固定的小喇叭 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container whitespace-nowrap flex flex-grow'>
                <div className='marquee-content px-4'>
                   {/* 直接渲染文字，避免组件干扰 */}
                   <span className='marquee-text'>{noticeText}</span>
                </div>
                {/* 循环副本 */}
                <div className='marquee-content px-4'>
                   <span className='marquee-text'>{noticeText}</span>
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

      {/* 彻底锁定样式 */}
      <style jsx global>{`
        .marquee-container { display: flex; overflow: hidden; width: 100%; }
        .marquee-content { display: flex; animation: marquee 25s linear infinite; }
        
        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 13px;
          margin-right: 100px; /* 增加活动之间的间距，防止首尾相连太挤 */
          display: inline-block;
        }

        /* 强制覆盖任何可能从 noticeText 传入的 HTML 样式 */
        .marquee-text * {
          color: #000000 !important;
          display: inline !important;
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
