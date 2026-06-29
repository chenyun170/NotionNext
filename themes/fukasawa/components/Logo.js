'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  const title = "外贸获客情报局"
  const characters = Array.from(title)

  return (
    <section className='flex justify-start overflow-visible'>
      <style jsx>{`
        .logo-title {
          opacity: 0;
          animation: logoFadeIn 0.2s ease-out 0.2s forwards;
        }
        .logo-char {
          opacity: 0;
          filter: blur(15px);
          transform: translateY(20px) scale(1.5);
          text-shadow: 0 0 20px rgba(0, 0, 0, 0.9);
          animation: logoSmokeIn 1.2s cubic-bezier(0.2, 0.65, 0.3, 0.9) forwards;
        }
        .shimmer-text {
          background: linear-gradient(90deg, transparent 0%, #ff8c00 50%, transparent 100%);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 3s infinite linear;
        }
        @keyframes logoFadeIn {
          to { opacity: 1; }
        }
        @keyframes logoSmokeIn {
          to {
            opacity: 1;
            filter: blur(0);
            transform: translateY(0) scale(1);
            text-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <SmartLink href='/' className='flex flex-row items-center gap-2 group cursor-pointer lg:flex-col lg:items-start lg:gap-0'>
        
{/* Logo 图标容器 */}
<div className='relative'> 
  <img 
    src='/logo.png' 
    className='h-10 w-10 min-w-10 object-contain transition-all duration-500 ease-in-out transform hover:rotate-12 inline-block lg:mb-2 lg:h-16 lg:w-16 lg:min-w-[72px]'
    alt={siteConfig('TITLE')} 
  />
</div>

        {/* 文字标题 */}
        <div className='text-left relative z-20 lg:mt-1'>
          <div
            className='logo-title text-base font-black tracking-tight text-slate-800 dark:text-gray-100 flex items-center'
          >
            {characters.map((char, index) => (
              <span
                key={index}
                className={`logo-char relative ${index >= 4 ? 'text-orange-600 shimmer-text ml-0.5' : ''}`}
                style={{ animationDelay: `${0.2 + index * 0.15}s` }}
              >
                {char}
                {index < 4 && (
                  <div className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
                )}
              </span>
            ))}
          </div>
          <div className='text-[8px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-[0.22em] transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-400'>
            Trade Intelligence Bureau
          </div>
        </div>

      </SmartLink>
    </section>
  )
}

export default Logo
