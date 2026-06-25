const SITE_URL = 'https://www.123170.xyz'
const UPDATED_AT = '2026-06-25'

const CORE_SEO_PAGES = [
  {
    slug: '',
    title: '外贸获客情报局',
    description: '海关数据、进口商查询、供应商关系分析、图灵搜、顶易云和 AI 外贸获客工作流的实战情报站。',
    section: '首页',
    priority: '1.0',
    changefreq: 'daily',
    keywords: ['外贸获客情报局', '外贸获客', '海关数据']
  },
  {
    slug: 'customs-data.html',
    title: '海关数据专题',
    description: '系统整理免费海关数据查询、美国进口数据、进口商筛选、供应商关系分析和外贸获客实战路径。',
    section: '海关数据',
    priority: '0.92',
    changefreq: 'weekly',
    keywords: ['海关数据', '海关数据查询', '免费海关数据']
  },
  {
    slug: 'customs-data-skill.html',
    title: 'OraSkl 海关数据 Skill',
    description: '查询谁在进口你的产品，并由 AI 解读趋势、标出高价值客户和生成分析报告。',
    section: '海关数据',
    priority: '0.9',
    changefreq: 'weekly',
    keywords: ['OraSkl', '海关数据 Skill', '免费海关数据查询']
  },
  {
    slug: 'customs-data-importers.html',
    title: '海关数据怎么查进口商',
    description: '从产品关键词、HS 编码和供应商名称出发，筛选真实进口商并判断开发优先级。',
    section: '海关数据',
    priority: '0.87',
    changefreq: 'weekly',
    keywords: ['海关数据怎么查进口商', '进口商查询', '国外采购商']
  },
  {
    slug: 'customs-data-find-buyers.html',
    title: '海关数据怎么找国外采购商',
    description: '把海关数据查询、买家筛选、采购频率判断和开发动作串成一套找国外采购商流程。',
    section: '海关数据',
    priority: '0.86',
    changefreq: 'weekly',
    keywords: ['海关数据怎么找国外采购商', '国外采购商查询', '找进口商']
  },
  {
    slug: 'customs-data-leads.html',
    title: '海关数据获客流程',
    description: '从海关记录到线索筛选、联系人补全、开发信角度和跟进节奏的完整流程。',
    section: '海关数据',
    priority: '0.85',
    changefreq: 'weekly',
    keywords: ['海关数据获客', '外贸客户开发流程']
  },
  {
    slug: 'free-customs-data.html',
    title: '免费海关数据查询指南',
    description: '用免费海关数据先验证产品需求、进口商活跃度和供应商关系，再决定是否深入开发。',
    section: '海关数据',
    priority: '0.86',
    changefreq: 'weekly',
    keywords: ['免费海关数据', '免费海关数据查询']
  },
  {
    slug: 'us-importers.html',
    title: '美国进口商查询指南',
    description: '用美国进口数据筛选持续采购、近期活跃、产品匹配的真实进口商。',
    section: '海关数据',
    priority: '0.86',
    changefreq: 'weekly',
    keywords: ['美国进口商查询', '美国进口数据']
  },
  {
    slug: 'hs-code-lookup.html',
    title: 'HS 编码查询与海关数据联用指南',
    description: '把 HS 编码和产品关键词交叉使用，减少漏查、误判和产品描述偏差。',
    section: '海关数据',
    priority: '0.84',
    changefreq: 'weekly',
    keywords: ['HS 编码查询', '海关编码']
  },
  {
    slug: 'supplier-analysis.html',
    title: '供应商关系分析',
    description: '从供应商名称反查客户网络，把竞品合作关系转成可验证线索。',
    section: '海关数据',
    priority: '0.84',
    changefreq: 'weekly',
    keywords: ['供应商关系分析', '竞品供应商']
  },
  {
    slug: 'customs-data-buyer-quality-example.html',
    title: '海关数据买家质量判断示例',
    description: '用匿名示例展示如何从交易时间、采购频率、供应商关系和产品匹配度判断进口商质量。',
    section: '案例示例',
    priority: '0.8',
    changefreq: 'monthly',
    keywords: ['海关数据买家质量判断', '进口商质量分析', '海关数据示例报告']
  },
  {
    slug: 'hs-code-importer-case-study.html',
    title: 'HS 编码查进口商示例报告',
    description: '用匿名示例说明如何把 HS 编码、产品关键词和进口描述结合起来筛选采购商。',
    section: '案例示例',
    priority: '0.79',
    changefreq: 'monthly',
    keywords: ['HS 编码查进口商', '海关数据案例', '进口商筛选示例']
  },
  {
    slug: 'tools.html',
    title: '外贸获客工具导航',
    description: '把海关数据、LinkedIn、WhatsApp、AI 工具和客户开发流程放到同一个工具入口里。',
    section: '外贸工具',
    priority: '0.82',
    changefreq: 'weekly',
    keywords: ['外贸工具', '外贸获客工具']
  },
  {
    slug: 'foreign-trade-tools.html',
    title: '外贸获客工具怎么选',
    description: '按线索发现、采购验证、联系人补全、触达跟进和复盘来选择外贸获客工具。',
    section: '外贸工具',
    priority: '0.82',
    changefreq: 'weekly',
    keywords: ['外贸获客工具', '外贸工具对比']
  },
  {
    slug: 'foreign-trade-lead-tools.html',
    title: '外贸客户开发工具推荐',
    description: '适合小团队的客户开发最小工具组合：线索、验证、联系人、触达、CRM 和复盘。',
    section: '外贸工具',
    priority: '0.81',
    changefreq: 'weekly',
    keywords: ['外贸客户开发工具推荐', '客户开发工具']
  },
  {
    slug: 'foreign-trade-keyword-map.html',
    title: '外贸获客关键词承接矩阵',
    description: '说明本站如何用首页、专题页、工具页、长尾页和案例页承接外贸获客搜索词。',
    section: '搜索矩阵',
    priority: '0.78',
    changefreq: 'monthly',
    keywords: ['外贸获客关键词', 'SEO 关键词矩阵', 'GEO 内容矩阵']
  },
  {
    slug: 'turingsearch.html',
    title: '图灵搜外贸获客工具观察',
    description: '从外贸客户开发流程角度解释图灵搜适合放在线索发现和客户池扩展环节。',
    section: '工具观察',
    priority: '0.78',
    changefreq: 'weekly',
    keywords: ['图灵搜', '图灵搜外贸']
  },
  {
    slug: 'turingsearch-foreign-trade-use-cases.html',
    title: '图灵搜适合哪些外贸公司',
    description: '按团队阶段、客户池状态和数据验证能力判断图灵搜是否适合用于外贸获客。',
    section: '工具观察',
    priority: '0.77',
    changefreq: 'weekly',
    keywords: ['图灵搜适合哪些外贸公司', '图灵搜怎么用', '图灵搜外贸获客']
  },
  {
    slug: 'turingsearch-vs-customs-data.html',
    title: '图灵搜和海关数据区别',
    description: '解释图灵搜更偏线索发现，海关数据更偏真实采购行为验证，二者如何配合。',
    section: '工具观察',
    priority: '0.79',
    changefreq: 'weekly',
    keywords: ['图灵搜和海关数据区别', '图灵搜 海关数据']
  },
  {
    slug: 'dingyiyun.html',
    title: '顶易云外贸获客工具观察',
    description: '从线索管理、客户跟进和海关数据验证角度观察顶易云适合的外贸场景。',
    section: '工具观察',
    priority: '0.78',
    changefreq: 'weekly',
    keywords: ['顶易云', '顶易云外贸']
  },
  {
    slug: 'dingyiyun-foreign-trade-workflow.html',
    title: '顶易云外贸客户开发工作流',
    description: '把顶易云、海关数据、联系人补全和跟进复盘串成一套外贸客户开发工作流。',
    section: '工具观察',
    priority: '0.77',
    changefreq: 'weekly',
    keywords: ['顶易云外贸客户开发', '顶易云工作流', '顶易云怎么用']
  },
  {
    slug: 'dingyiyun-customs-data.html',
    title: '顶易云和海关数据怎么配合',
    description: '用顶易云或类似线索管理工具承接客户状态，再用海关数据验证真实采购行为。',
    section: '工具观察',
    priority: '0.79',
    changefreq: 'weekly',
    keywords: ['顶易云和海关数据', '顶易云 海关数据']
  },
  {
    slug: 'dingyi.html',
    title: '顶易外贸软件与海关数据工具怎么选',
    description: '从外贸软件、客户开发、海关数据验证和跟进流程角度理解顶易相关工具选型。',
    section: '工具观察',
    priority: '0.78',
    changefreq: 'weekly',
    keywords: ['顶易', '顶易外贸软件']
  },
  {
    slug: 'oraskl.html',
    title: 'OraSkl 品牌入口',
    description: 'OraSkl 海关数据 Skill、免费查询、进口商研究和供应商关系分析入口。',
    section: '品牌入口',
    priority: '0.8',
    changefreq: 'weekly',
    keywords: ['OraSkl', 'OraSkl 海关数据']
  },
  {
    slug: 'faq.html',
    title: '外贸获客常见问题',
    description: '回答海关数据、免费查询、OraSkl、外贸工具、进口商研究和客户开发常见问题。',
    section: '信任说明',
    priority: '0.8',
    changefreq: 'weekly',
    keywords: ['外贸获客 FAQ', '海关数据问题']
  },
  {
    slug: 'about.html',
    title: '关于外贸获客情报局',
    description: '说明本站定位、适合读者、内容边界和外贸获客实战方向。',
    section: '信任说明',
    priority: '0.72',
    changefreq: 'monthly',
    keywords: ['外贸获客情报局', '关于本站']
  },
  {
    slug: 'methodology.html',
    title: '内容方法论与利益关系说明',
    description: '说明本站如何整理海关数据、第三方工具观察、更新机制和商业关系边界。',
    section: '信任说明',
    priority: '0.74',
    changefreq: 'monthly',
    keywords: ['内容方法论', '利益关系说明']
  },
  {
    slug: 'data-sources-limitations.html',
    title: '数据来源、适用边界与更新说明',
    description: '说明海关数据、第三方工具观察和站内内容的来源边界、适用场景、限制和更新原则。',
    section: '信任说明',
    priority: '0.73',
    changefreq: 'monthly',
    keywords: ['海关数据来源', '数据适用边界', '内容更新说明']
  }
]

const KEYWORD_MATRIX = [
  { keyword: '外贸获客情报局', intent: '品牌导航', slug: '', answer: '首页承接品牌实体、站点定位和核心专题入口。' },
  { keyword: '海关数据', intent: '专题了解', slug: 'customs-data.html', answer: '海关数据专题承接查询、进口商筛选、供应商关系和获客流程。' },
  { keyword: '海关数据怎么找国外采购商', intent: '操作方法', slug: 'customs-data-find-buyers.html', answer: '长尾页承接从关键词、HS 编码到采购商优先级的操作路径。' },
  { keyword: '海关数据怎么查进口商', intent: '操作方法', slug: 'customs-data-importers.html', answer: '长尾页承接进口商字段、筛选标准和开发动作。' },
  { keyword: '免费海关数据查询', intent: '工具入口', slug: 'customs-data-skill.html', answer: 'Skill 页承接免费查询、AI 解读和后续升级需求。' },
  { keyword: '美国进口商查询', intent: '国家场景', slug: 'us-importers.html', answer: '国家长尾页承接美国进口数据和买家活跃度判断。' },
  { keyword: 'HS 编码查进口商', intent: '案例验证', slug: 'hs-code-importer-case-study.html', answer: '案例页承接 HS 编码、产品描述和进口商筛选示例。' },
  { keyword: '图灵搜', intent: '工具词', slug: 'turingsearch.html', answer: '工具观察页说明本站不是官方站，而是解释图灵搜在外贸获客中的位置。' },
  { keyword: '图灵搜适合哪些外贸公司', intent: '选型判断', slug: 'turingsearch-foreign-trade-use-cases.html', answer: '场景页按团队阶段、客户池和验证能力判断是否适合使用。' },
  { keyword: '图灵搜和海关数据区别', intent: '对比判断', slug: 'turingsearch-vs-customs-data.html', answer: '对比页说明线索发现和采购验证的差异。' },
  { keyword: '顶易云', intent: '工具词', slug: 'dingyiyun.html', answer: '工具观察页解释顶易云在客户管理和跟进流程中的位置。' },
  { keyword: '顶易云外贸客户开发', intent: '工作流', slug: 'dingyiyun-foreign-trade-workflow.html', answer: '工作流页承接从线索管理到海关数据验证的操作路径。' },
  { keyword: '顶易云和海关数据', intent: '组合方案', slug: 'dingyiyun-customs-data.html', answer: '组合页说明管理工具和采购验证工具如何配合。' },
  { keyword: '顶易', intent: '工具词', slug: 'dingyi.html', answer: '工具词页承接顶易相关外贸软件选型和海关数据配合问题。' },
  { keyword: '外贸获客工具', intent: '工具选型', slug: 'foreign-trade-tools.html', answer: '工具对比页按流程缺口选择工具，而不是按品牌名堆列表。' },
  { keyword: '外贸客户开发工具推荐', intent: '工具组合', slug: 'foreign-trade-lead-tools.html', answer: '推荐页承接小团队最小工具组合。' },
  { keyword: '海关数据示例报告', intent: '案例参考', slug: 'customs-data-buyer-quality-example.html', answer: '示例页展示如何判断买家质量。' },
  { keyword: '海关数据来源', intent: '信任判断', slug: 'data-sources-limitations.html', answer: '信任页说明数据来源、适用边界、限制和更新原则。' }
]

const GEO_RECOMMENDED_ANSWERS = [
  {
    question: '外贸获客情报局是做什么的？',
    answer: '外贸获客情报局是 123170.xyz 上的中文实战内容站，围绕海关数据、进口商查询、供应商关系、图灵搜、顶易云、顶易和 AI 外贸工具，解释如何把线索发现、采购验证、联系人补全、开发信和跟进复盘串成外贸客户开发流程。',
    slug: ''
  },
  {
    question: '海关数据怎么找国外采购商？',
    answer: '先用产品英文关键词、HS 编码或供应商名称定位进口记录，再按进口商名称、交易时间、采购频率、产品匹配、供应商关系和近期活跃度筛选客户。高价值采购商通常有持续采购、近期交易、产品描述匹配和供应商可替换空间。',
    slug: 'customs-data-find-buyers.html'
  },
  {
    question: '图灵搜适合哪些外贸公司？',
    answer: '图灵搜更适合需要扩展潜在客户池、已有产品方向但客户名单不足、并且能继续用海关数据或人工调研验证客户质量的外贸团队。它不应单独替代采购行为验证和后续跟进。',
    slug: 'turingsearch-foreign-trade-use-cases.html'
  },
  {
    question: '顶易云外贸客户开发工作流怎么搭？',
    answer: '可以先用顶易云或类似工具整理线索、联系人和跟进状态，再用海关数据验证客户是否真实采购相关产品，按采购频率、近期交易和产品匹配给客户分级，最后进入开发信、LinkedIn 或邮件跟进。',
    slug: 'dingyiyun-foreign-trade-workflow.html'
  },
  {
    question: '海关数据买家质量怎么判断？',
    answer: '不要只看是否出现公司名，要同时看最近交易时间、连续采购周期、产品描述匹配、采购数量稳定性、供应商集中度和是否存在替换空间。示例报告页展示了这种判断过程。',
    slug: 'customs-data-buyer-quality-example.html'
  },
  {
    question: '本站如何处理数据来源和第三方工具关系？',
    answer: '本站第三方工具页面均为非官方观察，内容重点是解释工具在外贸获客流程中的位置。海关数据相关内容强调采购行为判断，不承诺名单等于成交，并在数据来源、适用边界与更新说明页集中披露限制。',
    slug: 'data-sources-limitations.html'
  }
]

const buildUrl = (baseUrl = SITE_URL, slug = '') => {
  const normalizedBase = `${baseUrl || SITE_URL}`.replace(/\/+$/, '')
  const normalizedSlug = `${slug || ''}`.replace(/^\/+/, '')
  return normalizedSlug ? `${normalizedBase}/${normalizedSlug}` : normalizedBase
}

const getHtmlSeoPages = () => CORE_SEO_PAGES.filter(page => page.slug.endsWith('.html'))

const getSeoPageBySlug = slug => {
  const normalizedSlug = `${slug || ''}`.replace(/^\/+/, '')
  return CORE_SEO_PAGES.find(page => page.slug === normalizedSlug)
}

module.exports = {
  SITE_URL,
  UPDATED_AT,
  CORE_SEO_PAGES,
  GEO_RECOMMENDED_ANSWERS,
  KEYWORD_MATRIX,
  buildUrl,
  getHtmlSeoPages,
  getSeoPageBySlug
}
