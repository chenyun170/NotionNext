import SmartLink from '@/components/SmartLink'
import { uuidToId } from 'notion-utils'
import TagItemMini from './TagItemMini'

const ArticleQuickNav = ({ post }) => {
  if (!post) {
    return null
  }

  const toc = post?.toc || []
  const tags = post?.tagItems || []
  const hasToc = toc.length > 1

  return (
    <aside className='mb-8 overflow-hidden rounded-[8px] border border-zinc-200 bg-zinc-50 text-sm dark:border-zinc-800 dark:bg-zinc-950/60 print:hidden'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]'>
        <div className='p-5'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400'>
            <i className='fas fa-route' />
            <span>Reading Path</span>
          </div>

          {hasToc ? (
            <nav className='grid gap-2 sm:grid-cols-2'>
              {toc.slice(0, 6).map(item => {
                const id = uuidToId(item.id)
                return (
                  <a
                    key={id}
                    href={`#${id}`}
                    className='group flex min-h-[44px] items-center rounded-[8px] border border-zinc-200 bg-white px-3 py-2 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-[#111113] dark:hover:border-blue-700 dark:hover:text-blue-300'
                  >
                    <span className='mr-2 h-1.5 w-1.5 flex-none rounded-full bg-zinc-300 transition group-hover:bg-blue-500 dark:bg-zinc-700' />
                    <span className='line-clamp-2 leading-5'>{item.text}</span>
                  </a>
                )
              })}
            </nav>
          ) : (
            <p className='leading-7 text-zinc-500 dark:text-zinc-400'>
              这篇文章暂无目录，可以从分类和标签继续延展阅读。
            </p>
          )}
        </div>

        <div className='border-t border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-[#111113] lg:border-l lg:border-t-0'>
          <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>
            Explore More
          </div>

          {post?.category && (
            <SmartLink
              href={`/category/${encodeURIComponent(post.category)}`}
              className='mb-3 flex items-center justify-between rounded-[8px] border border-zinc-200 px-3 py-2 font-semibold text-zinc-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:text-blue-300'
            >
              <span className='min-w-0 truncate'>
                <i className='fas fa-folder-open mr-2 text-zinc-400' />
                {post.category}
              </span>
              <i className='fas fa-arrow-right text-xs text-zinc-400' />
            </SmartLink>
          )}
          {!post?.category && (
            <SmartLink
              href='/archive'
              className='mb-3 flex items-center justify-between rounded-[8px] border border-zinc-200 px-3 py-2 font-semibold text-zinc-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:text-zinc-200 dark:hover:border-blue-700 dark:hover:text-blue-300'
            >
              <span>
                <i className='fas fa-clock-rotate-left mr-2 text-zinc-400' />
                时间归档
              </span>
              <i className='fas fa-arrow-right text-xs text-zinc-400' />
            </SmartLink>
          )}

          {tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {tags.slice(0, 6).map(tag => (
                <TagItemMini key={tag.name} tag={tag} />
              ))}
            </div>
          )}
          {tags.length === 0 && (
            <SmartLink
              href='/'
              className='inline-flex items-center text-xs font-semibold text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-300'
            >
              查看全部文章
              <i className='fas fa-arrow-right ml-2 text-[10px]' />
            </SmartLink>
          )}
        </div>
      </div>
    </aside>
  )
}

export default ArticleQuickNav
