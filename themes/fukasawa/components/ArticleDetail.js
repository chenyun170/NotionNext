import Comment from '@/components/Comment'
import { AdSlot } from '@/components/GoogleAdsense'
import LazyImage from '@/components/LazyImage'
import NotionIcon from '@/components/NotionIcon'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import WWAds from '@/components/WWAds'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { formatDateFmt } from '@/lib/utils/formatDate'
import SmartLink from '@/components/SmartLink'
import ArticleAround from './ArticleAround'
import TagItemMini from './TagItemMini'
import { isBrowser } from '@/lib/utils' // 确保引入 isBrowser 用于复制功能

/**
 * Fukasawa 文章详情页 - 顶尖情报局名片网格版
 * @param {*} props
 * @returns
 */
export default function ArticleDetail(props) {
  const { post, prev, next } = props
  const { locale, fullWidth } = useGlobal()

  if (!post) {
    return <></>
  }
  return (
    <div
      id='container'
      className={`${fullWidth ? 'px-10' : 'max-w-5xl '} overflow-x-auto flex-grow mx-auto w-screen md:w-full`}>
      {post?.type && !post?.type !== 'Page' && post?.pageCover && (
        <div className='w-full relative md:flex-shrink-0 overflow-hidden'>
          <LazyImage
            alt={post.title}
            src={post?.pageCover}
            className='object-cover max-h-[60vh] w-full'
          />
        </div>
      )}

      <article
        itemScope
        itemType='https://schema.org/Movie'
        className='subpixel-antialiased overflow-y-hidden py-10 px-5 lg:pt-24 md:px-32  dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <header>
          {/* 文章Title */}
          <div className='font-bold text-4xl text-black dark:text-white'>
            {siteConfig('POST_TITLE_ICON') && (
              <NotionIcon icon={post?.pageIcon} />
            )}
            {post.title}
          </div>

          <section className='flex-wrap flex mt-2 text-gray-400 dark:text-gray-400 font-light leading-8'>
            <div>
              {post?.category && (
                <>
                  <SmartLink
                    href={`/category/${post.category}`}
                    passHref
                    className='cursor-pointer text-md mr-2 hover:text-black dark:hover:text-white border-b dark:border-gray-500 border-dashed'>
                    <i className='mr-1 fas fa-folder-open' />
                    {post.category}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                </>
              )}

              {post?.type !== 'Page' && (
                <>
                  <SmartLink
                    href={`/archive#${formatDateFmt(post?.publishDate, 'yyyy-MM')}`}
                    passHref
                    className='pl-1 mr-2 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 border-b dark:border-gray-500 border-dashed'>
                    {post?.publishDay}
                  </SmartLink>
                  <span className='mr-2'>|</span>
                  <span className='mx-2 text-gray-400 dark:text-gray-500'>
                    {locale.COMMON.LAST_EDITED_TIME}: {post.lastEditedDay}
                  </span>
                </>
              )}

              <div className='my-2'>
                {post.tagItems && (
                  <div className='flex flex-nowrap overflow-x-auto'>
                    {post.tagItems.map(tag => (
                      <TagItemMini key={tag.name} tag={tag} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          <WWAds className='w-full' orientation='horizontal' />
        </header>

        {/* Notion文章主体 */}
        <section id='article-wrapper'>
          {post && <NotionPage post={post} />}
        </section>

        {/* --- 名片化网格版权声明 --- */}
        <div className="mt-14 group print:hidden">
          <div className="relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 p-8 transition-all hover:shadow-xl hover:border-orange-500/30">
            
            <div className="absolute -top-6 -right-6 opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-10 transition-opacity pointer-events-none">
              <i className="fas fa-shield-alt text-9xl rotate-12 text-slate-900 dark:text-white"></i>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-8">
                <div className="flex space-x-1">
                  <div className="h-4 w-1 bg-orange-600 rounded-full animate-pulse"></div>
                  <div className="h-4 w-1 bg-orange-600/40 rounded-full"></div>
                </div>
                <h3 className="text-xs font-black tracking-[0.2em] text-slate-800 dark:text-gray-200 uppercase">
                  Intel Report Copyright / 版权声明
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Source / 情报源</span>
                  <span className="text-sm font-bold dark:text-gray-300 flex items-center">
                    外贸获客情报局 <i className="fas fa-check-circle ml-2 text-blue-500 text-[10px]" title="官方认证"></i>
                  </span>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Share / 情报传递</span>
                  <button 
                    onClick={() => {
                      if(isBrowser) {
                        navigator.clipboard.writeText(window.location.href);
                        alert('情报链接已加密存入剪贴板，快去转发吧！');
                      }
                    }}
                    className="text-sm text-left font-mono text-orange-600 hover:text-orange-500 transition-colors flex items-center group/link"
                  >
                    <span className="truncate">点击复制本文永久链接</span>
                    <i className="fas fa-copy ml-2 text-[10px] opacity-0 group-hover/link:opacity-100 transition-opacity"></i>
                  </button>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">License / 许可协议</span>
                  <span className="text-sm dark:text-gray-300">
                    CC BY-NC-SA 4.0 <span className="text-[10px] text-gray-500 ml-1">(署名-非商-相同方式)</span>
                  </span>
                </div>

                <div className="flex flex-col border-l-2 border-gray-200 dark:border-gray-800 pl-4 transition-colors group-hover:border-orange-600/50">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Index / 情报索引</span>
                  <span className="text-sm font-mono dark:text-gray-400 tabular-nums uppercase">
                    #TC-{new Date().getFullYear()}-{post?.id?.slice(0, 6)}
                  </span>
                </div>
              </div>

              <div className="mt-8 pt-5 border-t border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed italic">
                  <i className="fas fa-info-circle mr-2 opacity-60"></i>
                  局长寄语：本站情报旨在助力外贸人精准获客。严禁恶意洗稿或未经授权的商业挪用。
                </p>
              </div>
            </div>
          </div>
        </div>

        <section>
          <AdSlot type='in-article' />
          {/* 分享 */}
          <ShareBar post={post} />
        </section>
      </article>

      {post?.type === 'Post' && <ArticleAround prev={prev} next={next} />}

      {/* 评论互动 */}
      <div className='duration-200 shadow py-6 px-12 w-screen md:w-full overflow-x-auto dark:border-gray-700 bg-white dark:bg-hexo-black-gray'>
        <Comment frontMatter={post} />
      </div>
    </div>
  )
}
