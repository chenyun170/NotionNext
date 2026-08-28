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
          <div className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400'>
            <i className='fas fa-layer-group' />
            <span>Related Reading</span>
          </div>
          <h2 className='text-2xl font-black text-stone-900 dark:text-stone-50'>
            继续延展这个主题
          </h2>
        </div>
        <SmartLink
          href='/archive'
          className='hidden text-sm font-semibold text-stone-500 transition hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 sm:inline-flex'>
          全部文章
          <i className='fas fa-arrow-right ml-2 text-xs' />
        </SmartLink>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        {relatedPosts.map(post => (
          <SmartLink
            key={post.id || post.slug}
            href={post.href || `/${post.slug}`}
            className='group overflow-hidden rounded-[8px] border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:border-stone-400 hover:shadow-lg dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-600'>
            {post.pageCoverThumbnail && (
              <div className='relative h-32 overflow-hidden bg-stone-100 dark:bg-stone-900'>
                <LazyImage
                  src={post.pageCoverThumbnail}
                  alt={post.title}
                  className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                />
              </div>
            )}
            <div className='p-4'>
              <div className='mb-2 flex items-center gap-2 text-xs text-stone-400'>
                {post.category && (
                  <span className='font-semibold text-stone-500 dark:text-stone-400'>
                    {post.category}
                  </span>
                )}
                {post.publishDay && <span>{post.publishDay}</span>}
              </div>
              <h3 className='line-clamp-2 text-base font-bold leading-6 text-stone-900 transition group-hover:text-stone-800 dark:text-stone-100 dark:group-hover:text-stone-200'>
                {post.title}
              </h3>
              {post.summary && (
                <p className='mt-2 line-clamp-2 text-sm leading-6 text-stone-500 dark:text-stone-400'>
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
