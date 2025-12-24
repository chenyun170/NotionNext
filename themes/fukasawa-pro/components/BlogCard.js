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
  
  // 强制显示封面图逻辑
  if (siteConfig('FUKASAWA_POST_LIST_COVER_FORCE', null, CONFIG) && post && !post.pageCover) {
    post.pageCoverThumbnail = siteInfo?.pageCover
  }
  const showPageCover = siteConfig('FUKASAWA_POST_LIST_COVER', null, CONFIG) && post?.pageCoverThumbnail
    
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
      className='group w-full lg:max-w-sm p-0 mb-6 mx-2 bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800'
    >
      <div className='flex flex-col h-full'>
        {/* 封面图部分：锁定比例 16:10 */}
        {showPageCover && (
          <SmartLink href={post?.href} passHref legacyBehavior>
            <div className='relative w-full pt-[62.5%] cursor-pointer overflow-hidden'>
              <LazyImage
                src={post?.pageCoverThumbnail}
                alt={post?.title || siteConfig('TITLE')}
                className='absolute top-0 left-0 object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-in-out'
              />
              {/* 图片遮罩：暗色模式下降低亮度 */}
              <div className='absolute inset-0 bg-black opacity-0 dark:group-hover:opacity-10 transition-opacity duration-300'></div>
            </div>
          </SmartLink>
        )}

        {/* 文字内容部分 */}
        <div className='flex flex-col p-5 w-full flex-grow'>
          {/* 标题 */}
          <h2 className='mb-2'>
            <SmartLink
              passHref
              href={post?.href}
              className={`line-clamp-2 break-words cursor-pointer font-bold text-lg leading-snug text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200`}
            >
              {siteConfig('POST_TITLE_ICON') && (
                <NotionIcon icon={post.pageIcon} />
              )}{' '}
              {post.title}
            </SmartLink>
          </h2>

          {/* 摘要：强制 2 行，保持卡片整齐 */}
          {(!showPreview || showSummary) && (
            <main className='mb-4 line-clamp-2 text-gray-500 dark:text-gray-400 text-sm font-normal leading-relaxed overflow-hidden'>
              {post.summary}
            </main>
          )}

          {/* 底部：分类 & 标签 */}
          <div className='mt-auto pt-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between'>
            {post.category && (
              <SmartLink
                href={`/category/${post.category}`}
                passHref
                className='flex items-center text-xs text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors'
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
