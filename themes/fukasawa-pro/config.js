// themes/fukasawa/config.js
// Fukasawa 主题配置文件

const CONFIG = {
  // ========== 基础配置 ==========
  
  // 侧边栏配置
  FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT: false, // 侧边栏默认是否折叠
  FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL: false,     // 滚动时自动折叠
  FUKASAWA_SIDEBAR_COLLAPSE_BUTTON: true,         // 显示折叠按钮
  
  // ========== 视觉升级配置 ==========
  
  // 启用增强样式
  ENABLE_ENHANCED_STYLES: true,
  
  // 启用动画效果
  ENABLE_ANIMATIONS: true,
  
  // Hero 区域配置
  HERO_SECTION: {
    ENABLE: true,                          // 是否启用 Hero 区域
    SHOW_STATS: true,                      // 显示数据统计
    STATS: {
      USERS: '10K+',
      DATA: '50M+',
      SATISFACTION: '98%'
    }
  },
  
  // 文章卡片配置
  ARTICLE_CARD: {
    DEFAULT_VARIANT: 'default',            // 默认样式：default, compact, featured
    SHOW_CATEGORY: true,                   // 显示分类
    SHOW_TAGS: true,                       // 显示标签
    SHOW_READ_TIME: true,                  // 显示阅读时间
    SHOW_VIEWS: true,                      // 显示浏览量
    HOT_BADGE_THRESHOLD: 3                 // 热门徽章阈值（前N名）
  },
  
  // 品牌色配置
  BRAND_COLORS: {
    PRIMARY: '#3B82F6',                    // 主色（蓝色）
    SECONDARY: '#F97316',                  // 辅色（橙色）
    ACCENT: '#10B981',                     // 强调色（绿色）
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444'
  },
  
  // 圆角配置
  BORDER_RADIUS: {
    SM: '6px',
    MD: '8px',
    LG: '12px',
    XL: '16px',
    XXL: '24px'
  },
  
  // ========== 功能配置 ==========
  
  // Trade Terminal 工具台
  TRADE_TERMINAL: {
    ENABLE: true,                          // 是否启用工具台
    SHOW_EXCHANGE_RATE: true,              // 显示汇率
    SHOW_CALCULATOR: true,                 // 显示算柜计算器
    SHOW_UNIT_CONVERTER: true,             // 显示单位换算
    SHOW_SEARCH: true,                     // 显示搜索
    SHOW_WHATSAPP: true,                   // 显示 WhatsApp 直连
    SHOW_WEATHER: true,                    // 显示天气
    SHOW_CLOCK: true                       // 显示全球时钟
  },
  
  // 活动营销配置
  ACTIVITY_BANNER: {
    ENABLE: true,                          // 是否启用活动横幅
    FLOATING: true,                        // 启用悬浮卡片
    AUTO_HIDE_ON_SCROLL: true,             // 滚动时自动隐藏
    ACTIVITIES: [
      {
        id: 'activity1',
        title: '活动一：图灵搜岁末活动',
        deadline: '2025-12-31T23:59:59+08:00',
        enabled: true
      },
      {
        id: 'activity2',
        title: '活动二：顶易云岁末活动',
        deadline: '2025-12-31T23:59:59+08:00',
        enabled: true
      }
    ]
  },
  
  // 侧边栏增强
  SIDEBAR_ENHANCEMENTS: {
    SHOW_RUNTIME: true,                    // 显示运行时间统计
    RUNTIME_START_DATE: '2024-05-01',      // 运行开始日期
    SHOW_TRENDING: true,                   // 显示热门文章
    TRENDING_COUNT: 5,                     // 热门文章数量
    SHOW_SEARCH: true,                     // 显示搜索框
    SHOW_MAILCHIMP: true,                  // 显示邮件订阅
    SHOW_SOCIAL: true                      // 显示社交链接
  },
  
  // 文章列表配置
  ARTICLE_LIST: {
    SHOW_PREVIEW: true,                    // 显示预览
    PREVIEW_LINES: 2,                      // 预览行数
    POSTS_PER_PAGE: 12,                    // 每页文章数
    LAYOUT: 'grid'                         // 布局方式：grid, list
  },
  
  // SEO 优化
  SEO: {
    TWITTER_CARD: true,                    // Twitter 卡片
    FACEBOOK_PAGE: '',                     // Facebook 页面
    FACEBOOK_APP_ID: '',                   // Facebook App ID
    GOOGLE_ANALYTICS_ID: '',               // Google Analytics
    GOOGLE_TAG_MANAGER_ID: ''              // Google Tag Manager
  },
  
  // 性能优化
  PERFORMANCE: {
    LAZY_LOAD_IMAGES: true,                // 图片懒加载
    PREFETCH_LINKS: true,                  // 链接预加载
    SERVICE_WORKER: false,                 // Service Worker
    CACHE_STRATEGY: 'stale-while-revalidate'
  },
  
  // 深色模式
  DARK_MODE: {
    DEFAULT_THEME: 'auto',                 // 默认主题：light, dark, auto
    STORAGE_KEY: 'theme',                  // LocalStorage 键名
    TRANSITION_DURATION: 300               // 过渡时间（毫秒）
  },
  
  // 移动端配置
  MOBILE: {
    BOTTOM_NAV: false,                     // 底部导航栏
    SWIPE_NAVIGATION: true,                // 滑动导航
    HIDE_HEADER_ON_SCROLL: false           // 滚动时隐藏头部
  },
  
  // 实验性功能
  EXPERIMENTAL: {
    PAGE_TRANSITIONS: false,               // 页面过渡动画
    VIRTUAL_SCROLL: false,                 // 虚拟滚动
    WEB_VITALS: false                      // Web Vitals 监控
  },
  
  // ========== 原有配置保持不变 ==========
  
  // 菜单配置
  MENU_CATEGORY: true,
  MENU_TAG: true,
  MENU_ARCHIVE: true,
  MENU_SEARCH: true,
  
  // 文章相关
  POST_SHARE_BAR_ENABLE: true,
  POST_ADJACENCY: true,
  POST_DISABLE_GALLERY: false,
  
  // 评论系统
  COMMENT_HIDE_SINGLE_TAB: false,
  
  // Widget
  WIDGET_PET: true,
  WIDGET_PET_LINK: '',
  WIDGET_PET_SWITCH_THEME: true,
  
  // 自定义样式
  CUSTOM_EXTERNAL_CSS: [
    '/styles/fukasawa/enhanced.css'        // 加载增强样式
  ],
  
  CUSTOM_EXTERNAL_JS: [],
  
  // 右侧悬浮按钮
  RIGHT_WIDGET_OPACITY: 0.8,
  RIGHT_FIXED_TOP: 80,
  RIGHT_FIXED_RIGHT: 30
}

export default CONFIG