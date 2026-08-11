import SmartLink from '@/components/SmartLink'

const ArticleBreadcrumbTrail = ({ post }) => {
  if (!post) return null

  return (
    <nav
      aria-label='Breadcrumb'
      className='mb-5 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-400 dark:text-stone-500'>
      <SmartLink
        href='/'
        className='transition hover:text-amber-600 dark:hover:text-amber-300'>
        首页
      </SmartLink>
      {post?.category && (
        <>
          <span aria-hidden='true'>/</span>
          <SmartLink
            href={`/category/${encodeURIComponent(post.category)}`}
            className='transition hover:text-amber-600 dark:hover:text-amber-300'>
            {post.category}
          </SmartLink>
        </>
      )}
      <span aria-hidden='true'>/</span>
      <span className='max-w-full truncate text-stone-500 dark:text-stone-400'>
        {post.title}
      </span>
    </nav>
  )
}

export default ArticleBreadcrumbTrail
