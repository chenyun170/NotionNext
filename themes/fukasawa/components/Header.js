import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import Announcement from './Announcement'

/**
 * 顶部导航（移动端专用）- 包含顶部跑马灯横幅
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-40 block lg:hidden'>
      {/* 1. 最顶部的跑马灯横幅 */}
      <div className='w-full bg-orange-600 text-white py-1.5 overflow-hidden relative border-b border-orange-700'>
        <div className='flex items-center'>
            {/* 固定在左侧的小喇叭图标，增加层级感 */}
            <div className='pl-3 pr-2 bg-orange-600 z-10 relative flex items-center shadow-[5px_0_10px_rgba(234,88,12,1)]'>
                <i className='fas fa-bullhorn animate-bounce text-xs'></i>
            </div>
            
            {/* 跑马灯滚动容器 */}
            <div className='marquee-container whitespace-nowrap flex'>
                <div className='marquee-content px-4 text-[13px] font-medium tracking-wide'>
                   <Announcement {...props} />
                </div>
                {/* 复制一份内容以实现无缝循环滚动 */}
                <div className='marquee-content px-4 text-[13px] font-medium tracking-wide'>
                   <Announcement {...props} />
                </div>
            </div>
        </div>
      </div>

      <div
        id='sticky-nav'
        className='relative w-full top-0 z-20 transform duration-500 bg-white dark:bg-black border-b'
      >
        {/* 2. 下拉菜单 */}
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

        {/* 3. Logo 与 菜单按钮 */}
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

      {/* 跑马灯动画 CSS */}
      <style jsx global>{`
        .marquee-container {
          display: flex;
          overflow: hidden;
          width: 100%;
        }
        .marquee-content {
          display: flex;
          animation: marquee 20s linear infinite; /* 20秒一圈，数字越大速度越慢 */
        }
        /* 强制 Announcement 内部样式为白色且单行 */
        .marquee-content * {
          display: inline !important;
          color: white !important;
          margin: 0 !important;
          padding: 0 !important;
          white-space: nowrap !important;
        }
        .marquee-content a {
          margin-right: 40px; /* 两个活动之间的间距 */
          text-decoration: none;
          border-bottom: 1px dashed rgba(255,255,255,0.5);
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
