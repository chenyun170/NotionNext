import SmartLink from '@/components/SmartLink'

/**
 * Fukasawa 瀑布流专用 - 高级质感标签组件
 */
const TagItemMini = ({ tag, selected = false }) => {
  if (!tag) return null

// TagItemMini.js 优化版样式
return (
  <SmartLink
    href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
    className={`inline-flex items-center rounded-md border py-1 px-3 text-[10px] tracking-widest uppercase transition-all duration-300
      mr-2 mb-2
      ${selected 
        ? 'bg-black text-white border-black shadow-md' 
        : 'bg-white text-zinc-400 border-zinc-100 hover:border-zinc-900 hover:text-zinc-900'
      } dark:bg-zinc-900 dark:border-zinc-800`}
  >
    <div className='flex items-center'>
      {tag.name}
      {tag.count && <span className='ml-2 opacity-30 font-light'>{tag.count}</span>}
    </div>
  </SmartLink>
)
}

export default TagItemMini
