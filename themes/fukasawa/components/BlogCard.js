import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'

/**
 * Fukasawa 文章卡片 - 现代商业情报风（3:2 完整展示封面不裁切、无遮挡徽标）
 */
const BlogCard = ({ post, showSummary, featured = false }) => {
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
    <article
      className={`group flex h-full w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#1c5a4a]/40 hover:shadow-lg dark:border-stone-800 dark:bg-[#1c1a17] dark:hover:border-[#3fa383]/50 ${
        featured ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      {showPageCover ? (
        <SmartLink
          href={post?.href}
          className={`relative flex shrink-0 cursor-pointer items-center justify-center overflow-hidden bg-[#F7F5F0] dark:bg-[#151412] ${
            featured
              ? 'w-full md:w-[55%] md:border-r md:border-stone-200/70 md:dark:border-stone-800'
              : 'w-full border-b border-stone-200/60 dark:border-stone-800'
          }`}
        >
          <div className='relative aspect-[3/2] w-full overflow-hidden'>
            <LazyImage
              src={pageCoverThumbnail}
              alt={post?.title || siteConfig('TITLE')}
              width={featured ? 900 : 600}
              height={featured ? 600 : 400}
              priority={featured}
              className='absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.02]'
            />
          </div>
        </SmartLink>
      ) : (
        <SmartLink
          href={post?.href}
          className={`relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden border-b border-stone-200/70 bg-[#f4f1ea] p-5 dark:border-stone-800 dark:bg-[#171512] ${
            featured
              ? 'aspect-[3/2] w-full md:aspect-auto md:w-[55%] md:border-b-0 md:border-r'
              : 'aspect-[3/2] w-full'
          }`}
        >
          <div className='flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
              {featured ? 'FEATURED BRIEF' : 'FIELD REPORT'}
            </span>
          </div>
          <div className='mt-auto border-l-2 border-[#1c5a4a]/60 pl-3 dark:border-[#6bc4a6]/60'>
            <p className='line-clamp-2 text-sm font-bold leading-snug text-stone-800 dark:text-stone-200'>
              {post.title}
            </p>
          </div>
        </SmartLink>
      )}

      <div
        className={`flex flex-1 flex-col ${featured ? 'justify-center p-6 lg:p-7' : 'p-5'}`}>
        {(featured || post.category) && (
          <div className='mb-2.5 flex flex-wrap items-center gap-2'>
            {featured && (
              <span className='rounded-full bg-[#1c5a4a] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs dark:bg-[#1c5a4a]'>
                精选导读
              </span>
            )}
            {post.category && (
              <SmartLink
                href={`/category/${encodeURIComponent(post.category)}`}
                className='inline-flex items-center rounded-full bg-[#e8f0ec] px-2.5 py-0.5 text-[11px] font-semibold text-[#1c5a4a] no-underline transition hover:bg-[#1c5a4a] hover:text-white dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
              >
                {post.category}
              </SmartLink>
            )}
          </div>
        )}

        <h2 className={featured ? 'mb-3' : 'mb-2'}>
          <SmartLink
            passHref
            href={post?.href}
            className={`cursor-pointer break-words font-bold tracking-tight text-stone-900 no-underline transition-colors duration-200 group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6] ${
              featured
                ? 'line-clamp-2 text-xl leading-snug lg:text-[22px]'
                : 'line-clamp-2 text-[17px] leading-snug'
            }`}
          >
            {post.title}
          </SmartLink>
        </h2>

        {(!showPreview || showSummary) && post.summary && (
          <p
            className={`mb-4 text-[13.5px] leading-6 text-stone-500 dark:text-stone-300 ${
              featured ? 'line-clamp-3 lg:text-sm' : 'line-clamp-2'
            }`}
          >
            {post.summary}
          </p>
        )}

        <div
          className={`flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800 ${
            featured ? 'mt-1' : 'mt-auto'
          }`}>
          <span className='font-mono text-xs tabular-nums text-stone-500 dark:text-stone-400'>
            {post.publishDay || '实战笔记'}
          </span>

          <div className='flex flex-wrap justify-end gap-1'>
            {post.tagItems?.slice(0, featured ? 3 : 2).map(tag => (
              <TagItemMini key={tag.name} tag={tag} />
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
