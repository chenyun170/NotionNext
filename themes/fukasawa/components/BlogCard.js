import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import SmartLink from '@/components/SmartLink'
import CONFIG from '../config'
import TagItemMini from './TagItemMini'

/**
 * 文章列表卡片 V7.0 美化重构版
 */
const BlogCard = ({ showAnimate, post, showSummary }) => {
  const { siteInfo } = useGlobal()
  const showPreview = siteConfig('FUKASAWA_POST_LIST_PREVIEW', null, CONFIG) && post.blockMap
  const pageCoverThumbnail =
    siteConfig('FUKASAWA_POST_LIST_COVER_FORCE', null, CONFIG) &&
    post &&
    !post.pageCover
      ? siteInfo?.pageCover
      : post?.pageCoverThumbnail
  const showPageCover =
    siteConfig('FUKASAWA_POST_LIST_COVER', null, CONFIG) && pageCoverThumbnail
    
  const FUKASAWA_POST_LIST_ANIMATION = siteConfig('FUKASAWA_POST_LIST_ANIMATION', null, CONFIG) || showAnimate 

  const aosProps = FUKASAWA_POST_LIST_ANIMATION
    ? {
        'data-aos': 'fade-up',
        'data-aos-duration': '400',
        'data-aos-once': 'true',
        'data-aos-anchor-placement': 'top-bottom'
      }
    : {}

  return (
    <article
      {...aosProps}
      className='group flex h-full w-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_1px_2px_rgba(23,23,23,0.06)] transition-all duration-300 hover:border-stone-300 hover:shadow-[0_10px_30px_rgba(23,23,23,0.08)] dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700'
    >
      {/* 封面整幅置顶：两列卡片高度一致，滚动时不再出现锯齿 */}
      {showPageCover && (
        <SmartLink href={post?.href} passHref legacyBehavior>
          <div className='relative aspect-[16/9] w-full shrink-0 cursor-pointer overflow-hidden bg-stone-100 dark:bg-stone-800'>
            <LazyImage
              src={pageCoverThumbnail}
              alt={post?.title || siteConfig('TITLE')}
              width={640}
              height={360}
              className='absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03]'
            />
            <div className='absolute inset-0 bg-black opacity-0 transition-opacity duration-300 group-hover:opacity-10' />
          </div>
        </SmartLink>
      )}

      <div className='flex flex-1 flex-col px-5 pb-5 pt-4'>
        <h2 className='mb-2'>
          <SmartLink
            passHref
            href={post?.href}
            className='line-clamp-2 cursor-pointer break-words text-[19px] font-semibold leading-snug tracking-tight text-stone-900 transition-colors duration-200 hover:text-stone-500 dark:text-stone-100 dark:hover:text-stone-300'
          >
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post.pageIcon} />
            )}{' '}
            {post.title}
          </SmartLink>
        </h2>

        {(!showPreview || showSummary) && (
          <main className='mb-4 line-clamp-2 text-sm font-normal leading-7 text-stone-500 dark:text-stone-400'>
            {post.summary}
          </main>
        )}

        <div className='mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-stone-200 pt-3 dark:border-stone-800'>
          {post.category && (
            <SmartLink
              href={`/category/${post.category}`}
              passHref
              className='flex min-h-[26px] items-center text-[12px] font-medium text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
            >
              <i className='mr-1.5 far fa-folder-open' />
              {post.category}
            </SmartLink>
          )}

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
