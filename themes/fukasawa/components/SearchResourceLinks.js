const resources = [
  {
    title: '海关数据专题',
    description: '从查询入口、进口商筛选到供应商关系分析，系统理解海关数据获客。',
    href: '/customs-data.html',
    icon: 'fa-layer-group'
  },
  {
    title: '外贸工具导航',
    description: '按海关数据、社媒触达、AI 工具和客户开发场景整理常用入口。',
    href: '/tools.html',
    icon: 'fa-toolbox'
  },
  {
    title: '常见问题 FAQ',
    description: '集中回答免费海关数据、OraSkl、工具选择和客户开发流程问题。',
    href: '/faq.html',
    icon: 'fa-circle-question'
  }
]

const toolKeywordResources = [
  {
    title: '外贸工具对比',
    description: '按线索发现、海关数据验证、联系人补全、触达和跟进来选择外贸获客工具。',
    href: '/foreign-trade-tools.html',
    icon: 'fa-scale-balanced'
  },
  {
    title: '客户开发工具推荐',
    description: '按线索、验证、联系人、触达和 CRM 复盘搭建最小工具组合。',
    href: '/foreign-trade-lead-tools.html',
    icon: 'fa-list-check'
  },
  {
    title: '图灵搜工具观察',
    description: '从线索发现、海关数据验证和客户开发流程看图灵搜适合放在哪一步。',
    href: '/turingsearch.html',
    icon: 'fa-magnifying-glass-chart'
  },
  {
    title: '图灵搜和海关数据区别',
    description: '一个偏线索发现，一个偏真实采购验证，适合组合使用。',
    href: '/turingsearch-vs-customs-data.html',
    icon: 'fa-code-compare'
  },
  {
    title: '顶易云工具观察',
    description: '围绕顶易云、海关数据和外贸客户开发，判断工具组合方式。',
    href: '/dingyiyun.html',
    icon: 'fa-cloud'
  },
  {
    title: '顶易云和海关数据配合',
    description: '用工具管理线索，用海关数据验证采购，再进入跟进动作。',
    href: '/dingyiyun-customs-data.html',
    icon: 'fa-diagram-project'
  },
  {
    title: '顶易工具选型',
    description: '把顶易、顶易云、图灵搜和海关数据放到同一条获客链路里比较。',
    href: '/dingyi.html',
    icon: 'fa-screwdriver-wrench'
  }
]

const customsKeywordResources = [
  {
    title: '海关数据怎么查进口商',
    description: '从产品关键词、HS 编码和供应商名称出发，筛选真实进口商。',
    href: '/customs-data-importers.html',
    icon: 'fa-building-user'
  },
  {
    title: '海关数据专题',
    description: '从查询入口、进口商筛选到供应商关系分析，系统理解海关数据获客。',
    href: '/customs-data.html',
    icon: 'fa-layer-group'
  },
  {
    title: '美国进口商查询',
    description: '用美国进口数据筛选持续采购、近期活跃、产品匹配的真实买家。',
    href: '/us-importers.html',
    icon: 'fa-ship'
  },
  {
    title: 'HS 编码查进口商',
    description: '用 HS 编码扩大候选池，再按产品描述和采购行为筛进口商。',
    href: '/hs-code-lookup.html',
    icon: 'fa-barcode'
  },
  {
    title: '海关数据获客流程',
    description: '把进口记录转成客户线索、开发信角度和跟进动作。',
    href: '/customs-data-leads.html',
    icon: 'fa-route'
  }
]

const SearchResourceLinks = ({ keyword }) => {
  if (!keyword) {
    return null
  }

  const keywordText = String(keyword)
  const activeResources = /图灵搜|顶易云|顶易|外贸工具|获客工具|外贸获客工具|客户开发工具/i.test(keywordText)
    ? toolKeywordResources
    : /海关数据|进口商|买家|采购商|HS|hs/i.test(keywordText)
      ? customsKeywordResources
      : resources

  return (
    <section
      className='mb-6 overflow-hidden rounded-[8px] border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#111113]'
      aria-label='搜索相关资源'>
      <div className='border-b border-zinc-200 px-5 py-4 dark:border-zinc-800'>
        <div className='mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400'>
          <i className='fas fa-compass' />
          <span>相关资源</span>
        </div>
        <p className='text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
          搜索「{keyword}」时，也可以从专题、工具和 FAQ 入口继续查找可执行路径。
        </p>
      </div>
      <div className='grid gap-0 md:grid-cols-3'>
        {activeResources.map(resource => (
          <a
            key={resource.href}
            href={resource.href}
            className='group border-b border-zinc-200 p-5 transition hover:bg-blue-50 dark:border-zinc-800 dark:hover:bg-blue-950/20 md:border-b-0 md:border-r last:md:border-r-0'>
            <span className='mb-4 flex h-9 w-9 items-center justify-center rounded-[8px] bg-zinc-100 text-zinc-600 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-zinc-900 dark:text-zinc-300'>
              <i className={`fas ${resource.icon}`} />
            </span>
            <h2 className='text-base font-black text-zinc-900 group-hover:text-blue-700 dark:text-zinc-50 dark:group-hover:text-blue-300'>
              {resource.title}
            </h2>
            <p className='mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400'>
              {resource.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  )
}

export default SearchResourceLinks
