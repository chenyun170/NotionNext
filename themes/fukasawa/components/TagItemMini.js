import SmartLink from '@/components/SmartLink'

/**
 * Fukasawa 瀑布流专用 - 高级质感标签组件
 */
const TagItemMini = ({ tag, selected = false }) => {
  if (!tag) return null

  return (
    <SmartLink
      key={tag.name}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`group cursor-pointer inline-flex items-center transition-all duration-300
        mr-3 mb-3 py-1.5 px-4 rounded-md text-[11px] tracking-widest uppercase font-medium
        ${selected
          ? 'bg-black text-white shadow-lg transform -translate-y-0.5' 
          : 'bg-white text-gray-500 border border-gray-100 hover:border-black hover:text-black hover:shadow-md hover:-translate-y-0.5'
        } dark:bg-hexonight dark:border-gray-800 dark:text-gray-400`}
    >
      <div className='flex items-center'>
        {selected && <i className='mr-2 fas fa-tag text-[9px] animate-pulse' />}
        <span>{tag.name}</span>
        {tag.count && (
          <span className={`ml-2 text-[9px] opacity-40 group-hover:opacity-100 transition-opacity`}>
            {tag.count}
          </span>
        )}
      </div>
    </SmartLink>
  )
}

export default TagItemMini
