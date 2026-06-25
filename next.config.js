const { THEME } = require('./blog.config')
const fs = require('fs')
const path = require('path')
const BLOG = require('./blog.config')
const { extractLangPrefix } = require('./lib/utils/pageId')

// 打包时是否分析代码
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: BLOG.BUNDLE_ANALYZER
})

// 扫描项目 /themes下的目录名
const themes = scanSubdirectories(path.resolve(__dirname, 'themes'))
// 检测用户开启的多语言
const locales = (function () {
  // 根据BLOG_NOTION_PAGE_ID 检查支持多少种语言数据.
  // 支持如下格式配置多个语言的页面id xxx,zh:xxx,en:xxx
  const langs = [BLOG.LANG]
  if (BLOG.NOTION_PAGE_ID.indexOf(',') > 0) {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const prefix = extractLangPrefix(siteId)
      // 如果包含前缀 例如 zh , en 等
      if (prefix) {
        if (!langs.includes(prefix)) {
          langs.push(prefix)
        }
      }
    }
  }
  return langs
})()
const enableI18n = !process.env.EXPORT && locales.length > 1

/**
 * 扫描指定目录下的文件夹名，用于获取所有主题
 * @param {*} directory
 * @returns
 */
function scanSubdirectories(directory) {
  const subdirectories = []

  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file)
    const stats = fs.statSync(fullPath)
    if (stats.isDirectory()) {
      subdirectories.push(file)
    }

    // subdirectories.push(file)
  })

  return subdirectories
}

/**
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  output: process.env.EXPORT
    ? 'export'
    : process.env.NEXT_BUILD_STANDALONE === 'true'
      ? 'standalone'
      : undefined,
  staticPageGenerationTimeout: 120,

  // 性能优化配置
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // 构建优化
  swcMinify: true,
  modularizeImports: {
    '@heroicons/react/24/outline': {
      transform: '@heroicons/react/24/outline/{{member}}'
    },
    '@heroicons/react/24/solid': {
      transform: '@heroicons/react/24/solid/{{member}}'
    }
  },
  // 多语言站点才启用 Next i18n；单语言站点避免生成 /zh-CN 这类重复入口
  i18n: enableI18n
    ? {
        defaultLocale: BLOG.LANG,
        localeDetection: false,
        // 支持的所有多语言,按需填写即可
        locales: locales
      }
    : undefined,
  images: {
    // 图片压缩和格式优化
    formats: ['image/avif', 'image/webp'],
    // 图片尺寸优化
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 允许next/image加载的图片 域名
    domains: [
      'gravatar.com',
      'www.notion.so',
      'avatars.githubusercontent.com',
      'images.unsplash.com',
      'source.unsplash.com',
      'p1.qhimg.com',
      'webmention.io',
      'ko-fi.com',
      'cloudflare-imgbed-aa9.pages.dev'
    ],
    // 图片加载器优化
    loader: 'default',
    // 图片缓存优化
    minimumCacheTTL: 60 * 60 * 24 * 7, // 7天
    // 禁止通过 Next Image 优化代理 SVG，降低脚本型 SVG 风险
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
  },

  // 默认将feed重定向至 /public/rss/feed.xml
  redirects: process.env.EXPORT
    ? undefined
    : () => {
        const singleLocaleRedirects = locales.length <= 1
          ? [
              {
                source: `/${BLOG.LANG}`,
                destination: '/',
                permanent: true
              },
              {
                source: `/${BLOG.LANG}/:path*`,
                destination: '/:path*',
                permanent: true
              }
            ]
          : []

        return [
          ...singleLocaleRedirects,
          {
            source: '/feed',
            destination: '/rss/feed.xml',
            permanent: true
          },
          {
            source: '/about',
            destination: '/about.html',
            permanent: true
          },
          {
            source: '/oraskl',
            destination: '/oraskl.html',
            permanent: true
          },
          {
            source: '/free-customs-data',
            destination: '/free-customs-data.html',
            permanent: true
          },
          {
            source: '/us-importers',
            destination: '/us-importers.html',
            permanent: true
          },
          {
            source: '/hs-code-lookup',
            destination: '/hs-code-lookup.html',
            permanent: true
          },
          {
            source: '/supplier-analysis',
            destination: '/supplier-analysis.html',
            permanent: true
          },
          {
            source: '/customs-data-leads',
            destination: '/customs-data-leads.html',
            permanent: true
          },
          {
            source: '/customs-data-importers',
            destination: '/customs-data-importers.html',
            permanent: true
          },
          {
            source: '/customs-data-find-buyers',
            destination: '/customs-data-find-buyers.html',
            permanent: true
          },
          {
            source: '/customs-data-buyer-quality-example',
            destination: '/customs-data-buyer-quality-example.html',
            permanent: true
          },
          {
            source: '/hs-code-importer-case-study',
            destination: '/hs-code-importer-case-study.html',
            permanent: true
          },
          {
            source: '/turingsearch',
            destination: '/turingsearch.html',
            permanent: true
          },
          {
            source: '/turingsearch-foreign-trade-use-cases',
            destination: '/turingsearch-foreign-trade-use-cases.html',
            permanent: true
          },
          {
            source: '/dingyiyun',
            destination: '/dingyiyun.html',
            permanent: true
          },
          {
            source: '/dingyiyun-foreign-trade-workflow',
            destination: '/dingyiyun-foreign-trade-workflow.html',
            permanent: true
          },
          {
            source: '/dingyi',
            destination: '/dingyi.html',
            permanent: true
          },
          {
            source: '/foreign-trade-tools',
            destination: '/foreign-trade-tools.html',
            permanent: true
          },
          {
            source: '/foreign-trade-lead-tools',
            destination: '/foreign-trade-lead-tools.html',
            permanent: true
          },
          {
            source: '/turingsearch-vs-customs-data',
            destination: '/turingsearch-vs-customs-data.html',
            permanent: true
          },
          {
            source: '/dingyiyun-customs-data',
            destination: '/dingyiyun-customs-data.html',
            permanent: true
          },
          {
            source: '/foreign-trade-keyword-map',
            destination: '/foreign-trade-keyword-map.html',
            permanent: true
          },
          {
            source: '/methodology',
            destination: '/methodology.html',
            permanent: true
          },
          {
            source: '/data-sources-limitations',
            destination: '/data-sources-limitations.html',
            permanent: true
          }
        ]
      },
  // 重写url
  rewrites: process.env.EXPORT
    ? undefined
    : () => {
        // 处理多语言重定向
        const langsRewrites = []
        if (BLOG.NOTION_PAGE_ID.indexOf(',') > 0) {
          const siteIds = BLOG.NOTION_PAGE_ID.split(',')
          const langs = []
          for (let index = 0; index < siteIds.length; index++) {
            const siteId = siteIds[index]
            const prefix = extractLangPrefix(siteId)
            // 如果包含前缀 例如 zh , en 等
            if (prefix) {
              langs.push(prefix)
            }
            if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
              console.log('[Locales]', siteId)
            }
          }

          // 映射多语言
          // 示例： source: '/:locale(zh|en)/:path*' ; :locale() 会将语言放入重写后的 `?locale=` 中。
          langsRewrites.push(
            {
              source: `/:locale(${langs.join('|')})/:path*`,
              destination: '/:path*'
            },
            // 匹配没有路径的情况，例如 [domain]/zh 或 [domain]/en
            {
              source: `/:locale(${langs.join('|')})`,
              destination: '/'
            },
            // 匹配没有路径的情况，例如 [domain]/zh/ 或 [domain]/en/
            {
              source: `/:locale(${langs.join('|')})/`,
              destination: '/'
            }
          )
        }

        return langsRewrites
      },
  headers: process.env.EXPORT
    ? undefined
    : () => {
        return [
          {
            source: '/:path*{/}?',
            headers: [
              // 基础安全头，保持第三方插件兼容，不启用强 CSP
              { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
              { key: 'X-Content-Type-Options', value: 'nosniff' },
              { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
              { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
              { key: 'Access-Control-Allow-Credentials', value: 'false' },
              { key: 'Access-Control-Allow-Origin', value: BLOG.LINK || 'https://www.123170.xyz' },
              {
                key: 'Access-Control-Allow-Methods',
                value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT'
              },
              {
                key: 'Access-Control-Allow-Headers',
                value:
                  'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
              }
              // 安全头部 相关配置，谨慎开启
            //   { key: 'X-Frame-Options', value: 'DENY' },
            //   { key: 'X-Content-Type-Options', value: 'nosniff' },
            //   { key: 'X-XSS-Protection', value: '1; mode=block' },
            //   { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            //   { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
            //   {
            //     key: 'Strict-Transport-Security',
            //     value: 'max-age=31536000; includeSubDomains; preload'
            //   },
            //   {
            //     key: 'Content-Security-Policy',
            //     value: [
            //       "default-src 'self'",
            //       "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com *.gstatic.com *.google-analytics.com *.googletagmanager.com",
            //       "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com",
            //       "img-src 'self' data: blob: *.notion.so *.unsplash.com *.githubusercontent.com *.gravatar.com",
            //       "font-src 'self' *.googleapis.com *.gstatic.com",
            //       "connect-src 'self' *.google-analytics.com *.googletagmanager.com",
            //       "frame-src 'self' *.youtube.com *.vimeo.com",
            //       "object-src 'none'",
            //       "base-uri 'self'",
            //       "form-action 'self'"
            //     ].join('; ')
            //   },

            //   // CORS 配置（更严格）
            //   { key: 'Access-Control-Allow-Credentials', value: 'false' },
            //   {
            //     key: 'Access-Control-Allow-Origin',
            //     value: process.env.NODE_ENV === 'production'
            //       ? siteConfig('LINK') || 'https://yourdomain.com'
            //       : '*'
            //   },
            //   { key: 'Access-Control-Max-Age', value: '86400' }
            ]
          },
            //   {
            //     source: '/api/:path*',
            //     headers: [
            //       // API 特定的安全头部
            //       { key: 'X-Frame-Options', value: 'DENY' },
            //       { key: 'X-Content-Type-Options', value: 'nosniff' },
            //       { key: 'Cache-Control', value: 'no-store, max-age=0' },
            //       {
            //         key: 'Access-Control-Allow-Methods',
            //         value: 'GET,POST,PUT,DELETE,OPTIONS'
            //       }
            //     ]
            //   }
        ]
      },
  webpack: (config, { dev, isServer }) => {
    // 动态主题：添加 resolve.alias 配置，将动态路径映射到实际路径
    config.resolve.alias['@'] = path.resolve(__dirname)

    if (!isServer && process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log('[默认主题]', path.resolve(__dirname, 'themes', THEME))
    }
    config.resolve.alias['@theme-components'] = path.resolve(
      __dirname,
      'themes',
      THEME
    )

    // 性能优化配置
    if (!dev && !isServer) {
      // 生产环境优化
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }

    // Enable source maps in development mode
    if (dev || process.env.NODE_ENV_API === 'development') {
      // config.devtool = 'source-map'
      config.devtool = 'eval-source-map'
      // console.log('启动调试 nextjs.config.devtool ', config.devtool)
    }

    // 优化模块解析
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ]

    return config
  },
  experimental: {
    scrollRestoration: true,
    // 性能优化实验性功能
    optimizePackageImports: ['@heroicons/react', 'lodash']
  },
  publicRuntimeConfig: {
    // 这里的配置既可以服务端获取到，也可以在浏览器端获取到
    THEMES: themes
  }
}

module.exports = process.env.ANALYZE
  ? withBundleAnalyzer(nextConfig)
  : nextConfig
