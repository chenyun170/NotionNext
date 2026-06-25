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
  '外贸获客情报局（123170.xyz）专注海关数据、进口商查询、供应商关系分析和 AI 外贸工具，把真实贸易记录整理成可执行的客户开发线索。'
const CORE_TOPICS = [
  '海关数据',
  '进口商查询',
  '美国进口数据',
  '供应商关系分析',
  'HS 编码查询',
  '外贸获客',
  '客户开发',
  '图灵搜',
  '顶易云',
  '顶易',
  'OraSkl'
]

/**
 * 页面的Head头，有用于SEO
 * @param {*} param0
 * @returns
 */
const SEO = props => {
  const { children, siteInfo, post, NOTION_CONFIG } = props
  const LINK = siteConfig('LINK')
  const SUB_PATH = siteConfig('SUB_PATH', '')
  const siteBaseUrl = buildCanonicalUrl(LINK, SUB_PATH)
  let url = siteBaseUrl
  let image = toAbsoluteUrl('/bg_image.jpg', siteBaseUrl)
  const router = useRouter()
  const meta = getSEOMeta(props, router, useGlobal()?.locale)
  const webFontUrl = siteConfig('FONT_URL')

  useEffect(() => {
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
    image = toAbsoluteUrl(meta.image || '/bg_image.jpg', siteBaseUrl)
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
  return (
    <Head>
      <link rel='icon' href={favicon} />
      <title>{title}</title>
      <meta name='theme-color' content={BACKGROUND_DARK} />
      <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0'
      />
      <meta name='robots' content='follow, index, max-snippet:-1, max-image-preview:large, max-video-preview:-1' />
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
      <link rel='canonical' href={url} />
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
      <meta property='og:image:width' content='1200' />
      <meta property='og:image:height' content='630' />
      <meta property='og:image:alt' content={title} />
      <meta property='og:site_name' content={siteName} />
      <meta property='og:type' content={type} />

      {/* Twitter Card 元数据 */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:site' content={siteConfig('TWITTER_SITE', '@NotionNext')} />
      <meta name='twitter:creator' content={siteConfig('TWITTER_CREATOR', '@NotionNext')} />
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
          <meta property='article:published_time' content={meta.publishDay} />
          <meta property='article:modified_time' content={meta.lastEditedDay} />
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
      <link rel='dns-prefetch' href='//fonts.googleapis.com' />
      <link rel='dns-prefetch' href='//www.google-analytics.com' />
      <link rel='dns-prefetch' href='//www.googletagmanager.com' />
      <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />

      {/* 预加载关键资源 */}
      <link rel='preload' href='/fonts/inter-var.woff2' as='font' type='font/woff2' crossOrigin='anonymous' />

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
      pattern: /图灵搜|顶易|顶易云/i,
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
  const siteLogo = toAbsoluteUrl(siteInfo?.icon || '/logo.png', siteUrl)
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
    image: siteInfo?.icon
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

  // 如果是文章页面，添加文章结构化数据
  if (meta?.type === 'Post') {
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
          datePublished: meta.publishDay,
          dateModified: meta.lastEditedDay || meta.publishDay,
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
        {
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: buildArticleFAQs(meta).map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
      ]
    }
  }

  return {
    '@context': 'https://schema.org',
    '@graph': [publisherData, publisher, authorData, webPage, breadcrumbData]
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
  const keyword = router?.query?.s

  const TITLE = siteConfig('TITLE') || BRAND_NAME
  const siteTitle = siteInfo?.title || TITLE
  const siteDescription = getBrandAwareDescription(
    siteInfo?.description || siteConfig('DESCRIPTION')
  )
  switch (router.route) {
    case '/':
      return {
        title: `${BRAND_NAME} - ${BRAND_TAGLINE}`,
        description: siteDescription.includes(BRAND_NAME)
          ? siteDescription
          : `${BRAND_DESCRIPTION} 这里是 ${BRAND_NAME} 官网入口。`,
        image: `${siteInfo?.pageCover}`,
        slug: '',
        type: 'website'
      }
    case '/archive':
      return {
        title: `${locale.NAV.ARCHIVE} | ${siteInfo?.title}`,
        description: `${siteInfo?.description}`,
        image: `${siteInfo?.pageCover}`,
        slug: 'archive',
        type: 'website'
      }
    case '/page/[page]':
      return {
        title: `${page} | Page | ${siteInfo?.title}`,
        description: `${siteInfo?.description}`,
        image: `${siteInfo?.pageCover}`,
        slug: 'page/' + page,
        type: 'website'
      }
    case '/category/[category]':
      return {
        title: `${category} | ${locale.COMMON.CATEGORY} | ${siteInfo?.title}`,
        description: buildTaxonomyDescription('category', category, siteInfo),
        slug: 'category/' + category,
        image: `${siteInfo?.pageCover}`,
        type: 'website'
      }
    case '/category/[category]/page/[page]':
      return {
        title: `${category} | ${locale.COMMON.CATEGORY} | ${siteInfo?.title}`,
        description: buildTaxonomyDescription('category', category, siteInfo),
        slug: 'category/' + category,
        image: `${siteInfo?.pageCover}`,
        type: 'website'
      }
    case '/tag/[tag]':
    case '/tag/[tag]/page/[page]':
      return {
        title: `${tag} | ${locale.COMMON.TAGS} | ${siteInfo?.title}`,
        description: buildTaxonomyDescription('tag', tag, siteInfo),
        image: `${siteInfo?.pageCover}`,
        slug: 'tag/' + tag,
        type: 'website'
      }
    case '/search':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${siteInfo?.title}`,
        description: buildSearchDescription(keyword, siteInfo),
        image: `${siteInfo?.pageCover}`,
        slug: 'search',
        type: 'website'
      }
    case '/search/[keyword]':
    case '/search/[keyword]/page/[page]':
      return {
        title: `${keyword || ''}${keyword ? ' | ' : ''}${locale.NAV.SEARCH} | ${siteInfo?.title}`,
        description: buildSearchDescription(keyword, siteInfo),
        image: `${siteInfo?.pageCover}`,
        slug: 'search/' + (keyword || ''),
        type: 'website'
      }
    case '/404':
      return {
        title: `${siteInfo?.title} | ${locale.NAV.PAGE_NOT_FOUND}`,
        image: `${siteInfo?.pageCover}`
      }
    case '/tag':
      return {
        title: `${locale.COMMON.TAGS} | ${siteInfo?.title}`,
        description: `${siteInfo?.description}`,
        image: `${siteInfo?.pageCover}`,
        slug: 'tag',
        type: 'website'
      }
    case '/category':
      return {
        title: `${locale.COMMON.CATEGORY} | ${siteInfo?.title}`,
        description: `${siteInfo?.description}`,
        image: `${siteInfo?.pageCover}`,
        slug: 'category',
        type: 'website'
      }
    default:
      return {
        title: post
          ? `${post?.title} | ${siteTitle}`
          : `${siteTitle} | loading`,
        description: post?.summary,
        type: post?.type,
        slug: post?.slug,
        image: post?.pageCoverThumbnail || `${siteInfo?.pageCover}`,
        category: Array.isArray(post?.category) ? post?.category?.[0] : post?.category,
        tags: post?.tags
      }
  }
}

export default SEO
