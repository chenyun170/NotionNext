import SmartLink from '@/components/SmartLink'
import { useMemo } from 'react'
import TagItemMini from './TagItemMini'

const TopicIntro = ({
  category,
  tag,
  keyword,
  postCount = 0,
  posts = [],
  tagOptions = []
}) => {
  const topic = useMemo(
    () => getTopicMeta({ category, tag, keyword, postCount }),
    [category, tag, keyword, postCount]
  )
  const relatedTags = useMemo(
    () => collectRelatedTags(posts, tagOptions, tag).slice(0, 8),
    [posts, tagOptions, tag]
  )

  if (!topic) {
    return null
  }

  return (
    <section className='mb-8 overflow-hidden rounded-[8px] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#111113]'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]'>
        <div className='p-5 sm:p-7'>
          <div className='mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400'>
            <i className={`fas ${topic.icon}`} />
            <span>{topic.eyebrow}</span>
          </div>
          <h1 className='text-2xl font-black leading-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl'>
            {topic.title}
          </h1>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-zinc-600 dark:text-zinc-300'>
            {topic.description}
          </p>

          <div className='mt-5 flex flex-wrap gap-2 text-xs text-zinc-500 dark:text-zinc-400'>
            <span className='rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 dark:border-zinc-800 dark:bg-zinc-950'>
              <strong className='mr-1 text-zinc-900 dark:text-zinc-100'>
                {postCount || posts?.length || 0}
              </strong>
              篇文章
            </span>
            <SmartLink
              href='/'
              className='rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-700 dark:hover:text-blue-300'
            >
              全部文章
            </SmartLink>
            <SmartLink
              href='/archive'
              className='rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 transition hover:border-blue-300 hover:text-blue-600 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-blue-700 dark:hover:text-blue-300'
            >
              时间归档
            </SmartLink>
          </div>
        </div>

        <div className='border-t border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950/50 lg:border-l lg:border-t-0'>
          <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>
            相关标签
          </div>
          <div className='flex flex-wrap gap-2'>
            {relatedTags.length > 0 ? (
              relatedTags.map(item => (
                <TagItemMini key={item.name} tag={item} />
              ))
            ) : (
              <span className='text-sm text-zinc-400'>暂无相关标签</span>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

const getTopicMeta = ({ category, tag, keyword, postCount }) => {
  if (category) {
    return {
      eyebrow: 'Topic Collection',
      icon: 'fa-folder-open',
      title: `${category}专题`,
      description: `${buildDescription(category)}这里收录了 ${postCount || 0} 篇相关文章，适合按主题连续阅读。`
    }
  }
  if (tag) {
    return {
      eyebrow: 'Tag Collection',
      icon: 'fa-tag',
      title: `#${tag}`,
      description: `围绕“${tag}”整理的文章集合，方便快速找到同一问题下的工具、案例和方法。`
    }
  }
  if (keyword) {
    return {
      eyebrow: 'Search Results',
      icon: 'fa-magnifying-glass',
      title: `搜索：${keyword}`,
      description: '以下是站内匹配结果，可以继续切换关键词查找更具体的外贸工具、获客方法或数据分析文章。'
    }
  }
  return null
}

const buildDescription = name => {
  if (/海关|数据|贸易/.test(name)) {
    return '从海关数据、采购记录和贸易趋势出发，帮助判断客户真实性、采购周期和目标市场。'
  }
  if (/物流|跨境|运输/.test(name)) {
    return '聚焦跨境物流、履约成本、运输风险和外贸交付链路，帮助你做更稳的交付决策。'
  }
  if (/AI|工具|自动/.test(name)) {
    return '关注 AI 工具、自动化流程和效率系统，把调研、触达、跟进变成更可复用的工作流。'
  }
  if (/客户|获客|开发/.test(name)) {
    return '围绕客户开发、主动获客和线索跟进，整理更适合外贸场景的实战打法。'
  }
  return '围绕这个专题整理实战文章、工具经验和方法论，帮助你更快找到可执行方案。'
}

const collectRelatedTags = (posts, tagOptions, currentTag) => {
  const counter = new Map()
  posts?.forEach(post => {
    const tags = post?.tagItems || normalizeTags(post?.tags)
    tags?.forEach(item => {
      if (!item?.name || item.name === currentTag) return
      counter.set(item.name, {
        ...item,
        count: (counter.get(item.name)?.count || 0) + 1
      })
    })
  })

  if (counter.size === 0) {
    tagOptions?.forEach(item => {
      if (item?.name && item.name !== currentTag) {
        counter.set(item.name, item)
      }
    })
  }

  return Array.from(counter.values()).sort(
    (a, b) => (b.count || 0) - (a.count || 0)
  )
}

const normalizeTags = tags => {
  const list = Array.isArray(tags) ? tags : [tags]
  return list.filter(Boolean).map(name => ({ name }))
}

export default TopicIntro
