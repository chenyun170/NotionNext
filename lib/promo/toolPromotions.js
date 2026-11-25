/**
 * 全站工具推广与软件试用配置中心。
 *
 * 设计原则：
 * 1. 活动期内（<= deadline）展示限时活动文案与活动链接；
 * 2. 活动过期后（> deadline）自动无缝切换为“外贸获客软件免费试用”软推荐，
 *    避免组件变空盒或长期挂着过期促销文案；
 * 3. 顶部通知条、站内工具卡片与文章侧栏复用同一份数据源。
 */

export const PROMO_ITEMS = [
  {
    id: 'turingsearch',
    tool: 'turingsearch',
    name: '图灵搜',
    icon: 'fa-compass',
    campaign: {
      deadline: '2026-11-30T23:59:59+08:00',
      badge: '双十一活动',
      bannerText: '图灵搜双十一活动开启，查看活动方案与优惠信息',
      bannerShortText: '图灵搜双十一',
      description: '双十一限时方案开放中，适合需要按地区/地图拓展海外客户池的外贸团队。',
      cta: '查看活动方案',
      href: 'https://h.topeasysoft.com/20261111tls/index.html?i=BB54F6#pricing',
      isExternal: true,
      trackSource: 'promo_turingsearch_campaign'
    },
    evergreen: {
      badge: '免费试用',
      bannerText: '外贸主动找客户：图灵搜地图线索 + 决策人邮箱挖掘支持免费试用',
      bannerShortText: '图灵搜免费试用',
      description: '用谷歌地图按产品和目标市场筛查海外采购商，并自动挖掘决策人邮箱，支持免费体验。',
      cta: '申请免费试用',
      href: 'https://t.smartsousou.com/m?i=BB54F6',
      isExternal: true,
      trackSource: 'promo_turingsearch_trial'
    }
  },
  {
    id: 'dingyiyun',
    tool: 'dingyiyun',
    name: '顶易云',
    icon: 'fa-layer-group',
    campaign: {
      deadline: '2026-11-30T23:59:59+08:00',
      badge: '双十一活动',
      bannerText: '顶易云双十一活动进行中，查看活动方案与优惠信息',
      bannerShortText: '顶易云双十一',
      description: '双十一限时方案进行中，覆盖搜索、社媒、海关线索整合与自动化跟进。',
      cta: '查看活动方案',
      href: 'https://h.topeasysoft.com/20261111dyy/index.html?i=BB54F6',
      isExternal: true,
      trackSource: 'promo_dingyiyun_campaign'
    },
    evergreen: {
      badge: '获客工作流',
      bannerText: '顶易云外贸工作流：多渠道找客户 + 海关数据交叉验证与跟进管理',
      bannerShortText: '顶易云体验指南',
      description: '整合搜索引擎、地图、社媒线索与海关数据验证，适合把客户开发和跟进流程系统化。',
      cta: '查看试用与工作流',
      href: '/dingyiyun.html',
      isExternal: false,
      trackSource: 'promo_dingyiyun_evergreen'
    }
  },
  {
    id: 'oraskl',
    tool: 'oraskl',
    name: 'OraSkl 海关数据',
    icon: 'fa-database',
    evergreen: {
      badge: '免费查询',
      bannerText: 'OraSkl 海关数据 Skill：免费查美国进口商采购记录与供应商关系',
      bannerShortText: '免费查海关数据',
      description: '输入产品词或 HS 编码，直接查真实美国进口商、近期采购频率与在合作供应商。',
      cta: '免费查海关数据',
      href: '/customs-data-skill.html',
      isExternal: false,
      trackSource: 'promo_oraskl_free'
    }
  }
]

/**
 * 判断某个活动配置在指定时间是否处于活动期。
 * @param {{ deadline?: string | Date }} campaign
 * @param {Date | number} now
 * @returns {boolean}
 */
export const isCampaignActive = (campaign, now = new Date()) => {
  if (!campaign || !campaign.deadline) {
    return false
  }
  const deadlineMs = new Date(campaign.deadline).getTime()
  const nowMs = now instanceof Date ? now.getTime() : Number(now)
  return Number.isFinite(deadlineMs) && Number.isFinite(nowMs) && nowMs <= deadlineMs
}

/**
 * 获取当前时刻应展示的推广列表（活动期自动取 campaign，过期自动回落到 evergreen 免费试用）。
 * @param {Date | number} now
 */
export const getActiveToolPromotions = (now = new Date()) => {
  const items = PROMO_ITEMS.map(item => {
    const campaignOn = isCampaignActive(item.campaign, now)
    const activeVariant = campaignOn ? item.campaign : item.evergreen

    return {
      id: item.id,
      tool: item.tool,
      name: item.name,
      icon: item.icon,
      mode: campaignOn ? 'campaign' : 'evergreen',
      ...activeVariant
    }
  })

  const hasLiveCampaign = items.some(item => item.mode === 'campaign')
  const bannerItems = hasLiveCampaign
    ? items.filter(item => item.mode === 'campaign')
    : items.filter(item => item.id === 'turingsearch' || item.id === 'oraskl')

  return {
    hasLiveCampaign,
    sectionTitle: hasLiveCampaign ? '限时工具活动' : '外贸软件免费试用推荐',
    sectionSubtitle: hasLiveCampaign
      ? '当前处于活动期，结束后将自动切换为软件免费试用入口。'
      : '先用免费试用和真实数据验证，再决定是否投入预算。',
    bannerItems,
    items
  }
}
