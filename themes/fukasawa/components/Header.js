import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import { siteConfig } from '@/lib/config'

/**
 * 顶部导航（移动端专用）- 修复 Notion 数据抓取
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // 1. 自动适配不同的数据获取路径
  // 优先级：Props传值 > 全局配置 > 默认提示
  const noticeText = props?.notice || siteConfig('ANNOUNCEMENT')

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2.5 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 固定小喇叭 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container flex-grow overflow-hidden'>
                <div className='marquee-content whitespace-nowrap flex'>
                   <div className='marquee-item-wrapper flex items-center'>
                      {/* 如果有内容则渲染，否则显示默认文字 */}
                      {noticeText ? (
                        <span className='marquee-text' dangerouslySetInnerHTML={{ __html: noticeText }} />
                      ) : (
                        <span className='marquee-text'>请在后台设置 ANNOUNCEMENT 公告内容</span>
                      )}
                      <i className='fas fa-arrow-circle-right ml-2 text-black text-[10px] animate-pulse'></i>
                   </div>
                   {/* 循环副本 */}
                   <div className='marquee-item-wrapper flex items-center'>
                      {noticeText ? (
                        <span className='marquee-text' dangerouslySetInnerHTML={{ __html: noticeText }} />
                      ) : (
                        <span className='marquee-text'>请在后台设置 ANNOUNCEMENT 公告内容</span>
                      )}
                      <i className='fas fa-arrow-circle-right ml-2 text-black text-[10px] animate-pulse'></i>
                   </div>
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
          animation: marquee 30s linear infinite; 
          width: max-content;
        }
        .marquee-item-wrapper { padding-right: 150px; }
        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 14px !important;
          display: inline-block !important;
        }
        /* 确保链接和嵌套文字也是黑色 */
        .marquee-text * {
          color: #000000 !important;
          font-weight: 800 !important;
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
