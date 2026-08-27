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
      style={{ maxHeight: '65rem' }}
      className='group flex w-full flex-col gap-5 border-t border-stone-300 py-6 transition-colors duration-300 dark:border-stone-800 md:flex-row md:gap-6'
    >
      <div className='flex w-full flex-col md:flex-row md:items-start'>
        {/* 封面图部分：锁定比例 16:10 */}
        {showPageCover && (
          <SmartLink href={post?.href} passHref legacyBehavior>
            <div className='relative w-full shrink-0 cursor-pointer overflow-hidden md:w-[38%] md:pt-[24%]'>
              <LazyImage
                src={pageCoverThumbnail}
                alt={post?.title || siteConfig('TITLE')}
                width={640}
                height={400}
                className='absolute left-0 top-0 h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-[1.03]'
              />
              {/* 图片遮罩：暗色模式下降低亮度 */}
              <div className='absolute inset-0 bg-black opacity-0 dark:group-hover:opacity-10 transition-opacity duration-300'></div>
            </div>
          </SmartLink>
        )}

        {/* 文字内容部分 */}
        <div className='flex w-full flex-grow flex-col px-0 py-1 md:px-1'>
          {/* 标题 */}
          <h2 className='mb-2'>
            <SmartLink
              passHref
              href={post?.href}
              className={`line-clamp-2 break-words cursor-pointer text-xl font-semibold leading-snug tracking-tight text-stone-900 transition-colors duration-200 hover:text-stone-500 dark:text-stone-100 dark:hover:text-stone-300`}
            >
              {siteConfig('POST_TITLE_ICON') && (
                <NotionIcon icon={post.pageIcon} />
              )}{' '}
              {post.title}
            </SmartLink>
          </h2>

          {/* 摘要：强制 2 行，保持卡片整齐 */}
          {(!showPreview || showSummary) && (
            <main className='mb-5 line-clamp-3 text-sm font-normal leading-7 text-stone-500 dark:text-stone-400'>
              {post.summary}
            </main>
          )}

          {/* 底部：分类 & 标签 */}
          <div className='mt-auto flex items-center justify-between border-t border-stone-200 pt-3 dark:border-stone-800'>
            {post.category && (
              <SmartLink
                href={`/category/${post.category}`}
                passHref
                className='flex items-center text-xs text-stone-400 transition-colors hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300'
              >
                <i className='mr-1.5 far fa-folder-open' />
                {post.category}
              </SmartLink>
            )}
            
            <div className='flex flex-wrap gap-1 justify-end'>
              {post.tagItems?.slice(0, 2).map(tag => (
                <TagItemMini key={tag.name} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default BlogCard
