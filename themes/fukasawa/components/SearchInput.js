import { useGlobal } from '@/lib/global'
import { useRouter } from 'next/router'
import { useImperativeHandle, useRef, useState } from 'react'
import { useFukasawaGlobal } from '@/themes/fukasawa'
import { siteConfig } from '@/lib/config'

const SearchInput = (props) => {
  const { keyword, cRef } = props
  const { searchModal } = useFukasawaGlobal()
  const [onLoading, setLoadingState] = useState(false)
  const { locale } = useGlobal()
  const router = useRouter()
  const searchInputRef = useRef()

  useImperativeHandle(cRef, () => ({
    focus: () => searchInputRef?.current?.focus()
  }))

  const handleSearch = () => {
    if (siteConfig('ALGOLIA_APP_ID')) {
      searchModal?.current?.openSearch()
      return
    }
    const key = searchInputRef.current.value
    if (key && key !== '') {
      setLoadingState(true)
      // 使用 encodeURIComponent 确保特殊字符不会导致路由错误
      router.push({ pathname: '/search/' + encodeURIComponent(key) }).then(() => {
        setLoadingState(false)
      })
    } else {
      router.push({ pathname: '/' })
    }
  }

  const handleKeyUp = (e) => {
    if (e.keyCode === 13) handleSearch()
    if (e.keyCode === 27) searchInputRef.current.value = ''
  }

  return (
    <div className='relative w-full group'>
      {/* 搜索输入框：提高字号和点击区域，减轻长时间阅读后的识别负担 */}
      <input
        ref={searchInputRef}
        type='text'
        placeholder={locale.SEARCH.ARTICLES}
        className='h-9 w-full rounded-lg border border-transparent bg-gray-100/70 pl-3.5 pr-9 text-[13px] outline-none transition-all placeholder:text-zinc-400 focus:border-orange-500/50 focus:bg-white dark:bg-white/5 dark:text-gray-200 dark:focus:bg-zinc-900'
        onKeyUp={handleKeyUp}
        onFocus={() => siteConfig('ALGOLIA_APP_ID') && searchModal?.current?.openSearch()}
        defaultValue={keyword || ''}
      />
      
      {/* 搜索图标：绝对定位在右侧 */}
      <div 
        className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center'
        onClick={handleSearch}
      >
        <i className={`text-xs transition-colors duration-200 ${onLoading ? 'fa-spinner animate-spin text-orange-500' : 'fa-search text-gray-400 group-hover:text-orange-500'}`} />
      </div>

      {/* 清除按钮：仅在有搜索词时显示 */}
      {keyword && (
        <div 
          className='absolute right-7 top-1/2 -translate-y-1/2 cursor-pointer'
          onClick={() => { searchInputRef.current.value = ''; handleSearch(); }}
        >
          <i className='fas fa-times text-xs text-gray-300 hover:text-gray-500' />
        </div>
      )}
    </div>
  )
}

export default SearchInput
