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
    <section className='mb-8 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'>
      <div className='grid gap-0 lg:grid-cols-[minmax(0,1fr)_280px]'>
        <div className='p-6 sm:p-8'>
          <div className='mb-3 inline-flex items-center gap-2 rounded-full bg-[#e8f0ec] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
            <i className={`fas ${topic.icon} text-[10px]`} />
            <span>{topic.eyebrow}</span>
          </div>
          <h1 className='text-2xl font-extrabold leading-tight tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl'>
            {topic.title}
          </h1>
          <p className='mt-3 max-w-3xl text-sm leading-7 text-stone-600 dark:text-stone-300'>
            {topic.description}
          </p>

          <div className='mt-5 flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400'>
            <span className='inline-flex items-center rounded-full border border-[#c3d6cd] bg-[#f4f8f6] px-3 py-1 font-medium text-[#1c5a4a] dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/20 dark:text-[#6bc4a6]'>
              <strong className='mr-1 font-mono tabular-nums'>
                {postCount || posts?.length || 0}
              </strong>
              篇文章
            </span>
            <SmartLink
              href='/'
              className='rounded-full border border-stone-200 bg-white px-3 py-1 font-medium text-stone-600 no-underline transition hover:border-[#1c5a4a] hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#6bc4a6] dark:hover:text-[#6bc4a6]'
            >
              返回首页
            </SmartLink>
            <SmartLink
              href='/archive'
              className='rounded-full border border-stone-200 bg-white px-3 py-1 font-medium text-stone-600 no-underline transition hover:border-[#1c5a4a] hover:text-[#1c5a4a] dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300 dark:hover:border-[#6bc4a6] dark:hover:text-[#6bc4a6]'
            >
              时间归档
            </SmartLink>
          </div>
        </div>

        <div className='border-t border-stone-200/80 bg-[#faf9f6] p-6 dark:border-stone-800 dark:bg-[#151412] lg:border-l lg:border-t-0'>
          <div className='mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400'>
            相关标签
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {relatedTags.length > 0 ? (
              relatedTags.map(item => (
                <TagItemMini key={item.name} tag={item} />
              ))
            ) : (
              <span className='text-xs text-stone-400'>暂无相关标签</span>
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
