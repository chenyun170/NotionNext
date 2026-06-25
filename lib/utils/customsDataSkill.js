export const CUSTOMS_DATA_SKILL = {
  title: '海关数据免费查询 Skill',
  href: '/customs-data-skill.html',
  externalHref:
    'https://www.oraskl.com/?i=BB54F6&utm_source=123170&utm_medium=skill_page&utm_campaign=customs_data_skill',
  description:
    '免费查询美国进口商、供应商、HS 编码、清关量和价格趋势，用真实海关数据辅助外贸获客。',
  keywords: [
    '海关数据',
    '海关数据skill',
    '海关数据skll',
    '海关数据查询',
    '海关数据免费查询',
    '免费海关数据',
    '免费海关数据查询',
    '免费美国海关数据',
    '美国海关数据',
    '美国进口数据',
    '美国进口商查询',
    '进口数据',
    '进口商查询',
    '供应商分析',
    '供应商关系分析',
    'HS编码',
    'HS 编码',
    'HS编码查询',
    'HS code',
    '外贸客户线索',
    '海关数据获客',
    'customs data',
    'customs data skill',
    'customs data skll',
    'oraskl'
  ]
}

export const shouldShowCustomsDataSkill = keyword => {
  const normalizedKeyword = normalizeKeyword(keyword)

  if (!normalizedKeyword) {
    return false
  }

  return CUSTOMS_DATA_SKILL.keywords.some(item =>
    normalizedKeyword.includes(normalizeKeyword(item))
  )
}

export const shouldRedirectSearchToCustomsSkill = keyword => {
  const normalizedKeyword = normalizeKeyword(keyword)

  if (!normalizedKeyword) {
    return false
  }

  return /oraskl|skll/.test(normalizedKeyword)
}

const normalizeKeyword = keyword =>
  `${keyword || ''}`
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[｜|·・_\-—–,，.。/\\]+/g, '')
