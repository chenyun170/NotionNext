'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  // 核心逻辑保留：自动化时间逻辑，11月至次年2月开启装饰
  const now = new Date()
  const month = now.getMonth() + 1
  const showChristmas = month >= 11 || month <= 2

  return (
    <section className='flex justify-center lg:justify-start overflow-visible'>
      <style jsx>{`
        /* 金属流光动画 */
        .shimmer-text {
          background: linear-gradient(90deg, transparent 0%, #ff8c00 50%, transparent 100%);
          background-size: 200% 100%;
          background-clip: text;
          animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* 圣诞帽物理摆动律动 */
        .santa-hat-animated {
          animation: hat-swing 3s ease-in-out infinite;
          transform-origin: bottom left;
        }
        @keyframes hat-swing {
          0%, 100% { transform: rotate(25deg) scale(1); }
          50% { transform: rotate(28deg) scale(1.05); }
        }

        .christmas-container { 
          position: relative; 
          display: inline-block; 
          z-index: 10;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .christmas-container:hover {
          transform: translateY(-2px) scale(1.02);
        }

        /* 磨砂感雪花效果 - 调整 z-index 让其处于最前面 */
        .snowflake {
          position: absolute; 
          color: #fff; 
          font-size: 12px;
          filter: blur(0.4px); 
          text-shadow: 0 0 8px rgba(255,255,255,0.8);
          animation: fall linear infinite;
          z-index: 100; /* 设置较高的 z-index，确保雪花在最前面 */
        }
        @keyframes fall {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(45px) rotate(360deg); opacity: 0; }
        }
      `}</style>

      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        <div className='christmas-container'>
          
          {/* 1. 圣诞帽：适配极小 Logo (w-6) 的黄金坐标 */}
          {showChristmas && (
            <img 
              src='https://cloudflare-imgbed-aa9.pages.dev/file/1766208503664_hat.png' 
              className='santa-hat-animated' 
              style={{ 
                position: 'absolute',
                top: '-9px', 
                left: '11px', 
                width: '18px', 
                zIndex: 30,
                pointerEvents: 'none'
              }}
              alt='Christmas Hat' 
            />
          )}

          {/* 2. Logo 图片：锁定 w-8 (32px) 适应比例 */}
          <img 
            src='/logo.png' 
            className='w-8 h-8 mb-2 object-contain relative z-10 transition-all duration-500 group-hover:brightness-110 group-hover:drop-shadow-md' 
            style={{ minWidth: '32px', minHeight: '32px' }}
            alt={siteConfig('TITLE')} 
          />

          {/* 3. 雪花层 */}
          {showChristmas && (
            <div className='absolute top-0 left-0 w-full h-full pointer-events-none z-50 overflow-visible'>
              <span className='snowflake' style={{left: '5%', animationDuration: '2.8s'}}>❄</span>
              <span className='snowflake' style={{left: '45%', animationDuration: '3.8s', animationDelay: '0.5s'}}>❅</span>
              <span className='snowflake' style={{left: '85%', animationDuration: '3.2s', animationDelay: '1.2s'}}>❆</span>
            </div>
          )}
        </div>

        {/* 文字标题：排版比例升级 */}
        <div className='text-center lg:text-left relative z-20 mt-0.5'>
            <div className='text-base font-black tracking-tight text-slate-800 dark:text-gray-100 flex items-center'>
              <span className='relative'>
                外贸获客
                {/* 悬浮线条平滑展开 */}
                <div className='absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
              </span>
              <span className='text-orange-600 shimmer-text ml-0.5'>情报局</span>
            </div>
            
            {/* 副标题：字间距增加，提升品牌质感 */}
            <div className='text-[8px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-[0.22em] transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-400'>
                Trade Intelligence Bureau
            </div>
        </div>
      </SmartLink>
    </section>
  )
}

export default Logo
