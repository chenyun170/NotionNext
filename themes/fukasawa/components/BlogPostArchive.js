import SmartLink from '@/components/SmartLink'

/**
 * 现代时间轴风格归档分组
 */
const BlogArchiveItem = ({ posts = [], archiveTitle }) => {
  if (!posts || posts.length === 0) {
    return null
  }

  return (
    <section id={archiveTitle} className='mb-8 scroll-mt-24 last:mb-0'>
      <div className='mb-3 flex items-center justify-between border-b border-stone-200/80 pb-2.5 dark:border-stone-800'>
        <h2 className='font-mono text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100 sm:text-xl'>
          {archiveTitle}
        </h2>
        <span className='rounded-full bg-[#e8f0ec] px-2.5 py-0.5 text-[11px] font-semibold tabular-nums text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
          {posts.length} 篇
        </span>
      </div>

      <ul className='divide-y divide-stone-100 dark:divide-stone-800/80'>
        {posts.map(post => (
          <li key={post.id} id={post?.publishDay}>
            <SmartLink
              href={post?.href}
              className='group flex items-baseline justify-between gap-4 rounded-lg px-2 py-2.5 no-underline transition-colors hover:bg-[#faf9f6] dark:hover:bg-stone-800/40'
            >
              <div className='flex min-w-0 items-baseline gap-3 sm:gap-4'>
                <span className='shrink-0 font-mono text-xs tabular-nums text-stone-400 dark:text-stone-500'>
                  {post.date?.start_date || post?.publishDay}
                </span>
                <span className='truncate text-sm font-medium text-stone-800 transition-colors group-hover:text-[#1c5a4a] dark:text-stone-200 dark:group-hover:text-[#6bc4a6] sm:text-[15px]'>
                  {post.title}
                </span>
              </div>
              <span className='hidden shrink-0 text-xs text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#1c5a4a] dark:text-stone-600 dark:group-hover:text-[#6bc4a6] sm:inline'>
                →
              </span>
            </SmartLink>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default BlogArchiveItem
