/* eslint-disable react/no-unknown-property */
/**
 * Fukasawa 主题精致化客制化 CSS
 * 优化点：动画过渡、磨砂质感、侧边栏悬浮增强
 */
const Style = () => {
  return (<style jsx global>{`
    /* 1. 基础底色与顺滑滚动 */
    body {
        background-color: #f8f9fa; /* 更高级的冷灰色 */
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
    }
    .dark body {
        background-color: #0f172a; /* 深邃蓝黑而非纯黑 */
    }

    /* 2. 文本选中效果 */
    ::selection {
        background: rgba(210, 35, 42, 0.2);
        color: #D2232A;
    }

    /* 3. 侧边栏菜单精致化动画 (针对 AsideLeft.js) */
    .sideLeft :global(.menu-nav-wrapper nav a) {
        position: relative;
        transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
        overflow: hidden;
    }

    .sideLeft :global(.menu-nav-wrapper nav a:hover) {
        padding-left: 20px !important; /* 悬浮时平滑右移 */
        background: rgba(210, 35, 42, 0.05) !important;
        color: #D2232A !important;
    }

    /* 菜单左侧装饰条 */
    .sideLeft :global(.menu-nav-wrapper nav a::before) {
        content: "";
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 0;
        background: #D2232A;
        transition: height 0.3s ease;
        border-radius: 0 4px 4px 0;
    }

    .sideLeft :global(.menu-nav-wrapper nav a:hover::before) {
        height: 60%;
    }

    /* 4. 文章详情页内容美化 */
    #notion-article img {
        border-radius: 12px !important;
        box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.1) !important;
        transition: transform 0.3s ease !important;
    }
    
    #notion-article img:hover {
        transform: scale(1.01);
    }

    /* 5. 增强版自定义滚动条 */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }

    ::-webkit-scrollbar-track {
        background: transparent;
    }

    ::-webkit-scrollbar-thumb {
        background-color: rgba(210, 35, 42, 0.4);
        border-radius: 10px;
        border: 1px solid transparent;
        background-clip: content-box;
    }

    ::-webkit-scrollbar-thumb:hover {
        background-color: #D2232A;
    }

    /* 6. 产品介绍区域 (Brand Introduction) 优化 */
    #brand-introduction .notion {
        font-size: 1.25rem !important; /* 调整为更协调的比例 */
        line-height: 1.8;
        font-weight: 300;
        letter-spacing: 0.02em;
    }

    /* 7. 移除不需要的元素 */
    .tk-footer { display: none !important; }

    /* 解决全局磨砂滤镜失效问题 */
    * { 
        backdrop-filter: none !important; 
        -webkit-backdrop-filter: none !important; 
    }
  `}</style>)
}

export { Style }
