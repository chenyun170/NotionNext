import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  // 自动化时间逻辑：11月至次年2月开启装饰
  const now = new Date()
  const month = now.getMonth() + 1
  const showChristmas = month >= 11 || month <= 2

  return (
    <section className='flex justify-center lg:justify-start overflow-visible'>
      <style jsx>{`
        .christmas-container { 
          position: relative; 
          display: inline-block; 
          z-index: 10;
        }
        /* 圣诞帽层级 */
        .santa-hat {
          position: absolute; 
          z-index: 30; 
          pointer-events: none;
          background: transparent !important; /* 确保背景透明 */
        }
        /* 雪花容器：z-index 设为最高，确保在图片最前端 */
        .snow-wrapper { 
          position: absolute; 
          top: 0; 
          left: 0; 
          width: 100%; 
          height: 100%; 
          pointer-events: none; 
          z-index: 50; 
        }
        /* 雪花样式 */
        .snowflake {
          position: absolute; 
          color: #fff; 
          font-size: 14px; 
          text-shadow: 0 0 5px rgba(0,0,0,0.2);
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(60px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        <div className='christmas-container'>
          
     {/* 1. 圣诞帽：针对 24px 的 Logo 重新计算坐标 */}
{showChristmas && (
  <img 
    src='https://cloudflare-imgbed-aa9.pages.dev/file/1766208503664_hat.png' 
    className='santa-hat' 
    style={{ 
      top: '-10px',    /* 向上偏移减小 */
      left: '12px',   /* 对于 24px 宽的 Logo，12px 刚好是中心偏右 */
      width: '14px',  /* 帽子也要等比例缩小，比 Logo 宽度略小 */
      transform: 'rotate(25deg)',
      position: 'absolute',
      zIndex: 30
    }}
    alt='Christmas Hat' 
  />
)}

{/* 2. Logo 图片：强制锁定物理尺寸，防止被 AsideLeft 的布局拉伸 */}
<img 
  src='/logo.png' 
  className='w-6 h-6 mb-2 object-contain relative z-10' 
  style={{ 
    minWidth: '24px', /* 增加硬性限制，防止 Flex 布局拉伸 */
    minHeight: '24px' 
  }}
  alt={siteConfig('TITLE')} 
/>

          {/* 3. 雪花层 (在最前端) */}
          {showChristmas && (
            <div className='snow-wrapper'>
              <span className='snowflake' style={{left: '10%', animationDuration: '2.5s'}}>❄</span>
              <span className='snowflake' style={{left: '40%', animationDuration: '3.5s', animationDelay: '1s'}}>❅</span>
              <span className='snowflake' style={{left: '70%', animationDuration: '3s', animationDelay: '0.5s'}}>❆</span>
              <span className='snowflake' style={{left: '90%', animationDuration: '4.5s', animationDelay: '2s'}}>❄</span>
            </div>
          )}
        </div>

        {/* 文字标题 */}
        <div className='text-center lg:text-left relative z-20'>
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
