/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    // 底色
    body{
        background-color: #eeedee;
    }
    .dark body{
        background-color: black;
    }
    
    /* fukasawa的首页响应式分栏 */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: .5rem;
    }
    
    /* 大屏幕（宽度≥1024px）下显示3列 */
    @media (min-width: 1024px) {
        #theme-fukasawa .grid-container {
        column-count: 3;
        column-gap: .5rem;
        }
    }
    
    /* 小屏幕（宽度≥640px）下显示2列 */
    @media (min-width: 640px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
        column-count: 2;
        column-gap: .5rem;
        }
    }
    
    /* 移动端（宽度<640px）下显示1列 */
    @media (max-width: 639px) {
        #theme-fukasawa .grid-container {
        column-count: 1;
        column-gap: .5rem;
        }
    }

    .container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-gap: 10px;
            padding: 10px;
        }

    /* --- [新增] 全站文章图片画龙点睛补丁 --- */
    
    /* 针对 Notion 内容区图片的精准美化 */
    #notion-article img, 
    .notion-asset-wrapper img, 
    #article-wrapper img,
    .notion-image img {
      border-radius: 16px !important; 
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15) !important; 
      border: 1px solid rgba(0, 0, 0, 0.05) !important; 
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease !important;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    /* 鼠标悬停时的物理反馈 */
    #notion-article img:hover, 
    #article-wrapper img:hover,
    .notion-image img:hover {
      transform: translateY(-6px) scale(1.01) !important; 
      box-shadow: 0 25px 50px -15px rgba(0, 0, 0, 0.25) !important;
    }

    /* 深色模式下的适配 */
    .dark #notion-article img,
    .dark .notion-asset-wrapper img,
    .dark #article-wrapper img {
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 15px 45px -10px rgba(0, 0, 0, 0.6) !important;
    }

    .notion-image {
      overflow: visible !important;
    }

    /* --- 步骤 2：瀑布流卡片秩序感提升 --- */
    #theme-fukasawa main {
      line-height: 1.8 !important; 
      letter-spacing: 0.02em !important; 
      opacity: 0.8;
      font-size: 0.95rem;
    }

    /* --- 步骤 3：侧边栏“仪式感”美化（已移除全局模糊） --- */
    /* 仅针对侧边栏特定的背景做处理，不再使用会导致模糊的 backdrop-filter */
    .sideLeft .bg-gray-50 {
      background: rgba(255, 255, 255, 0.9) !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
    }

    .dark .sideLeft .dark\:bg-gray-900\/60 {
      background: rgba(15, 23, 42, 0.8) !important;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    /* 热门文章数字排名微浮雕效果 */
    .sideLeft ul li span.flex-shrink-0 {
      box-shadow: 0 2px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8);
      border: 1px solid rgba(0,0,0,0.03);
    }

    .dark .sideLeft ul li span.flex-shrink-0 {
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.05);
    }

  `}</style>
}

export { Style }
