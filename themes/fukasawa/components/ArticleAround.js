import SmartLink from '@/components/SmartLink'

/**
 * 优化版文章上下页导航
 */
export default function ArticleAround ({ prev, next }) {
  // 如果前后都没有，才不渲染
  if (!prev && !next) {
    return null
  }

  return (
    <section className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 my-8 h-auto md:h-24'>
      {/* 上一篇文章 */}
      {prev ? (
        <SmartLink
          href={`/${prev.slug}`}
          className='group relative overflow-hidden flex flex-col justify-center p-4 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:border-black dark:hover:border-white'
        >
          <div className='text-[10px] text-zinc-400 uppercase tracking-widest mb-1 flex items-center'>
            <i className='fas fa-chevron-left mr-2' /> Previous
          </div>
          <div className='text-sm font-bold truncate group-hover:text-blue-600 transition-colors'>
            {prev.title}
          </div>
        </SmartLink>
      ) : (
        <div className='hidden md:block border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg' />
      )}

      {/* 下一篇文章 */}
      {next ? (
        <SmartLink
          href={`/${next.slug}`}
          className='group relative overflow-hidden flex flex-col justify-center p-4 text-right bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:border-black dark:hover:border-white'
        >
          <div className='text-[10px] text-zinc-400 uppercase tracking-widest mb-1 flex items-center justify-end'>
            Next <i className='fas fa-chevron-right ml-2' />
          </div>
          <div className='text-sm font-bold truncate group-hover:text-blue-600 transition-colors'>
            {next.title}
          </div>
        </SmartLink>
      ) : (
        <div className='hidden md:block border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg' />
      )}
    </section>
  )
}
