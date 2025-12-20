import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  // --- 自动化时间逻辑开始 ---
  const now = new Date()
  const month = now.getMonth() + 1 // JavaScript 月份从 0 开始，所以 +1
  
  // 设定范围：11月(11) 到 次年2月(2)
  // 逻辑：如果月份 >= 11 或者 月份 <= 2，则显示装饰
  const showChristmas = month >= 11 || month <= 2
  // --- 自动化时间逻辑结束 ---

  return (
    <section className='flex justify-center lg:justify-start overflow-visible'>
      <style jsx>{`
        .christmas-container { position: relative; display: inline-block; }
        .santa-hat {
          position: absolute; top: -18px; left: 12px; width: 42px;
          z-index: 10; transform: rotate(-15deg); pointer-events: none;
        }
        .snow-wrapper { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; }
        .snowflake {
          position: absolute; color: #fff; font-size: 12px; opacity: 0.8;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-10px) translateX(0); opacity: 1; }
          100% { transform: translateY(50px) translateX(10px); opacity: 0; }
        }
      `}</style>

      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        <div className='christmas-container'>
          
          {/* --- 只有在设定时间内才渲染装饰 --- */}
          {showChristmas && (
            <>
              {/* 圣诞帽 */}
              <img 
                src='https://cloudflare-imgbed-aa9.pages.dev/file/1766201111415_hat.png'   
                className='santa-hat' 
                alt='Christmas Hat' 
              />
              {/* 雪花群 */}
              <div className='snow-wrapper'>
                <span className='snowflake' style={{left: '5%', animationDuration: '2s'}}>❄</span>
                <span className='snowflake' style={{left: '35%', animationDuration: '3s', animationDelay: '1s'}}>❅</span>
                <span className='snowflake' style={{left: '65%', animationDuration: '2.5s', animationDelay: '0.5s'}}>❆</span>
                <span className='snowflake' style={{left: '90%', animationDuration: '4s', animationDelay: '2s'}}>❄</span>
              </div>
            </>
          )}

          {/* 核心 Logo 图片 */}
          <img src='/logo.png' className='w-16 h-16 mb-3 object-contain relative z-0' alt={siteConfig('TITLE')} />
        </div>

        {/* 文字标题 */}
        <div className='text-center lg:text-left'>
            <div className='text-xl font-black tracking-tighter text-slate-800 dark:text-gray-200 border-b-4 border-orange-500 inline-block pb-1'>
                外贸获客<span className='text-orange-600'>情报局</span>
            </div>
            <div className='text-[10px] font-medium text-gray-400 mt-1 uppercase tracking-widest'>
                Trade Intelligence Bureau
            </div>
        </div>
      </SmartLink>
    </section>
  )
}

export default Logo
