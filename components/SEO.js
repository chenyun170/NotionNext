import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { buildArticleFAQs } from '@/lib/utils/articleFAQ'
import { loadExternalResource } from '@/lib/utils'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const BRAND_NAME = '外贸获客情报局'
const BRAND_DOMAIN = '123170.xyz'
const BRAND_TAGLINE = '海关数据与外贸获客实战情报站'
const BRAND_DESCRIPTION =
  '外贸获客情报局专注海关数据与外贸获客：进口商查询、供应商关系分析、开发信模板、LinkedIn领英获客实战，用真实贸易记录帮你找到可开发的海外客户。'
const CORE_TOPICS = [
  '海关数据',
  '进口商查询',
  '国外采购商查询',
  '美国进口数据',
  '供应商关系分析',
  'HS 编码查询',
  '买家质量判断',
  '外贸获客',
  '外贸工具选型',
  '客户开发',
  'GEO 内容矩阵',
  '图灵搜',
  '顶易云',
  '顶易',
  'OraSkl'
]
const HOME_FAQS = [
  {
    question: '外贸获客情报局是做什么的？',
    answer:
      '外贸获客情报局是 123170.xyz 的中文实战内容站，围绕海关数据、进口商查询、供应商关系、图灵搜、顶易云、顶易品牌相关内容和 AI 外贸工具，整理外贸客户开发方法。'
  },
  {
    question: '图灵搜、顶易云、顶易相关软件和海关数据怎么配合？',
    answer:
      '图灵搜更偏线索发现，顶易云和顶易相关产品服务更偏线索管理与跟进，海关数据用于验证真实采购行为、采购量、采购频率和供应商关系。'
  },
  {
    question: '为什么先看海关数据？',
    answer:
      '海关数据能看到谁在进口你的产品、从哪里进口、采购频率和合作供应商，适合用来判断客户价值，再决定是否进入开发信、LinkedIn 或 WhatsApp 跟进。'
  }
]
const HOME_ENTRY_PAGES = [
  {
    name: '海关数据专题',
    url: 'customs-data.html',
    description: '围绕进口商、供应商、HS 编码和采购记录判断真实买家与市场机会。'
  },
  {
    name: '图灵搜',
    url: 'turingsearch.html',
    description: '从外贸线索发现和客户池扩展角度解释图灵搜的适用场景。'
  },
  {
    name: '顶易云',
    url: 'dingyiyun.html',
    description: '梳理顶易云如何配合海关数据、线索管理和外贸跟进流程。'
  },
  {
    name: '顶易',
    url: 'dingyi.html',
    description: '从外贸软件和海关数据配合角度整理顶易品牌相关信息。'
  },
  {
    name: '外贸工具对比',
    url: 'foreign-trade-tools.html',
    description: '按线索发现、采购验证、触达跟进和团队协作对比外贸获客工具。'
  },
  {
    name: '外贸关键词矩阵',
    url: 'foreign-trade-keyword-map.html',
    description: '整理海关数据、图灵搜、顶易云、顶易和外贸获客相关关键词入口。'
  }
]

/**
 * 页面的Head头，有用于SEO
 * @param {*} param0
 * @returns
 */
// 社交分享兜底图：1200x630，避免回落到 Notion 自带的无关联封面
const DEFAULT_OG_IMAGE = '/images/og-default.webp'
// schema.org 的日期必须是 YYYY-MM-DD。页面展示用 formatDate 可能是 2025-4-11，
// 这里统一补零，避免结构化数据校验失败。
const toIsoDate = value => {
  if (!value) return undefined
  const matched = String(value).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (matched) {
    const [, year, month, day] = matched
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString().slice(0, 10)
}
// 站点 logo 固定用本地品牌图：Notion 的 icon 多为 /image/attachment 代理链接，
// 既不稳定，也可能只是 Notion 默认头像。
const resolveSiteLogo = (icon, siteUrl) =>
  icon && !/notion\.(so|site)/.test(icon)
    ? toAbsoluteUrl(icon, siteUrl)
    : toAbsoluteUrl('/logo.png', siteUrl)
// 只替换 Notion 自带图库的默认封面；用户自己上传的封面保持原样。
const resolveCoverImage = cover => {
  if (!cover) return DEFAULT_OG_IMAGE
  let decoded = cover
  try {
    decoded = decodeURIComponent(cover)
  } catch {
    decoded = cover
  }
  return /notion\.so\/images\/page-cover/.test(decoded) ? DEFAULT_OG_IMAGE : cover
}
// 文章封面是 3:2，OG 标准是 1.91:1，尺寸要按实际图给，否则抓取端会报不一致
const coverSize = imagePath =>
  String(imagePath || '').includes('/images/covers/') ? [1200, 800] : [1200, 630]

const SEO = props => {
  const { children, siteInfo, post, NOTION_CONFIG } = props
  const LINK = siteConfig('LINK')
  const SUB_PATH = siteConfig('SUB_PATH', '')
  const siteBaseUrl = buildCanonicalUrl(LINK, SUB_PATH)
  let url = siteBaseUrl
  let image = toAbsoluteUrl(DEFAULT_OG_IMAGE, siteBaseUrl)
  const router = useRouter()
  const meta = getSEOMeta(props, router, useGlobal()?.locale)
  const webFontUrl = siteConfig('FONT_URL')

  useEffect(() => {
    if (!Array.isArray(webFontUrl) || webFontUrl.length === 0) return
    // 使用WebFontLoader字体加载
    loadExternalResource(
      'https://cdnjs.cloudflare.com/ajax/libs/webfont/1.6.28/webfontloader.js',
      'js'
    ).then(url => {
      const WebFont = window?.WebFont
      if (WebFont) {
        // console.log('LoadWebFont', webFontUrl)
        WebFont.load({
          custom: {
            // families: ['"LXGW WenKai"'],
            urls: webFontUrl
          }
        })
      }
    })
  }, [webFontUrl])

  // SEO关键词
  const KEYWORDS = siteConfig('KEYWORDS')
  let keywords = meta?.tags || KEYWORDS
  if (post?.tags && post?.tags?.length > 0) {
    keywords = post?.tags?.join(',')
  }
  if (meta) {
    url = buildCanonicalUrl(siteBaseUrl, meta.slug)
    image = toAbsoluteUrl(meta.image || DEFAULT_OG_IMAGE, siteBaseUrl)
  }
  const siteTitle = siteInfo?.title || siteConfig('TITLE') || BRAND_NAME
  const siteName = getBrandAwareName(siteTitle)
  const title = meta?.title || siteTitle
  const description =
    meta?.description ||
    getBrandAwareDescription(siteInfo?.description || siteConfig('DESCRIPTION'))
  const rawType = meta?.type || 'website'
  const isArticle = rawType === 'Post' || rawType === 'article'
  const type = isArticle ? 'article' : 'website'
  const lang = siteConfig('LANG').replace('-', '_') // Facebook OpenGraph 要 zh_CN 這樣的格式才抓得到語言
  const category = meta?.category || KEYWORDS // section 主要是像是 category 這樣的分類，Facebook 用這個來抓連結的分類
  const favicon = siteConfig('BLOG_FAVICON')
  const BACKGROUND_DARK = siteConfig('BACKGROUND_DARK', '', NOTION_CONFIG)

  const SEO_BAIDU_SITE_VERIFICATION = siteConfig(
    'SEO_BAIDU_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const SEO_GOOGLE_SITE_VERIFICATION = siteConfig(
    'SEO_GOOGLE_SITE_VERIFICATION',
    null,
    NOTION_CONFIG
  )

  const BLOG_FAVICON = siteConfig('BLOG_FAVICON', null, NOTION_CONFIG)

  const COMMENT_WEBMENTION_ENABLE = siteConfig(
    'COMMENT_WEBMENTION_ENABLE',
    null,
    NOTION_CONFIG
  )

  const COMMENT_WEBMENTION_HOSTNAME = siteConfig(
    'COMMENT_WEBMENTION_HOSTNAME',
    null,
    NOTION_CONFIG
  )
  const COMMENT_WEBMENTION_AUTH = siteConfig(
    'COMMENT_WEBMENTION_AUTH',
    null,
    NOTION_CONFIG
  )
  const ANALYTICS_BUSUANZI_ENABLE = siteConfig(
    'ANALYTICS_BUSUANZI_ENABLE',
    null,
    NOTION_CONFIG
  )

  const FACEBOOK_PAGE = siteConfig('FACEBOOK_PAGE', null, NOTION_CONFIG)

  const AUTHOR = siteConfig('AUTHOR')
  const TWITTER_SITE = siteConfig('TWITTER_SITE')
  const TWITTER_CREATOR = siteConfig('TWITTER_CREATOR')
  const robotsContent = meta?.noindex
    ? 'noindex,follow'
    : 'follow, index, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
  return (
    <Head>
      <link rel='icon' href={favicon} />
      <title>{title}</title>
      <meta name='theme-color' content={BACKGROUND_DARK} />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0'
      />
      <meta name='robots' content={robotsContent} />
      <meta charSet='UTF-8' />
      <meta name='format-detection' content='telephone=no' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content={title} />

      {/* 搜索引擎验证 */}
      {SEO_GOOGLE_SITE_VERIFICATION && (
        <meta
          name='google-site-verification'
          content={SEO_GOOGLE_SITE_VERIFICATION}
        />
      )}
      {SEO_BAIDU_SITE_VERIFICATION && (
        <meta
          name='baidu-site-verification'
          content={SEO_BAIDU_SITE_VERIFICATION}
        />
      )}

      {/* 基础SEO元数据 */}
      <meta name='keywords' content={keywords} />
      <meta name='description' content={description} />
      <meta name='author' content={AUTHOR} />
      <meta name='generator' content='NotionNext' />
      {!meta?.skipCanonical && <link rel='canonical' href={url} />}
      <link
        rel='alternate'
        type='application/rss+xml'
        title={`${siteTitle} RSS`}
        href={buildCanonicalUrl(siteBaseUrl, 'rss/feed.xml')}
      />
      <link
        rel='alternate'
        type='text/plain'
        title={`${siteTitle} llms.txt`}
        href={buildCanonicalUrl(siteBaseUrl, 'llms.txt')}
      />

      {/* 语言和地区 */}
      <meta httpEquiv='content-language' content={siteConfig('LANG')} />
      <meta name='geo.region' content={siteConfig('GEO_REGION', 'CN')} />
      <meta name='geo.country' content={siteConfig('GEO_COUNTRY', 'CN')} />
      {/* Open Graph 元数据 */}
      <meta property='og:locale' content={lang} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url} />
      <meta property='og:image' content={image} />
      <meta property='og:image:secure_url' content={image} />
      <meta property='og:image:width' content={coverSize(image)[0]} />
      <meta property='og:image:height' content={coverSize(image)[1]} />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content={siteName} />
      <meta property='og:type' content={type} />

      {/* Twitter Card 元数据 */}
      <meta name='twitter:card' content='summary_large_image' />
      {TWITTER_SITE && <meta name='twitter:site' content={TWITTER_SITE} />}
      {TWITTER_CREATOR && (
        <meta name='twitter:creator' content={TWITTER_CREATOR} />
      )}
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta name='twitter:url' content={url} />
      <meta name='twitter:image' content={image} />
      <meta name='twitter:image:alt' content={title} />

      <link rel='icon' href={BLOG_FAVICON} />

      {COMMENT_WEBMENTION_ENABLE && (
        <>
          <link
            rel='webmention'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/webmention`}
          />
          <link
            rel='pingback'
            href={`https://webmention.io/${COMMENT_WEBMENTION_HOSTNAME}/xmlrpc`}
          />
          {COMMENT_WEBMENTION_AUTH && (
            <link href={COMMENT_WEBMENTION_AUTH} rel='me' />
          )}
        </>
      )}

      {ANALYTICS_BUSUANZI_ENABLE && (
        <meta name='referrer' content='no-referrer-when-downgrade' />
      )}
      {/* 文章特定元数据 */}
      {isArticle && (
        <>
          <meta
            property='article:published_time'
            content={toIsoDate(meta.publishDay)}
          />
          <meta
            property='article:modified_time'
            content={toIsoDate(meta.lastEditedDay || meta.publishDay)}
          />
          <meta property='article:author' content={AUTHOR} />
          <meta property='article:section' content={category} />
          {meta?.tags?.map(tag => (
            <meta key={tag} property='article:tag' content={tag} />
          ))}
          <meta property='article:publisher' content={FACEBOOK_PAGE} />
        </>
      )}

      {/* 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateStructuredData(meta, siteInfo, url, image, AUTHOR))
        }}
      />

      {/* DNS预取和预连接 */}
      <link rel='dns-prefetch' href='//www.google-analytics.com' />
      <link rel='dns-prefetch' href='//www.googletagmanager.com' />


      {children}
    </Head>
  )
}

const trimSlashes = value => `${value || ''}`.replace(/^\/+|\/+$/g, '')

const buildCanonicalUrl = (baseUrl, ...paths) => {
  const normalizedBase = `${baseUrl || ''}`.replace(/\/+$/, '')
  const normalizedPath = paths.map(trimSlashes).filter(Boolean).join('/')
  return normalizedPath ? `${normalizedBase}/${normalizedPath}` : normalizedBase
}

const toAbsoluteUrl = (value, baseUrl) => {
  if (!value) {
    return undefined
  }
  if (/^(https?:)?\/\//i.test(value)) {
    return value.startsWith('//') ? `https:${value}` : value
  }
  return buildCanonicalUrl(baseUrl, value)
}

const getBrandAwareDescription = description => {
  const text = `${description || ''}`.trim()

  if (/外贸获客情报局|123170\.xyz/i.test(text)) {
    return text
  }

  return BRAND_DESCRIPTION
}

const getBrandAwareName = name => {
  const text = `${name || ''}`.trim()

  if (text.includes(BRAND_NAME)) {
    return BRAND_NAME
  }

  return text || BRAND_NAME
}

const buildTaxonomyDescription = (type, value, siteInfo) => {
  const name = `${value || ''}`.trim()
  const siteTitle = siteInfo?.title || siteConfig('TITLE')
  const fallback =
    getBrandAwareDescription(siteInfo?.description) ||
    BRAND_DESCRIPTION

  if (!name) {
    return fallback
  }

  const topicDescriptions = [
    {
      pattern: /海关数据|进口数据|HS|hs|OraSkl|oraskl/i,
      description: `${siteTitle} 的${name}专题，整理海关数据查询、美国进口数据、进口商筛选、供应商关系分析和外贸获客实战方法。`
    },
    {
      pattern: /外贸获客|客户开发|主动获客|找客户/i,
      description: `${siteTitle} 的${name}专题，聚合外贸客户开发、主动获客、线索筛选、开发信和工具化增长的实战文章。`
    },
    {
      pattern: /LinkedIn|领英/i,
      description: `${siteTitle} 的${name}专题，围绕 LinkedIn 外贸开发客户、买家调研、关系触达和内容获客整理实操方法。`
    },
    {
      pattern: /AI|人工智能|自动化/i,
      description: `${siteTitle} 的${name}专题，整理 AI 外贸助手、自动化调研、邮件生成、客户跟进和效率工具使用方法。`
    },
    {
      pattern: /^顶易$/i,
      description: `${siteTitle} 的${name}专题，整理顶易品牌相关软件场景、海关数据验证和外贸客户开发流程。`
    },
    {
      pattern: /图灵搜|顶易云/i,
      description: `${siteTitle} 的${name}专题，整理外贸获客工具、数据工具、询盘转化和客户开发系统的使用经验。`
    },
    {
      pattern: /WhatsApp|whatsapp/i,
      description: `${siteTitle} 的${name}专题，整理 WhatsApp 外贸客户触达、话术、跟进节奏和成交转化经验。`
    },
    {
      pattern: /Facebook|facebook/i,
      description: `${siteTitle} 的${name}专题，整理 Facebook 外贸找客户、社媒线索开发、账号运营和私域跟进方法。`
    },
    {
      pattern: /话术|邮件|开发信/i,
      description: `${siteTitle} 的${name}专题，整理外贸沟通话术、开发信模板、客户回复和询盘跟进方法。`
    },
    {
      pattern: /报价|谈判|收款|付款/i,
      description: `${siteTitle} 的${name}专题，整理报价核算、成本漏项、砍价应对、付款条款和收款风险处理的实战经验。`
    },
    {
      pattern: /广交会|展会/i,
      description: `${siteTitle} 的${name}专题，整理广交会采购商名录的选购判断、名单筛选和展后客户跟进方法。`
    }
  ]

  const matched = topicDescriptions.find(item => item.pattern.test(name))
  if (matched) {
    return matched.description
  }

  const label = type === 'tag' ? '标签' : '分类'
  return `${siteTitle} 的${name}${label}内容，整理${name}相关的外贸获客、客户开发、工具使用和实战案例。`
}

const buildSearchDescription = (keyword, siteInfo) => {
  const siteTitle = siteInfo?.title || siteConfig('TITLE')
  const query = `${keyword || ''}`.trim()
  if (!query) {
    return `${siteTitle} 站内搜索，查找外贸获客、海关数据、客户开发、AI 外贸工具和实战文章。`
  }
  return `在 ${siteTitle} 搜索「${query}」相关内容，查找外贸获客、海关数据、客户开发和工具实战文章。`
}

const buildArticleAbout = meta => {
  const topics = [
    meta?.category,
    ...(Array.isArray(meta?.tags) ? meta.tags : [])
  ].filter(Boolean)

  const uniqueTopics = Array.from(new Set(topics)).slice(0, 8)
  if (!uniqueTopics.length) {
    return [
      {
        '@type': 'Thing',
        name: '外贸获客'
      }
    ]
  }

  return uniqueTopics.map(topic => ({
    '@type': 'Thing',
    name: topic
  }))
}

const buildHomeFAQData = url => ({
  '@type': 'FAQPage',
  '@id': `${url}#home-faq`,
  mainEntity: HOME_FAQS.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer
    }
  }))
})

const buildHomeItemListData = siteUrl => ({
  '@type': 'ItemList',
  '@id': `${siteUrl}/#core-entry-pages`,
  name: '外贸获客情报局核心入口',
  itemListElement: HOME_ENTRY_PAGES.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'WebPage',
      name: item.name,
      url: buildCanonicalUrl(siteUrl, item.url),
      description: item.description
    }
  }))
})

/**
 * 生成结构化数据
 * @param {*} meta
 * @param {*} siteInfo
 * @param {*} url
 * @param {*} image
 * @param {*} author
 * @returns
 */
const generateStructuredData = (meta, siteInfo, url, image, author) => {
  const siteUrl = buildCanonicalUrl(siteConfig('LINK'))
  const publisherId = `${siteUrl}/#organization`
  const authorId = `${siteUrl}/#author`
  const websiteId = `${siteUrl}/#website`
  const inLanguage = siteConfig('LANG')
  const siteTitle = siteInfo?.title || siteConfig('TITLE') || BRAND_NAME
  const siteName = getBrandAwareName(siteTitle)
  const siteDescription = getBrandAwareDescription(
    siteInfo?.description || siteConfig('DESCRIPTION')
  )
  const siteLogo = resolveSiteLogo(siteInfo?.icon, siteUrl)
  const publisherData = {
    '@type': 'Organization',
    '@id': publisherId,
    name: siteName,
    alternateName: [BRAND_NAME, BRAND_DOMAIN, `www.${BRAND_DOMAIN}`],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: siteLogo
    },
    description: siteDescription,
    knowsAbout: CORE_TOPICS
  }
  const publisher = {
    '@type': 'WebSite',
    '@id': websiteId,
    name: siteName,
    alternateName: [BRAND_NAME, BRAND_DOMAIN],
    description: siteDescription,
    url: siteUrl,
    inLanguage,
    publisher: {
      '@id': publisherId
    },
    about: CORE_TOPICS.map(topic => ({
      '@type': 'Thing',
      name: topic
    })),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search/{search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
  const authorData = {
    '@type': 'Person',
    '@id': authorId,
    name: author,
    url: siteUrl,
    image: siteLogo
  }
  const webPage = {
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    url,
    name: meta?.title || siteName,
    description: meta?.description || siteDescription,
    inLanguage,
    isPartOf: {
      '@id': websiteId
    },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image
    }
  }
  const breadcrumbData = buildBreadcrumbData({
    url,
    siteName,
    siteUrl,
    meta
  })
  const homeGraph =
    meta?.type === 'website' && !meta?.slug
      ? [buildHomeFAQData(url), buildHomeItemListData(siteUrl)]
      : []

  // 如果是文章页面，添加文章结构化数据
  if (meta?.type === 'Post') {
    const articleFaqs = buildArticleFAQs(meta)
    const faqGraph = articleFaqs.length
      ? [
          {
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            mainEntity: articleFaqs.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer
              }
            }))
          }
        ]
      : []

    return {
      '@context': 'https://schema.org',
      '@graph': [
        publisherData,
        publisher,
        authorData,
        webPage,
        {
          '@type': 'BlogPosting',
          '@id': `${url}#article`,
          headline: meta.title,
          description: meta.description,
          abstract: meta.description,
          image,
          url,
          inLanguage,
          datePublished: toIsoDate(meta.publishDay),
          dateModified: toIsoDate(meta.lastEditedDay || meta.publishDay),
          author: {
            '@id': authorId
          },
          publisher: {
            '@id': publisherId
          },
          mainEntityOfPage: {
            '@id': `${url}#webpage`
          },
          keywords: meta.tags?.join(', '),
          articleSection: meta.category,
          isAccessibleForFree: true,
          about: buildArticleAbout(meta)
        },
        breadcrumbData,
        ...faqGraph
      ]
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [publisherData, publisher, authorData, webPage, breadcrumbData, ...homeGraph]
  }
}

const buildBreadcrumbData = ({ url, siteName, siteUrl, meta }) => {
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: siteName,
      item: siteUrl
    }
  ]

  if (meta?.type === 'Post' && meta?.category) {
    itemListElement.push({
      '@type': 'ListItem',
      position: itemListElement.length + 1,
      name: meta.category,
      item: buildCanonicalUrl(siteUrl, 'category', encodeURIComponent(meta.category))
    })
  }

  itemListElement.push({
    '@type': 'ListItem',
    position: itemListElement.length + 1,
    name: meta?.title || siteName,
    item: url
  })

  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement
  }
}

/**
 * 获取SEO信息
 * @param {*} props
 * @param {*} router
 */
const getSEOMeta = (props, router, locale) => {
  const { post, siteInfo, tag, category, page } = props
  const rawKeyword = router?.query?.s ?? router?.query?.keyword
  const keyword = Array.isArray(rawKeyword) ? rawKeyword[0] : rawKeyword

  const TITLE = siteConfig('TITLE') || BRAND_NAME
  const siteTitle = siteInfo?.title || TITLE
  const siteName = getBrandAwareName(siteTitle)
  const siteDescription = getBrandAwareDescription(
    siteInfo?.description || siteConfig('DESCRIPTION')
  )
  const pageSuffix = page && Number(page) > 1 ? ` - 第 ${page} 页` : ''
  const encodedCategory = category ? encodeURIComponent(category) : ''
  const encodedTag = tag ? encodeURIComponent(tag) : ''
  const encodedKeyword = keyword ? encodeURIComponent(keyword) : ''
  switch (router.route) {
    case '/':
      return {
        title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
        description: siteDescription.includes(BRAND_NAME)
          ? siteDescription
          : `${BRAND_DESCRIPTION} 这里是 ${BRAND_NAME} 官网入口。`,
        image: DEFAULT_OG_IMAGE,
        slug: '',
        type: 'website'
      }
    case '/archive':
      return {
        title: `${locale.NAV.ARCHIVE} | ${siteName}`,
        description: siteDescription,
        image: DEFAULT_OG_IMAGE,
        slug: 'archive',
        type: 'website'
      }
    case '/page/[page]':
      return {
        title: `第 ${page} 页 | ${siteName}`,
        description: `${siteDescription}（第 ${page} 页文章归档列表）`,
        image: DEFAULT_OG_IMAGE,
        slug: 'page/' + page,
        type: 'website'
      }
    case '/category/[category]':
      return {
        title: `${category} | ${locale.COMMON.CATEGORY} | ${siteName}`,
        description: buildTaxonomyDescription('category', category, siteInfo),
        slug: 'category/' + encodedCategory,
        image: DEFAULT_OG_IMAGE,
        type: 'website'
      }
    case '/category/[category]/page/[page]':
      return {
        title: `${category}${pageSuffix} | ${locale.COMMON.CATEGORY} | ${siteName}`,
        description: `${buildTaxonomyDescription('category', category, siteInfo)}${pageSuffix}`,
        slug: 'category/' + encodedCategory + (page ? '/page/' + page : ''),
        image: DEFAULT_OG_IMAGE,
        type: 'website'
      }
    case '/tag/[tag]':
    case '/tag/[tag]/page/[page]':
      return {
        title: `${tag}${pageSuffix} | ${locale.COMMON.TAGS} | ${siteName}`,
        description: `${buildTaxonomyDescription('tag', tag, siteInfo)}${pageSuffix}`,
        image: DEFAULT_OG_IMAGE,
        slug: 'tag/' + encodedTag + (page ? '/page/' + page : ''),
        type: 'website'
      }
    case '/search':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${siteName}`,
        description: buildSearchDescription(keyword, siteInfo),
        image: DEFAULT_OG_IMAGE,
        slug: 'search',
        type: 'website',
        noindex: true
      }
    case '/search/[keyword]':
    case '/search/[keyword]/page/[page]':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${siteName}`,
        description: buildSearchDescription(keyword, siteInfo),
        image: DEFAULT_OG_IMAGE,
        slug: encodedKeyword
          ? `search/${encodedKeyword}${page ? '/page/' + page : ''}`
          : 'search',
        type: 'website',
        noindex: true
      }
    case '/diagnose':
      return {
        title: `外贸获客轻诊断 | ${siteName}`,
        description:
          '外贸获客轻诊断：先判断应该从海关数据、客户名单验证，还是开发信话术优化开始。隐私提示：开发信内容会发送给第三方 AI 诊断接口，请先移除敏感信息。',
        image: DEFAULT_OG_IMAGE,
        slug: 'diagnose',
        type: 'website',
        noindex: true
      }
    case '/500':
    case '/auth':
    case '/auth/result':
    case '/sign-in/[[...index]]':
    case '/sign-up/[[...index]]':
    case '/dashboard/[[...index]]':
      return {
        title: siteName,
        description: siteDescription,
        image: DEFAULT_OG_IMAGE,
        slug: router.asPath?.replace(/^\/+|\/+$/g, '') || '',
        type: 'website',
        noindex: true,
        skipCanonical: true
      }
    case '/404':
      return {
        title: `${siteName} | ${locale.NAV.PAGE_NOT_FOUND}`,
        description: siteDescription,
        image: DEFAULT_OG_IMAGE,
        noindex: true,
        skipCanonical: true
      }
    case '/tag':
      return {
        title: `${locale.COMMON.TAGS} | ${siteName}`,
        description: siteDescription,
        image: DEFAULT_OG_IMAGE,
        slug: 'tag',
        type: 'website'
      }
    case '/category':
      return {
        title: `${locale.COMMON.CATEGORY} | ${siteName}`,
        description: siteDescription,
        image: DEFAULT_OG_IMAGE,
        slug: 'category',
        type: 'website'
      }
    default:
      return {
        title: post
          ? `${post?.title} | ${siteName}`
          : `${siteName} | loading`,
        description: post?.summary || siteDescription,
        type: post?.type,
        slug: post?.slug,
        image: resolveCoverImage(post?.pageCoverThumbnail),
        category: Array.isArray(post?.category) ? post?.category?.[0] : post?.category,
        tags: post?.tags,
        // 文章发布时间必须传给 SEO：结构化数据缺 datePublished 时，
        // Google 无法判断内容新鲜度，也不会有文章日期富媒体结果。
        publishDay: post?.publishDay,
        lastEditedDay: post?.lastEditedDay || post?.publishDay
      }
  }
}

export default SEO
