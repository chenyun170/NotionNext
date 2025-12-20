import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  return (
    <section className='flex justify-center lg:justify-start'>
      <SmartLink
        href='/'
        className='flex flex-col items-center lg:items-start group cursor-pointer'
      >
        {/* 1. 图标部分：这里放置你处理好的纯图形Logo */}
        {/* 如果你已经上传了logo.png到public文件夹，请取消下面img标签的注释 */}
              <img src='/logo.png' className='w-16 h-16 mb-3 object-contain' alt={siteConfig('TITLE')} /> 
        
        {/* 2. 临时图标方案：在没上传图片前，先用一个带颜色的雷达图标占位 */}
        {/*<div className='w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-105 duration-300'> */}
               {/*<i className='fas fa-radar text-orange-500 text-2xl animate-pulse'></i> */}
        </div>

        {/* 3. 文字标题部分：代码渲染，字绝对不会错 */}
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
