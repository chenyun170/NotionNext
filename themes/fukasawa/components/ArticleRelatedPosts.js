import LazyImage from '@/components/LazyImage'
import SmartLink from '@/components/SmartLink'

const ArticleRelatedPosts = ({ posts = [] }) => {
  const relatedPosts = posts?.filter(Boolean).slice(0, 4) || []

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <section className='mt-12 print:hidden' aria-label='相关阅读'>
      <div className='mb-5 flex items-end justify-between gap-4'>
        <div>
          <div className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400'>
            <i className='fas fa-layer-group' />
            <span>Related Reading</span>
          </div>
          <h2 className='text-2xl font-black text-zinc-900 dark:text-zinc-50'>
            继续延展这个主题
          </h2>
        </div>
        <SmartLink
          href='/archive'
          className='hidden text-sm font-semibold text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300 sm:inline-flex'>
          全部文章
          <i className='fas fa-arrow-right ml-2 text-xs' />
        </SmartLink>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {relatedPosts.map(post => (
          <SmartLink
            key={post.id || post.slug}
            href={post.href || `/${post.slug}`}
            className='group overflow-hidden rounded-[8px] border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-zinc-800 dark:bg-[#111113] dark:hover:border-blue-700'>
            {post.pageCoverThumbnail && (
              <div className='relative h-32 overflow-hidden bg-zinc-100 dark:bg-zinc-900'>
                <LazyImage
                  src={post.pageCoverThumbnail}
                  alt={post.title}
                  className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                />
              </div>
            )}
            <div className='p-4'>
              <div className='mb-2 flex items-center gap-2 text-xs text-zinc-400'>
                {post.category && (
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    {post.category}
                  </span>
                )}
                {post.publishDay && <span>{post.publishDay}</span>}
              </div>
              <h3 className='line-clamp-2 text-base font-bold leading-6 text-zinc-900 transition group-hover:text-blue-600 dark:text-zinc-100 dark:group-hover:text-blue-300'>
                {post.title}
              </h3>
              {post.summary && (
                <p className='mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
                  {post.summary}
                </p>
              )}
            </div>
          </SmartLink>
        ))}
      </div>
    </section>
  )
}

export default ArticleRelatedPosts
