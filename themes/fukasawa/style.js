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
      border-radius: 16px !important; /* 强制大圆角 */
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15) !important; /* 柔和深邃阴影 */
      border: 1px solid rgba(0, 0, 0, 0.05) !important; /* 极其细微的边框，增加质感 */
      transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease !important;
      margin-top: 1rem;
      margin-bottom: 1rem;
    }

    /* 鼠标悬停时的物理反馈：微微浮起并增强阴影 */
    #notion-article img:hover, 
    #article-wrapper img:hover,
    .notion-image img:hover {
      transform: translateY(-6px) scale(1.01) !important; 
      box-shadow: 0 25px 50px -15px rgba(0, 0, 0, 0.25) !important;
    }

    /* 深色模式下的阴影与边框适配，防止发灰 */
    .dark #notion-article img,
    .dark .notion-asset-wrapper img,
    .dark #article-wrapper img {
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      box-shadow: 0 15px 45px -10px rgba(0, 0, 0, 0.6) !important;
    }

    /* 解决 Notion Gallery 视图等可能出现的图片裁切问题 */
    .notion-image {
      overflow: visible !important;
    }

  `}</style>
}

export { Style }
