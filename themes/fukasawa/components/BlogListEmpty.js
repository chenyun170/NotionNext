import SmartLink from '@/components/SmartLink'
import { useGlobal } from '@/lib/global'

/**
 * 空白列表状态
 */
const BlogListEmpty = ({ currentSearch }) => {
  const { locale } = useGlobal()

  return (
    <div className='mx-auto flex max-w-lg flex-col items-center justify-center rounded-2xl border border-stone-200/90 bg-white px-6 py-14 text-center shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0ec] text-lg text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
        <i className='fas fa-search' />
      </div>
      <h2 className='text-base font-bold text-stone-900 dark:text-stone-100'>
        {locale?.COMMON?.NO_RESULTS_FOUND || '暂时没有找到相关文章'}
      </h2>
      {currentSearch && (
        <p className='mt-1.5 text-xs text-stone-500 dark:text-stone-400'>
          关键词：{currentSearch}
        </p>
      )}
      <p className='mt-2 text-xs leading-6 text-stone-500 dark:text-stone-400'>
        可以尝试换个关键词，或先看看海关数据专题和全部归档内容。
      </p>
      <div className='mt-5 flex flex-wrap justify-center gap-2.5'>
        <SmartLink
          href='/'
          className='inline-flex h-9 items-center rounded-xl bg-[#1c5a4a] px-4 text-xs font-semibold text-white no-underline transition hover:bg-[#14453a]'
        >
          返回首页
        </SmartLink>
        <SmartLink
          href='/archive'
          className='inline-flex h-9 items-center rounded-xl border border-stone-300 bg-white px-4 text-xs font-semibold text-stone-700 no-underline transition hover:border-[#1c5a4a] hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
        >
          查看时间归档
        </SmartLink>
      </div>
    </div>
  )
}

export default BlogListEmpty
