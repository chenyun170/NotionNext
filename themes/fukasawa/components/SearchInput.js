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
      {/* 搜索输入框：高度压缩至 h-8，样式与 SidebarTools 对齐 */}
      <input
        ref={searchInputRef}
        type='text'
        placeholder={locale.SEARCH.ARTICLES}
        className='w-full h-8 pl-3 pr-8 text-[11px] outline-none bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-orange-500/50 rounded-lg transition-all dark:text-gray-200'
        onKeyUp={handleKeyUp}
        onFocus={() => siteConfig('ALGOLIA_APP_ID') && searchModal?.current?.openSearch()}
        defaultValue={keyword || ''}
      />
      
      {/* 搜索图标：绝对定位在右侧 */}
      <div 
        className='absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer flex items-center justify-center'
        onClick={handleSearch}
      >
        <i className={`text-[10px] transition-colors duration-200 ${onLoading ? 'fa-spinner animate-spin text-orange-500' : 'fa-search text-gray-400 group-hover:text-orange-500'}`} />
      </div>

      {/* 清除按钮：仅在有搜索词时显示 */}
      {keyword && (
        <div 
          className='absolute right-7 top-1/2 -translate-y-1/2 cursor-pointer'
          onClick={() => { searchInputRef.current.value = ''; handleSearch(); }}
        >
          <i className='fas fa-times text-[10px] text-gray-300 hover:text-gray-500' />
        </div>
      )}
    </div>
  )
}

export default SearchInput
