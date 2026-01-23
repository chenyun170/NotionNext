import SmartLink from '@/components/SmartLink'

/**
 * Fukasawa 瀑布流专用 - 极简质感标签组件 (已优化暗黑模式)
 */
const TagItemMini = ({ tag, selected = false }) => {
  if (!tag) return null

  return (
    <SmartLink
      key={tag.name}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`group cursor-pointer inline-flex items-center transition-all duration-300
        mr-2 mb-2 py-1 px-3 rounded-md text-[10px] tracking-widest uppercase font-bold
        ${selected
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 transform -translate-y-0.5' 
          : 'bg-white/80 text-gray-500 border border-gray-100 hover:border-blue-500 hover:text-blue-600 hover:shadow-md hover:-translate-y-0.5'
        } 
        /* 💡 核心修复：暗黑模式下的背景与边框 */
        dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-blue-400 dark:hover:text-blue-400`}
    >
      <div className='flex items-center'>
        {selected && <i className='mr-1.5 fas fa-tag text-[8px] animate-pulse' />}
        <span className="whitespace-nowrap">{tag.name}</span>
        {tag.count && (
          <span className={`ml-1.5 text-[9px] font-mono opacity-40 group-hover:opacity-100 transition-opacity`}>
            {tag.count}
          </span>
        )}
      </div>
    </SmartLink>
  )
}

export default TagItemMini
