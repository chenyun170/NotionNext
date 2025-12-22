/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    // 背景底色
    body{ background-color: #eeedee; }
    .dark body{ background-color: black; }
    
    // 恢复文章图片美化：圆角与阴影
    #notion-article img, .notion-image img, #article-wrapper img {
      border-radius: 16px !important;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      transition: transform 0.4s ease !important;
      margin: 1rem 0;
    }
    #notion-article img:hover {
      transform: translateY(-5px) !important;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.25) !important;
    }

    // 强制清除所有可能导致模糊的滤镜
    * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

    // 瀑布流布局修正
    #theme-fukasawa .grid-container {
      column-gap: .5rem;
    }
    #theme-fukasawa .grid-item {
      break-inside: avoid-column;
      margin-bottom: .5rem;
    }
    @media (min-width: 1024px) { #theme-fukasawa .grid-container { column-count: 3; } }
    @media (min-width: 640px) and (max-width: 1023px) { #theme-fukasawa .grid-container { column-count: 2; } }
  `}</style>
}
export { Style }
