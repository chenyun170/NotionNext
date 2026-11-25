import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'

/**
 * Fukasawa 文章卡片 - 现代商业情报风
 */
const BlogCard = ({ post, showSummary }) => {
  const { siteInfo } = useGlobal()
  const showPreview =
    siteConfig('FUKASAWA_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap
  const pageCoverThumbnail =
    siteConfig('FUKASAWA_POST_LIST_COVER_FORCE', null, CONFIG) &&
    post &&
    !post.pageCover
      ? siteInfo?.pageCover
      : post?.pageCoverThumbnail
  const showPageCover =
    siteConfig('FUKASAWA_POST_LIST_COVER', null, CONFIG) && pageCoverThumbnail

  return (
    <article className='group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1c5a4a]/40 hover:shadow-lg dark:border-stone-800 dark:bg-[#1c1a17] dark:hover:border-[#3fa383]/50'>
      {showPageCover && (
        <SmartLink
          href={post?.href}
          className='relative block aspect-[16/10] w-full shrink-0 cursor-pointer overflow-hidden bg-stone-100 dark:bg-stone-800'
        >
          <LazyImage
            src={pageCoverThumbnail}
            alt={post?.title || siteConfig('TITLE')}
            width={640}
            height={400}
            className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]'
          />
          {post.category && (
            <span className='absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-stone-800 backdrop-blur-sm dark:bg-stone-900/85 dark:text-stone-200'>
              {post.category}
            </span>
          )}
        </SmartLink>
      )}

      <div className='flex flex-1 flex-col p-5'>
        {!showPageCover && post.category && (
          <div className='mb-2'>
            <SmartLink
              href={`/category/${encodeURIComponent(post.category)}`}
              className='inline-flex items-center rounded-full bg-[#e8f0ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#1c5a4a] no-underline dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
            >
              {post.category}
            </SmartLink>
          </div>
        )}

        <h2 className='mb-2'>
          <SmartLink
            passHref
            href={post?.href}
            className='line-clamp-2 cursor-pointer break-words text-[17px] font-bold leading-snug tracking-tight text-stone-900 no-underline transition-colors duration-200 group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6]'
          >
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} />
            )}{' '}
            {post.title}
          </SmartLink>
        </h2>

        {(!showPreview || showSummary) && post.summary && (
          <p className='mb-4 line-clamp-2 text-[13.5px] leading-6 text-stone-500 dark:text-stone-400'>
            {post.summary}
          </p>
        )}

        <div className='mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800'>
          <span className='font-mono text-[11px] tabular-nums text-stone-400 dark:text-stone-500'>
            {post.publishDay || '实战笔记'}
          </span>

          <div className='flex flex-wrap justify-end gap-1'>
            {post.tagItems?.slice(0, 2).map(tag => (
              <TagItemMini key={tag.name} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
