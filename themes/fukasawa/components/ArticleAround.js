import SmartLink from '@/components/SmartLink'

/**
 * 上一篇，下一篇文章
 * @param {prev,next} param0
 */
export default function ArticleAround ({ prev, next }) {
  if (!prev && !next) {
    return <></>
  }
  return (
    <section className='my-6 grid grid-cols-1 gap-3 sm:my-8 sm:grid-cols-2'>
      {prev && (
        <SmartLink
          href={`/${prev.slug}`}
          passHref
          className='group flex flex-col rounded-xl border border-stone-200 bg-white/70 px-4 py-3 no-underline transition-colors hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700'>
          <span className='mb-1 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500'>
            <i className='mr-1.5 fas fa-angle-left' />
            上一篇
          </span>
          <span className='line-clamp-2 text-sm font-semibold leading-6 text-stone-800 transition-colors group-hover:text-stone-950 dark:text-stone-200 dark:group-hover:text-stone-50'>
            {prev.title}
          </span>
        </SmartLink>
      )}

      {next && (
        <SmartLink
          href={`/${next.slug}`}
          passHref
          className='group flex flex-col items-end rounded-xl border border-stone-200 bg-white/70 px-4 py-3 text-right no-underline transition-colors hover:border-stone-300 hover:bg-white dark:border-stone-800 dark:bg-stone-900/60 dark:hover:border-stone-700 sm:col-start-2'>
          <span className='mb-1 flex items-center text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400 dark:text-stone-500'>
            下一篇
            <i className='ml-1.5 fas fa-angle-right' />
          </span>
          <span className='line-clamp-2 text-sm font-semibold leading-6 text-stone-800 transition-colors group-hover:text-stone-950 dark:text-stone-200 dark:group-hover:text-stone-50'>
            {next.title}
          </span>
        </SmartLink>
      )}
    </section>
  )
}
