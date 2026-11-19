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
      className={`tag-item-mini group cursor-pointer inline-flex items-center transition-all duration-300
        mr-2 mb-2 rounded-md text-[12px] tracking-wide font-bold
        ${selected
          ? 'bg-stone-900 text-white shadow-none transform -translate-y-0.5' 
          : 'bg-white/80 text-stone-500 border border-stone-100 hover:border-stone-400 hover:text-stone-800 hover:shadow-md hover:-translate-y-0.5'
        } 
        /* 💡 核心修复：暗黑模式下的背景与边框 */
        dark:bg-stone-900/80 dark:border-stone-800 dark:text-stone-400 dark:hover:border-stone-400 dark:hover:text-stone-200`}
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
