import Collapse from '@/components/Collapse'
import { useRef, useState } from 'react'
import Logo from './Logo'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import Announcement from './Announcement' // [1. 引入活动组件]

/**
 * 顶部导航（移动端专用）
 * @param {*} props
 * @returns
 */
const Header = props => {
  const [isOpen, changeShow] = useState(false)
  const collapseRef = useRef(null)

  const toggleMenuOpen = () => {
    changeShow(!isOpen)
  }

  return (
    <div id='top-nav' className='z-40 block lg:hidden'>
      {/* 导航栏主体 */}
      <div
        id='sticky-nav'
        className={
          'relative w-full top-0 z-20 transform duration-500 bg-white dark:bg-black border-b'
        }>
        
        {/* 1. 下拉菜单部分 */}
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

        {/* 2. 顶部主栏：LOGO 与 菜单按钮 */}
        <div className='w-full flex justify-between items-center p-4 '>
          {/* 左侧LOGO 标题 */}
          <div className='flex flex-none flex-grow-0'>
            <Logo {...props} />
          </div>

          {/* 右侧功能按钮 */}
          <div className='mr-1 flex justify-end items-center text-sm space-x-4 font-serif dark:text-gray-200'>
            <div
              onClick={toggleMenuOpen}
              className='cursor-pointer text-lg p-2'>
              {isOpen ? (
                <i className='fas fa-times' />
              ) : (
                <i className='fas fa-bars' />
              )}
            </div>
          </div>
        </div>

        {/* 3. [新增] 手机端专用活动展示区 */}
        <div className='bg-orange-50 dark:bg-orange-900/10 border-t border-orange-100 dark:border-orange-900/30 px-5 py-2'>
           <div className='flex items-center space-x-2 overflow-hidden text-sm'>
             {/* 一个闪烁的小喇叭图标，提醒有新活动 */}
             <i className='fas fa-bullhorn text-orange-600 animate-pulse flex-shrink-0' />
             <div className='flex-grow overflow-x-auto whitespace-nowrap scrollbar-hide'>
                <Announcement {...props} />
             </div>
           </div>
        </div>

      </div>

      {/* 隐藏滚动条样式 */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default Header
