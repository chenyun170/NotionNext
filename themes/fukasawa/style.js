/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    body{ background-color: #eeedee; }
    .dark body{ background-color: black; }
    
    /* 文章图片：大圆角、深邃阴影、悬浮反馈 */
    #notion-article img, .notion-image img, #article-wrapper img {
      border-radius: 16px !important;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.2) !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      margin: 1.5rem 0;
    }
    #notion-article img:hover {
      transform: translateY(-8px) scale(1.01) !important;
      box-shadow: 0 25px 50px -15px rgba(0, 0, 0, 0.3) !important;
    }

    /* 布局修正：确保瀑布流整齐 */
    #theme-fukasawa .grid-item { break-inside: avoid-column; margin-bottom: 1rem; }
    @media (min-width: 1024px) { #theme-fukasawa .grid-container { column-count: 3; column-gap: 1rem; } }
    
    /* 彻底禁止磨砂效果对正文的干扰 */
    * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }
  `}</style>
}
export { Style }
