'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import { motion } from 'framer-motion'

const Logo = props => {
  const title = "外贸获客情报局"
  const characters = Array.from(title)

  // 忍者黑烟特效配置
  const smokeContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const smokeItem = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 1.5, 
      filter: "blur(15px)", 
      color: "transparent", 
      textShadow: "0 0 20px rgba(0,0,0, 0.9)" 
    },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      color: "inherit", 
      textShadow: "0 0 0px rgba(0,0,0, 0)", 
      transition: { 
        duration: 1.2, 
        ease: [0.2, 0.65, 0.3, 0.9] 
      }
    },
  };

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

      {/* 💡 修复点：确保 SmartLink 只有一个开口和一个闭口 */}
      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        
        {/* Logo 图标 - 顺时针旋转效果 */}
        <div className='relative'>
          <img 
            src='/logo.png' 
            className='w-16 h-16 mb-2 object-contain transition-all duration-500 ease-in-out group-hover:rotate-12' 
            style={{ minWidth: '72px', minHeight: '72px' }}
            alt={siteConfig('TITLE')} 
          />
        </div>

        {/* 文字标题 - 忍者特效 */}
        <div className='text-center lg:text-left relative z-20 mt-1'>
          <motion.div 
            variants={smokeContainer}
            initial="hidden"
            animate="show"
            className='text-base font-black tracking-tight text-slate-800 dark:text-gray-100 flex items-center'
          >
            {characters.map((char, index) => (
              <motion.span
                key={index}
                variants={smokeItem}
                className={`relative ${index >= 4 ? 'text-orange-600 shimmer-text ml-0.5' : ''}`}
              >
                {char}
                {index < 4 && (
                  <div className='absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
                )}
              </motion.span>
            ))}
          </motion.div>
          <div className='text-[8px] font-bold text-gray-400 dark:text-gray-500 mt-1 uppercase tracking-[0.22em] transition-colors group-hover:text-gray-600 dark:group-hover:text-gray-400'>
            Trade Intelligence Bureau
          </div>
        </div>

      </SmartLink> {/* 💡 确保这里闭合 */}
    </section>
  )
}

export default Logo
