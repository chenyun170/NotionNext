import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'

const TagItem = ({ tag, selected }) => {
  const { locale } = useGlobal()
  if (!tag) {
    <div> { locale.COMMON.NOTAG } </div>
  }
  return (
    <SmartLink
      href={selected ? '/' : `/tag/${encodeURIComponent(tag.name)}`}
      passHref
      legacyBehavior>
      <li
        className={`notion-${tag.color}_background dark:bg-stone-700 list-none cursor-pointer rounded-md  
        duration-200 mr-1 my-1 px-2 py-1 text-sm whitespace-nowrap 
         hover:bg-stone-200 dark:hover:bg-stone-800 `}>
        <div className='text-stone-600 dark:text-stone-300 dark:hover:text-white'>
          {selected && <i className='mr-1 fas fa-tag'/>} {`${tag.name} `} {tag.count ? `(${tag.count})` : ''}
        </div>
      </li>
    </SmartLink>
  );
}

export default TagItem
