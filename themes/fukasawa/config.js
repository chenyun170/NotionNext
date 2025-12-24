import BLOG from '@/blog.config'

const CONFIG = {
  FUKASAWA_MAILCHIMP_FORM: false, // 邮件订阅表单

  FUKASAWA_POST_LIST_COVER: true, // 文章列表显示图片封面
  FUKASAWA_POST_LIST_COVER_FORCE: false, // 即使没有封面也将站点背景图设置为封面
  FUKASAWA_POST_LIST_PREVIEW: false, // 显示文章预览
  FUKASAWA_POST_LIST_ANIMATION: true, // 博客列表淡入动画

  // 菜单
  FUKASAWA_MENU_CATEGORY: true, // 显示分类
  FUKASAWA_MENU_TAG: true, // 显示标签
  FUKASAWA_MENU_ARCHIVE: true, // 显示归档

  FUKASAWA_SIDEBAR_COLLAPSE_BUTTON: true, // 侧边栏折叠按钮
  FUKASAWA_SIDEBAR_COLLAPSE_SATUS_DEFAULT: false, // 侧边栏默认折叠收起
  FUKASAWA_SIDEBAR_COLLAPSE_ON_SCROLL: false, // 侧边栏滚动时折叠 仅文章阅读页有效

  // -- 下方是新增的配置 --

  // 首页区块：推荐工具
  FUKASAWA_INDEX_TOOLS: [
    { icon: '🔍', name: '图灵搜', desc: '谷歌地图获客', link: '/links' },
    { icon: '📊', name: '海关数据', desc: '全球贸易数据', link: '/links' },
    { icon: '🤖', name: 'AI助手', desc: '智能邮件生成', link: '/links' },
    { icon: '💬', name: 'WhatsApp', desc: '客户直连工具', link: '/links' }
  ],

  // 首页区块：行动号召 (Call to Action)
  FUKASAWA_INDEX_CTA: {
    title: '准备好开始外贸获客了吗？',
    description: '加入 10,000+ 外贸人，使用我们的工具和方法，让客户开发变得更简单',
    primaryButton: { text: '免费领取资料包 🎁', url: '/links' },
    secondaryButton: { text: '了解更多', url: BLOG.LINK }
  }
}

export default CONFIG
