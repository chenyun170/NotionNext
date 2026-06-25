#!/usr/bin/env node

const baseUrl = (process.env.VERIFY_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const orasklSkillTarget =
  'https://www.oraskl.com/?i=BB54F6&utm_source=123170&utm_medium=skill_page&utm_campaign=customs_data_skill'
const orasklBrandTarget =
  'https://www.oraskl.com/?i=BB54F6&utm_source=123170&utm_medium=brand_page&utm_campaign=customs_data_skill'

const text = {
  orasklTitle: '\u004f\u0072\u0061\u0053\u006b\u006c\u0020\u6d77\u5173\u6570\u636e\u0020\u0053\u006b\u0069\u006c\u006c\u0020\u514d\u8d39\u67e5\u8be2\u5165\u53e3',
  skill: '\u6d77\u5173\u6570\u636e\u0020\u0053\u006b\u0069\u006c\u006c',
  searchTypo: '\u6d77\u5173\u6570\u636e\u0073\u006b\u006c\u006c',
  searchTypoExtra: '\u6d77\u5173\u6570\u636e\u0073\u006b\u006c\u006c\u006c',
  homeCta: '\u6d77\u5173\u6570\u636e\u514d\u8d39\u67e5\u8be2\u0020\u0053\u006b\u0069\u006c\u006c',
  articleCard: '\u6d77\u5173\u6570\u636e\u5de5\u5177\u5165\u53e3'
}

const checks = [
  {
    name: '首页 CTA',
    path: '/',
    status: 200,
    contains: [text.homeCta, '/customs-data-skill.html']
  },
  {
    name: 'Skill 静态页',
    path: '/customs-data-skill.html',
    status: 200,
    contains: [
      'application/ld+json',
      'SoftwareApplication',
      'FAQPage',
      'HowTo',
      text.skill,
      'customs_data_skill_click',
      '.btn:focus-visible',
      orasklSkillTarget,
      '顶易海关数据查询',
      '供应商名称',
      '更长时间范围、更完整字段和更细筛选条件',
      '供应商名看客户关系'
    ],
    notContains: ['批量导出、团队协作', '海关数据 skll', text.searchTypo, '竞品名称', '竞品或供应商名'],
    containsBody: ['可以直接这样输入', 'solar garden light', '940541', 'competitor company name'],
    notContainsBody: [text.searchTypo, text.searchTypoExtra]
  },
  {
    name: '免费海关数据长尾页',
    path: '/free-customs-data.html',
    status: 200,
    contains: ['免费海关数据查询', 'AI 摘要', 'FAQPage', 'cluster_free_customs_skill']
  },
  {
    name: '美国进口商长尾页',
    path: '/us-importers.html',
    status: 200,
    contains: ['美国进口商查询', 'AI 摘要', 'FAQPage', 'cluster_us_importers_skill']
  },
  {
    name: 'HS 编码长尾页',
    path: '/hs-code-lookup.html',
    status: 200,
    contains: ['HS 编码查询', 'AI 摘要', 'FAQPage', 'cluster_hs_code_skill']
  },
  {
    name: '供应商分析长尾页',
    path: '/supplier-analysis.html',
    status: 200,
    contains: ['供应商关系分析', 'AI 摘要', 'FAQPage', 'cluster_supplier_skill']
  },
  {
    name: '海关数据获客流程页',
    path: '/customs-data-leads.html',
    status: 200,
    contains: ['海关数据获客流程', 'HowTo', 'AI 摘要', 'cluster_leads_skill']
  },
  {
    name: 'OraSkl 品牌页',
    path: '/oraskl.html',
    status: 200,
    contains: ['application/ld+json', 'SoftwareApplication', text.orasklTitle, 'customs_data_skill_click', orasklBrandTarget, '顶易海关数据查询'],
    notContainsBody: ['海关数据 skll']
  },
  {
    name: 'OraSkl 跳转',
    path: '/oraskl',
    redirect: '/oraskl.html'
  },
  {
    name: '免费海关数据跳转',
    path: '/free-customs-data',
    redirect: '/free-customs-data.html'
  },
  {
    name: '美国进口商跳转',
    path: '/us-importers',
    redirect: '/us-importers.html'
  },
  {
    name: 'HS 编码跳转',
    path: '/hs-code-lookup',
    redirect: '/hs-code-lookup.html'
  },
  {
    name: '供应商分析跳转',
    path: '/supplier-analysis',
    redirect: '/supplier-analysis.html'
  },
  {
    name: '海关数据获客流程跳转',
    path: '/customs-data-leads',
    redirect: '/customs-data-leads.html'
  },
  {
    name: 'sitemap 收录',
    path: '/sitemap.xml',
    status: 200,
    contains: [
      '/customs-data-skill.html',
      '/oraskl.html',
      '/free-customs-data.html',
      '/us-importers.html',
      '/hs-code-lookup.html',
      '/supplier-analysis.html',
      '/customs-data-leads.html'
    ],
    notContains: ['/zh-CN/customs-data-skill.html', '/zh-CN/oraskl.html', '/search</loc>']
  },
  {
    name: 'llms 收录',
    path: '/llms.txt',
    status: 200,
    contains: ['OraSkl Brand Entry', '免费海关数据查询指南', '美国进口商查询指南', '供应商关系分析']
  },
  {
    name: '搜索 oraskl 跳转',
    path: '/search/oraskl',
    redirect: '/customs-data-skill.html'
  },
  {
    name: '搜索 OraSkl 跳转',
    path: '/search/OraSkl',
    redirect: '/customs-data-skill.html'
  },
  {
    name: '搜索 skll 纠错跳转',
    path: `/search/${encodeURIComponent(text.searchTypo)}`,
    redirect: '/customs-data-skill.html'
  },
  {
    name: '普通搜索页 noindex',
    path: '/search?s=test',
    status: 200,
    contains: ['noindex,follow']
  },
  {
    name: '文章页内链卡',
    path: '/article/customs-data-linkedin',
    status: 200,
    contains: [text.articleCard, '海关数据免费查询 Skill', '/customs-data-skill.html']
  },
  {
    name: '分类页推荐卡',
    path: `/category/${encodeURIComponent('\u6d77\u5173\u6570\u636e')}`,
    status: 200,
    contains: ['customs-data-skill-search-title', '/customs-data-skill.html']
  },
  {
    name: '登录页动态可访问',
    path: '/sign-in',
    status: 200
  },
  {
    name: '注册页动态可访问',
    path: '/sign-up',
    status: 200
  },
  {
    name: '后台页动态可访问',
    path: '/dashboard',
    status: 200
  }
]

async function main() {
  const results = []

  for (const check of checks) {
    results.push(await runCheck(check))
  }

  results.push(await runTrackClickCheck())

  const failed = results.filter(result => !result.ok)

  for (const result of results) {
    const icon = result.ok ? '✓' : '✗'
    const details = [
      `status=${result.status}`,
      result.location ? `location=${result.location}` : null,
      result.missing?.length ? `missing=${result.missing.join(',')}` : null,
      result.missingBody?.length ? `missingBody=${result.missingBody.join(',')}` : null,
      result.unexpected?.length ? `unexpected=${result.unexpected.join(',')}` : null,
      result.unexpectedBody?.length ? `unexpectedBody=${result.unexpectedBody.join(',')}` : null,
      result.error ? `error=${result.error}` : null
    ]
      .filter(Boolean)
      .join(' ')

    console.log(`${icon} ${result.name} ${details}`)
  }

  if (failed.length > 0) {
    console.error(`\n${failed.length} checks failed. Make sure the dev server is running at ${baseUrl}.`)
    process.exit(1)
  }

  console.log(`\nAll customs data Skill checks passed at ${baseUrl}.`)
}

async function runCheck(check) {
  try {
    const response = await fetch(`${baseUrl}${check.path}`, {
      redirect: 'manual'
    })
    const body = await response.text()
    const bodyContent = getBodyContent(body)
    const location = response.headers.get('location')
    const missing = (check.contains || []).filter(item => !body.includes(item))
    const missingBody = (check.containsBody || []).filter(item => !bodyContent.includes(item))
    const unexpected = (check.notContains || []).filter(item => body.includes(item))
    const unexpectedBody = (check.notContainsBody || []).filter(item => bodyContent.includes(item))
    const okStatus = check.redirect
      ? response.status >= 300 && response.status < 400
      : response.status === check.status
    const okLocation = check.redirect ? location === check.redirect : true

    return {
      name: check.name,
      status: response.status,
      location,
      missing,
      missingBody,
      unexpected,
      unexpectedBody,
      ok: okStatus &&
        okLocation &&
        missing.length === 0 &&
        missingBody.length === 0 &&
        unexpected.length === 0 &&
        unexpectedBody.length === 0
    }
  } catch (error) {
    return {
      name: check.name,
      status: 'ERR',
      error: error.message,
      ok: false
    }
  }
}

function getBodyContent(html) {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch ? bodyMatch[1] : html
}

async function runTrackClickCheck() {
  try {
    const response = await fetch(`${baseUrl}/api/track-click`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        event: 'customs_data_skill_click',
        source: 'verify_customs_skill',
        path: '/customs-data-skill.html',
        target: orasklSkillTarget,
        ts: Date.now()
      })
    })

    return {
      name: 'CTA 统计接口',
      status: response.status,
      ok: response.status === 204
    }
  } catch (error) {
    return {
      name: 'CTA 统计接口',
      status: 'ERR',
      error: error.message,
      ok: false
    }
  }
}

main()
