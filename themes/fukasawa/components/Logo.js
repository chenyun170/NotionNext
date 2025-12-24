'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  return (
    <section className='flex justify-center lg:justify-start overflow-visible'>
      <style jsx>{`
        .shimmer-text {
          background: linear-gradient(90deg, transparent 0%, #ff8c00 50%, transparent 100%);
          background-size: 200% 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: shimmer 3s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>

      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        {/* Logo 图标 */}
        <div className='relative'>
          <img 
            src='/logo.png' 
            className='w-4 h-4 mb-2 object-contain transition-all duration-500 group-hover:brightness-110 group-hover:drop-shadow-md' 
            style={{ minWidth: '16px', minHeight: '16px' }}
            alt={siteConfig('TITLE')} 
          />
        </div>

        {/* 文字标题 */}
        <div className='text-center lg:text-left relative z-20 mt-1'>
          <div className='text-base font-black tracking-tight text-slate-800 dark:text-gray-100 flex items-center'>
            <span className='relative'>
              外贸获客
              <div className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
            </span>
            <span className='text-orange-600 shimmer-text ml-0.5'>情报局</span>
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
