import LazyImage from '@/components/LazyImage'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'

/**
 * Fukasawa 文章卡片 - 现代商业情报风（支持首篇精选横卡与无封面排版占位）
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
          className={`relative block shrink-0 cursor-pointer overflow-hidden bg-stone-100 dark:bg-stone-800 ${
            featured
              ? 'aspect-[16/10] w-full md:aspect-auto md:min-h-[260px] md:w-[52%]'
              : 'aspect-[16/10] w-full'
          }`}
        >
          <LazyImage
            src={pageCoverThumbnail}
            alt={post?.title || siteConfig('TITLE')}
            width={featured ? 800 : 640}
            height={featured ? 500 : 400}
            priority={featured}
            className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]'
          />
          <div className='pointer-events-none absolute left-3 top-3 flex items-center gap-1.5'>
            {featured && (
              <span className='rounded-full bg-[#1c5a4a] px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs'>
                精选导读
              </span>
            )}
            {post.category && (
              <span className='rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-stone-800 backdrop-blur-sm dark:bg-stone-900/85 dark:text-stone-200'>
                {post.category}
              </span>
            )}
          </div>
        </SmartLink>
      ) : (
        <SmartLink
          href={post?.href}
          className={`relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden border-b border-stone-200/70 bg-[#f4f1ea] p-5 dark:border-stone-800 dark:bg-[#171512] ${
            featured
              ? 'aspect-[16/10] w-full md:aspect-auto md:min-h-[260px] md:w-[52%] md:border-b-0 md:border-r'
              : 'aspect-[16/10] w-full'
          }`}
        >
          <div className='flex items-center justify-between gap-2'>
            <span className='inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#1c5a4a] dark:text-[#6bc4a6]'>
              <span className='h-1.5 w-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />
              {featured ? 'FEATURED BRIEF' : 'FIELD REPORT'}
            </span>
            {post.category && (
              <span className='rounded-full border border-stone-200 bg-white/85 px-2.5 py-0.5 text-[11px] font-semibold text-stone-700 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'>
                {post.category}
              </span>
            )}
          </div>
          <div className='mt-auto border-l-2 border-[#1c5a4a]/60 pl-3 dark:border-[#6bc4a6]/60'>
            <p className='line-clamp-2 text-sm font-bold leading-snug text-stone-800 dark:text-stone-200'>
              {post.title}
            </p>
          </div>
        </SmartLink>
      )}

      <div className={`flex flex-1 flex-col ${featured ? 'p-6 lg:p-7' : 'p-5'}`}>
        {featured && (
          <div className='mb-2 hidden items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#1c5a4a] dark:text-[#6bc4a6] md:flex'>
            <span>最新实战专题</span>
            <span className='h-px flex-1 bg-stone-200/80 dark:bg-stone-800' />
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
            className={`mb-4 text-[13.5px] leading-6 text-stone-500 dark:text-stone-400 ${
              featured ? 'line-clamp-3 lg:text-sm' : 'line-clamp-2'
            }`}
          >
            {post.summary}
          </p>
        )}

        <div className='mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-stone-800'>
          <span className='font-mono text-[11px] tabular-nums text-stone-400 dark:text-stone-500'>
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
