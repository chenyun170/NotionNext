import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = props => {
  return (
    <section className='flex'>
      <SmartLink
        href='/'
        /* 这里移除了 border-2 和 border-black，增加了深蓝和橙色的文字设计 */
        className='logo duration-500 cursor-pointer dark:text-gray-300 font-black flex flex-col items-start'
      >
        {/* 第一行：外贸获客，使用深蓝色 */}
        <span className='text-2xl tracking-tighter text-slate-800 dark:text-white'>
          外贸获客
        </span>
        
        {/* 第二行：情报局，使用橙色，并加一个简单的底线设计 */}
        <span className='text-3xl tracking-tighter text-orange-600 border-b-4 border-orange-600 pb-1'>
          情报局
        </span>

        {/* 第三行：英文副标题，增加专业感 */}
        <span className='text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-medium'>
          Trade Intelligence Bureau
        </span>
      </SmartLink>
    </section>
  )
}

export default Logo
