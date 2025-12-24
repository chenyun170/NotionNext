// themes/fukasawa/components/ArticleCard.jsx
// 现代化文章卡片组件

import Link from 'next/link'
import { siteConfig } from '@/lib/config'
import { componentStyles, cn } from '../lib/theme'

/**
 * 文章卡片 - 大卡片样式
 * @param {Object} props
 * @param {Object} props.post - 文章数据
 * @param {Number} props.index - 索引（用于排名显示）
 * @param {String} props.variant - 样式变体 ['default', 'compact', 'featured']
 */
export default function ArticleCard({ post, index, variant = 'default' }) {
  const url = `${siteConfig('SUB_PATH', '')}/${post.slug}`
  
  // 判断是否为热门文章（前3名）
  const isHot = index !== undefined && index < 3
  
  // 获取分类颜色
  const getCategoryColor = (category) => {
    const colors = {
      '新人教程': 'orange',
      '工具推荐': 'blue',
      'WhatsApp技巧': 'green',
      '客户开发': 'purple'
    }
    return colors[category] || 'gray'
  }
  
  const categoryColor = getCategoryColor(post.category?.[0])

  // 精选样式
  if (variant === 'featured') {
    return (
      <Link href={url} passHref legacyBehavior>
        <article className="group relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl overflow-hidden border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer">
          {/* 渐变背景装饰 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative p-8">
            {/* 标签 */}
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                <span>⭐</span>
                精选推荐
              </span>
              {post.category?.[0] && (
                <span className={componentStyles.badge[categoryColor]}>
                  {post.category[0]}
                </span>
              )}
            </div>

            {/* 标题 */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {post.title}
            </h2>

            {/* 摘要 */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3 leading-relaxed">
              {post.summary || post.excerpt}
            </p>

            {/* 标签云 */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm text-gray-600 dark:text-gray-400 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* 底部信息 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <i className="far fa-clock"></i>
                  {post.date?.start_date || '未知日期'}
                </span>
                {post.readTime && (
                  <span className="flex items-center gap-1">
                    <i className="far fa-eye"></i>
                    阅读 {post.readTime}
                  </span>
                )}
              </div>
              <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:gap-3 transition-all">
                阅读全文
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </article>
      </Link>
    )
  }

  // 紧凑样式
  if (variant === 'compact') {
    return (
      <Link href={url} passHref legacyBehavior>
        <article className="group flex items-center gap-4 bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all cursor-pointer">
          {/* 序号 */}
          {index !== undefined && (
            <div className={cn(
              'flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm',
              isHot
                ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
            )}>
              {index + 1}
            </div>
          )}

          {/* 内容 */}
          <div className="flex-grow min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate mb-1">
              {post.title}
            </h3>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {post.category?.[0] && (
                <span>{post.category[0]}</span>
              )}
              <span>·</span>
              <span>{post.date?.start_date}</span>
            </div>
          </div>

          {/* 箭头 */}
          <i className="fas fa-chevron-right text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0"></i>
        </article>
      </Link>
    )
  }

  // 默认样式
  return (
    <Link href={url} passHref legacyBehavior>
      <article className={cn(
        componentStyles.card.full,
        'group relative overflow-hidden cursor-pointer'
      )}>
        {/* 排名角标 */}
        {index !== undefined && isHot && (
          <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg z-10 animate-bounce">
            {index + 1}
          </div>
        )}

        {/* Hot 标签 */}
        {isHot && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 z-10">
            <span>🔥</span>
            HOT
          </div>
        )}

        {/* 顶部装饰条 */}
        <div className={cn(
          'h-1 bg-gradient-to-r',
          categoryColor === 'orange' && 'from-orange-400 to-orange-600',
          categoryColor === 'blue' && 'from-blue-400 to-blue-600',
          categoryColor === 'green' && 'from-green-400 to-green-600',
          categoryColor === 'purple' && 'from-purple-400 to-purple-600',
          categoryColor === 'gray' && 'from-gray-400 to-gray-600'
        )}></div>

        <div className="p-6">
          {/* 分类标签 */}
          <div className="flex items-center gap-2 mb-3">
            {post.category?.[0] && (
              <span className={componentStyles.badge[categoryColor]}>
                {post.category[0]}
              </span>
            )}
            {post.type === 'Post' && (
              <span className={componentStyles.badge.gray}>
                原创
              </span>
            )}
          </div>

          {/* 标题 */}
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {post.title}
          </h2>

          {/* 摘要 */}
          {post.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
              {post.summary}
            </p>
          )}

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 底部元信息 */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <i className="far fa-clock"></i>
                {post.date?.start_date || '未知'}
              </span>
              {post.readTime && (
                <span className="flex items-center gap-1">
                  <i className="far fa-eye"></i>
                  {post.readTime}
                </span>
              )}
            </div>
            <button className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:gap-2 transition-all font-medium text-sm">
              阅读
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>

        {/* 悬浮渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
      </article>
    </Link>
  )
}

/**
 * 文章列表容器
 */
export function ArticleGrid({ posts, variant = 'default' }) {
  const gridClass = variant === 'compact' 
    ? 'space-y-3'
    : 'grid grid-cols-1 lg:grid-cols-3 gap-6'

  return (
    <div className={gridClass}>
      {posts.map((post, index) => (
        <ArticleCard 
          key={post.id} 
          post={post} 
          index={index}
          variant={variant}
        />
      ))}
    </div>
  )
}