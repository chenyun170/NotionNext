import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  return (
    <section className='flex justify-center lg:justify-start overflow-visible'>
      {/* 注入雪花和圣诞帽的样式 */}
      <style jsx>{`
        .christmas-container {
          position: relative;
          display: inline-block;
        }
        /* 圣诞帽定位 */
        .santa-hat {
          position: absolute;
          top: -15px;
          left: -10px;
          width: 40px;
          z-index: 10;
          transform: rotate(-15deg);
          pointer-events: none;
        }
        /* 雪花容器 */
        .snow-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        /* 雪花动画 */
        .snowflake {
          position: absolute;
          color: #fff;
          font-size: 10px;
          opacity: 0.8;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0% { transform: translateY(-20px) translateX(0); opacity: 1; }
          100% { transform: translateY(60px) translateX(10px); opacity: 0; }
        }
      `}</style>

      <SmartLink
        href='/'
        className='flex flex-col items-center lg:items-start group cursor-pointer'
      >
        <div className='christmas-container'>
          {/* 1. 圣诞帽图片 (确保你上传了一张 hat.png 到 public 文件夹) */}
          <img 
            src='https://img.icons8.com/color/96/santa-hat.png' 
            className='santa-hat' 
            alt='Christmas Hat' 
          />

          {/* 2. Logo 图片 */}
          <div className='relative'>
             <img src='/logo.png' className='w-16 h-16 mb-3 object-contain relative z-0' alt={siteConfig('TITLE')} />
             
             {/* 3. 动态雪花代码表示 */}
             <div className='snow-wrapper'>
                <span className='snowflake' style={{left: '10%', animationDuration: '2s'}}>❄</span>
                <span className='snowflake' style={{left: '40%', animationDuration: '3s', animationDelay: '1s'}}>❅</span>
                <span className='snowflake' style={{left: '70%', animationDuration: '2.5s', animationDelay: '0.5s'}}>❆</span>
             </div>
          </div>
        </div>

        {/* 4. 文字标题部分 */}
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
