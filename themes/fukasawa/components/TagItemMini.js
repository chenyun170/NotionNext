import SmartLink from '@/components/SmartLink'

/**
 * Fukasawa 主题适配版 - 极简胶囊标签 V2.1
 * 改进：优化了色调，增加了悬停位移，更符合瀑布流极简风
 */
const TagItemMini = ({ tag, selected = false }) => {
  if (!tag) return null

  return (
    <SmartLink
      key={tag.name}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`cursor-pointer inline-flex items-center rounded-md transition-all duration-300
        mr-3 mb-2 py-1 px-3 text-[11px] font-medium whitespace-nowrap tracking-widest uppercase
        ${selected
          ? 'text-white bg-black dark:bg-white dark:text-black shadow-lg transform -translate-y-0.5'
          : `text-gray-600 dark:text-gray-400 bg-white dark:bg-hexonight border border-gray-100 dark:border-gray-800 
             hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:-translate-y-0.5`
        }`}
    >
      <div className='flex items-center'>
        {selected && <i className='mr-2 fas fa-tag text-[9px]' />}
        <span className="leading-none">{tag.name}</span>
        {tag.count && (
          <span className={`ml-1.5 opacity-50 font-light ${selected ? 'text-gray-300 dark:text-gray-600' : ''}`}>
            {tag.count}
          </span>
        )}
      </div>
    </SmartLink>
  )
}

export default TagItemMini
