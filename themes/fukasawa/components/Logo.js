'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
import { motion } from 'framer-motion' // 💡 注入忍者动效的核心库

const Logo = props => {
  const title = "外贸获客情报局"
  const characters = Array.from(title)

  // 🥷 👇👇👇 忍者黑烟特效配置 👇👇👇
  const smokeContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // 每个字母出现的间隔
        delayChildren: 0.2,
      },
    },
  };

  const smokeItem = {
    hidden: { 
      opacity: 0, 
      y: 20,              // 稍微从下方升起
      scale: 1.5,         // 初始烟雾比较大
      filter: "blur(15px)", // 极度模糊
      color: "transparent", // 文字本身透明
      textShadow: "0 0 20px rgba(0,0,0, 0.9)" // 核心：用黑色阴影模拟烟雾
    },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      color: "inherit", // 恢复文字原本颜色
      textShadow: "0 0 0px rgba(0,0,0, 0)", // 烟雾散去
      transition: { 
        duration: 1.2, 
        ease: [0.2, 0.65, 0.3, 0.9] // 类似烟雾飘散的缓动曲线
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

      <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        {/* Logo 图标 - 保持不变 */}
        <SmartLink href='/' className='flex flex-col items-center lg:items-start group cursor-pointer'>
        {/* Logo 图标 - 增加顺时针旋转效果 */}
        <div className='relative'>
          <img 
            src='/logo.png' 
            // 💡 关键修改：添加了 group-hover:rotate-12 (顺时针旋转12度)
            className='w-16 h-16 mb-2 object-contain transition-all duration-500 ease-in-out group-hover:rotate-12' 
            style={{ minWidth: '72px', minHeight: '72px' }}
            alt={siteConfig('TITLE')} 
          />
        </div>

        {/* 文字标题 - 注入忍者特效，同时保留扫光和颜色 */}
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
                {/* “外贸获客”底部的橘色横线动效保持不变 */}
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
      </SmartLink>
    </section>
  )
}

export default Logo
