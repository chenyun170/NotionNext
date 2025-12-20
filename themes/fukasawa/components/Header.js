import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import { siteConfig } from '@/lib/config'

/**
 * 顶部导航（移动端专用）- 增强文字抓取逻辑
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // 1. 尝试从配置中获取公告内容
  // 增加多种获取方式，确保在不同版本的 NotionNext 中都能拿到文字
  const noticeHtml = siteConfig('ANNOUNCEMENT') || props?.notice || ''

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2.5 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            {/* 固定小喇叭 */}
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center shadow-[5px_0_10px_rgba(234,88,12,1)]'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container flex-grow overflow-hidden'>
                <div className='marquee-content whitespace-nowrap flex'>
                   <div className='marquee-item-wrapper flex items-center'>
                      {/* 如果 noticeHtml 为空，这里会显示备选文字，方便你排查问题 */}
                      <span className='marquee-text' dangerouslySetInnerHTML={{ __html: noticeHtml || '欢迎来到外贸获客情报局' }} />
                      <i className='fas fa-arrow-circle-right ml-2 text-black text-[10px] animate-pulse'></i>
                   </div>
                   {/* 循环副本 */}
                   <div className='marquee-item-wrapper flex items-center'>
                      <span className='marquee-text' dangerouslySetInnerHTML={{ __html: noticeHtml || '欢迎来到外贸获客情报局' }} />
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
          animation: marquee 25s linear infinite; 
          width: max-content;
        }
        
        .marquee-item-wrapper {
          padding-right: 150px; /* 两个活动之间的超大间距，防止重叠 */
        }

        .marquee-text {
          color: #000000 !important; 
          font-weight: 800 !important;
          font-size: 14px !important;
          display: inline-block !important;
          visibility: visible !important;
          opacity: 1 !important;
        }

        /* 强制跑马灯内所有 HTML 内容可见 */
        .marquee-text * {
          color: #000000 !important;
          display: inline !important;
          font-weight: 800 !important;
          visibility: visible !important;
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
