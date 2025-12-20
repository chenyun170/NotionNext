import { useGlobal } from '@/lib/global'
import dynamic from 'next/dynamic'

const NotionPage = dynamic(() => import('@/components/NotionPage'))

const Announcement = ({ post, className }) => {
  const { locale } = useGlobal()

  // --- 1. 设置活动截止日期 ---
  const EXPIRE_DATE = '2025-12-31' 
  
  const today = new Date()
  const expireDate = new Date(EXPIRE_DATE)
  const isExpired = today > expireDate

  return (
    <div className={className}>
      <section id='announcement-wrapper' className="dark:text-gray-300 rounded-xl px-2 py-4">
        
        {/* --- 2. 自动到期的活动提示 --- */}
        {!isExpired && (
          <div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg shadow-sm border-dashed'>
              <div className='flex items-center text-orange-600 font-bold text-sm mb-1'>
                  <i className='fas fa-gift mr-2 animate-bounce' /> 限时特惠活动
              </div>
              <p className='text-xs text-gray-700 leading-relaxed'>
                  🔥 <strong>外贸获客软件岁末大酬宾</strong> 正在进行中！
                  <br />
                  原价 ¥2180，现团购价仅需 <strong>¥1600</strong>。
              </p>
              <a href="http://h.topeasysoft.com/20251211tls/index.html?i=BB54F6" target="_blank" rel="noopener noreferrer" 
                 className='inline-block bg-orange-500 text-white text-[10px] px-2 py-1 rounded mt-2 hover:bg-orange-600 transition-colors'>
                  立即参与 →
              </a>
          </div>
        )}

        {/* 原有的 Notion 公告内容 */}
        {post?.blockMap && (
            <>
                <div className='text-sm font-bold mb-2 pt-2 border-t border-gray-100'>
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
