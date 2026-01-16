/**
 * 升级版加载过程遮罩 - 适配 Fukasawa 极简风
 * 改进：增加了毛玻璃质感、动画缓动以及全局层级锁定
 */
export default function LoadingCover () {
  return (
    <div 
      id='cover-loading' 
      className='fixed inset-0 z-[100] flex justify-center items-center 
                 bg-white/60 dark:bg-black/60 backdrop-blur-sm 
                 transition-all duration-500 pointer-events-auto'
    >
      <div className='flex flex-col items-center'>
        {/* 中心旋转区域 */}
        <div className='relative w-16 h-16 flex items-center justify-center'>
          {/* 背景动态光圈 */}
          <div className='absolute inset-0 border-2 border-gray-200 dark:border-gray-800 rounded-full'></div>
          <div className='absolute inset-0 border-t-2 border-black dark:border-white rounded-full animate-spin'></div>
          
          {/* 中心图标 */}
          <i className="fa-solid fa-fan text-xl text-black dark:text-white animate-pulse"></i>
        </div>
        
        {/* 加载文字提示 - 增加仪式感 */}
        <p className='mt-4 text-[10px] tracking-[0.3em] uppercase font-medium text-gray-500 dark:text-gray-400 animate-pulse'>
          Loading Data
        </p>
      </div>

      {/* 注入简单的入场动画 */}
      <style jsx>{`
        #cover-loading {
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
