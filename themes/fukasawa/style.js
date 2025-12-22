/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    /* 1. 强制关闭所有磨砂/模糊滤镜，确保文字锐利 */
    * {
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
    }

    /* 2. 优化文章正文清晰度 */
    #notion-article, .notion-text {
        color: #000 !important; /* 强制黑色文字 */
        opacity: 1 !important;   /* 强制不透明 */
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
    }

    /* 3. 修正背景色，防止背景太暗导致文字发虚 */
    body {
        background-color: #f8fafc !important;
    }
    .dark body {
        background-color: #0f172a !important;
    }

    /* 4. 瀑布流卡片阴影微调 */
    #theme-fukasawa .grid-item {
        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
        border-radius: 8px;
    }
  `}</style>
}
export { Style }
