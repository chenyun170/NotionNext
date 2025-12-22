import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react' // 引入 React 钩子

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()

  // 定义状态：默认都不显示，等浏览器加载完算好时间后再显示
  // 这样可以避免服务器和客户端时间不一致导致的报错
  const [showActivity1, setShowActivity1] = useState(false)
  const [showActivity2, setShowActivity2] = useState(false)

  useEffect(() => {
    const now = new Date()

    // --- 活动 1 配置：外贸获客工具 ---
    // 设置截止时间为 2025年12月31日 23:59:59
    const deadline1 = new Date('2025-12-31T23:59:59')
    if (now < deadline1) {
      setShowActivity1(true)
    }

    // --- 活动 2 配置：新春特惠或其它活动 ---
    // 设置截止时间为 2026年01月15日 23:59:59
    const deadline2 = new Date('2026-01-15T23:59:59')
    if (now < deadline2) {
      setShowActivity2(true)
    }
  }, [])

  return (
    <div className={className}>
      <section id='announcement-wrapper' className="dark:text-gray-300 rounded-xl px-2 py-4">
        
        {/* --- 活动 1 模块 --- */}
        {showActivity1 && (
          <div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm border-dashed'>
              <div className='flex items-center text-orange-600 font-bold text-sm mb-1'>
                  <i className='fas fa-gift mr-2 animate-bounce' /> 活动一：图灵搜岁末活动
              </div>
              <p className='text-xs text-gray-700'>
                  🔥 <strong>外贸获客工具</strong> 原价 ¥2180，现仅需 <strong>¥1600</strong>！限时：2025.12.31
              </p>
              <a href="http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6" target="_blank" rel="noopener noreferrer" 
                 className='inline-block bg-orange-500 text-white text-[10px] px-2 py-1 rounded mt-2 hover:bg-orange-600 transition-colors'>
                 立即参与 →
              </a>
          </div>
        )}

        {/* --- 活动 2 模块 --- */}
        {showActivity2 && (
          <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-sm border-dashed'>
              <div className='flex items-center text-blue-600 font-bold text-sm mb-1'>
                  <i className='fas fa-fire mr-2 animate-pulse' /> 活动二：顶易云岁末活动
              </div>
              <p className='text-xs text-gray-700'>
                  🚀 <strong>高阶获客工具</strong> 限时赠送社媒搜索工具、138届广交会名录！限时：2025.12.31
              </p>
              <a href="http://h.topeasysoft.com/20251211dyy/index.html?i=BB54F6" target="_blank" rel="noopener noreferrer" 
                 className='inline-block bg-blue-500 text-white text-[10px] px-2 py-1 rounded mt-2 hover:bg-blue-600 transition-colors'>
                 查看详情 →
              </a>
          </div>
        )}

        {/* 原有的 Notion 公告内容 */}
        {post?.blockMap && (
            <>
                <div className='text-sm font-bold mb-2 pt-2 border-t border-gray-100 text-gray-400'>
                    <i className='mr-2 fas fa-bullhorn' />{locale.COMMON.ANNOUNCEMENT}
                </div>
                <div id="announcement-content">
                    <NotionPage post={post} className='text-center ' />
                </div>
            </>
        )}
      </section>
    </div>
  )
}

export default Announcement
