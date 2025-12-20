import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import Announcement from './Announcement'
import { siteConfig } from '@/lib/config' // 引入配置

/**
 * 顶部导航（移动端专用）- 修复内容错乱与颜色问题
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)
  
  // 强制获取全局配置中的公告内容，防止进入文章页后内容改变
  const globalNotice = siteConfig('ANNOUNCEMENT') 

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-50 block lg:hidden relative'>
      {/* 1. 顶部跑马灯横幅 */}
      <div className='w-full bg-orange-600 py-2 overflow-hidden relative border-b border-orange-700 shadow-lg' style={{ zIndex: 100 }}>
        <div className='flex items-center'>
            <div className='pl-3 pr-2 bg-orange-600 z-[110] relative flex items-center'>
                <i className='fas fa-bullhorn animate-bounce text-black text-xs'></i>
            </div>
            
            <div className='marquee-container whitespace-nowrap flex flex-grow'>
                {/* 使用 key={globalNotice} 强制内容更新 */}
                <div className='marquee-content px-4' key={globalNotice}>
                   {/* 传递全局 notice 属性，不随页面改变 */}
                   <Announcement {...props} notice={globalNotice} />
                </div>
                <div className='marquee-content px-4'>
                   <Announcement {...props} notice={globalNotice} />
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
        .marquee-container { display: flex; overflow: hidden; }
        .marquee-content { display: flex; animation: marquee 25s linear infinite; }
        
        /* 强制跑马灯文字为黑色且加粗 */
        .marquee-content * {
          display: inline !important;
          color: #000000 !important; 
          margin: 0 !important;
          padding: 0 !important;
          white-space: nowrap !important;
          font-weight: 800 !important;
        }
        .marquee-content a {
          margin-right: 60px;
          text-decoration: none;
          border-bottom: 2px solid #000000;
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
