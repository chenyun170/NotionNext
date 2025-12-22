import SmartLink from '@/components/SmartLink'

/**
 * 极简胶囊标签组件 V2.0
 */
const TagItemMini = ({ tag, selected = false }) => {
  if (!tag) return null

  return (
    <SmartLink
      key={tag.name}
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      className={`cursor-pointer inline-flex items-center rounded-full transition-all duration-300
        mr-2 mb-1 py-0.5 px-2.5 text-[11px] font-medium whitespace-nowrap tracking-tight
        ${selected
          ? 'text-white bg-blue-600 shadow-md transform scale-105'
          : `text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-sm`
        }`}
    >
      <div className='flex items-center uppercase'>
        {selected && <i className='mr-1 fas fa-tag text-[10px]' />}
        {tag.name}
        {tag.count ? <span className='ml-1 opacity-60 font-normal'>({tag.count})</span> : ''}
      </div>
    </SmartLink>
  )
}

export default TagItemMini
