import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import { siteConfig } from '@/lib/config'

/**
 * 顶部导航（移动端专用）- 包含详情箭头，彻底解决内容漂移
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // 仅获取全局配置公告，不使用任何页面变量
  const noticeHtml = siteConfig('ANNOUNCEMENT') || ''

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 固定小喇叭 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center shadow-[5px_0_10px_rgba(234,88,12,1)]'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container whitespace-nowrap flex flex-grow'>
                <div className='marquee-content px-4'>
                   <span className='marquee-item'>
                      <span dangerouslySetInnerHTML={{ __html: noticeHtml }} />
                      <i className='fas fa-arrow-circle-right ml-2 text-[10px] opacity-80'></i>
                   </span>
                </div>
                {/* 无缝循环副本 */}
                <div className='marquee-content px-4'>
                   <span className='marquee-item'>
                      <span dangerouslySetInnerHTML={{ __html: noticeHtml }} />
                      <i className='fas fa-arrow-circle-right ml-2 text-[10px] opacity-80'></i>
                   </span>
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
        .marquee-container { display: flex; overflow: hidden; width: 100%; }
        .marquee-content { display: flex; animation: marquee 25s linear infinite; }
        
        .marquee-item {
          display: flex;
          align-items: center;
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 13px;
          margin-right: 120px; /* 两个活动之间的安全距离 */
        }

        /* 强制覆盖所有 HTML 标签样式 */
        .marquee-item * {
          color: #000000 !important;
          display: inline !important;
          font-weight: 800 !important;
          text-decoration: none !important;
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
