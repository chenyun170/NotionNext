/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    :root {
        --fuka-bg: #f8f8f8;
        --fuka-dark-bg: #0d0d0d;
        --fuka-item-gap: 1.5rem;
        --fuka-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    body {
        background-color: var(--fuka-bg);
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        transition: background-color 0.3s ease;
    }

    .dark body {
        background-color: var(--fuka-dark-bg);
    }

    /* 瀑布流优化 */
    #theme-fukasawa .grid-container {
        column-fill: balance;
    }

    #theme-fukasawa .grid-item {
        display: inline-block; /* 核心修复：防止内容跨列截断 */
        width: 100%;
        height: auto;
        break-inside: avoid;
        margin-bottom: var(--fuka-item-gap);
        transition: var(--fuka-transition);
        will-change: transform;
    }

    #theme-fukasawa .grid-item:hover {
        transform: translateY(-6px);
    }

    /* 响应式断点精修 */
    @media (min-width: 1536px) { #theme-fukasawa .grid-container { column-count: 4; column-gap: var(--fuka-item-gap); } }
    @media (min-width: 1024px) and (max-width: 1535px) { #theme-fukasawa .grid-container { column-count: 3; column-gap: var(--fuka-item-gap); } }
    @media (min-width: 768px) and (max-width: 1023px) { #theme-fukasawa .grid-container { column-count: 2; column-gap: 1rem; } }
    @media (max-width: 767px) { #theme-fukasawa .grid-container { column-count: 1; column-gap: 0; } }

    /* 图片保护与立体倒角增强 */
    #theme-fukasawa .grid-item img,
    #article-wrapper img {
        border-radius: 16px !important; 
        opacity: 1 !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important;
        transition: all 0.3s ease !important;
        border: 1px solid rgba(0,0,0,0.05);
    }

    #theme-fukasawa .grid-item:hover img,
    #article-wrapper img:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important;
    }

    .dark #theme-fukasawa .grid-item img,
    .dark #article-wrapper img {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5) !important;
        border-color: rgba(255,255,255,0.1);
    }

    /* 💡 标签项 (TagItemMini) 尺寸精修 - 解决“whatsapp找客户”等显示过大的问题 */
    #article-wrapper .flex-nowrap a,
    .subpixel-antialiased .flex-nowrap a,
    .tag-item-mini {
        padding: 2px 8px !important;    /* 缩小上下左右边距 */
        font-size: 11px !important;     /* 减小字体大小 */
        min-width: fit-content !important; /* 防止固定宽度撑大 */
        height: auto !important;
        line-height: 1.4 !important;
        border-radius: 4px !important;   /* 配合小尺寸使用更小的倒角 */
        margin: 2px !important;         /* 标签之间的间距 */
        display: inline-flex !important;
        align-items: center !important;
    }

    /* 侧边栏/装饰物锁定 (保持原样) */
    .sideLeft img {
        width: auto !important;
        max-width: fit-content !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        transform: none !important;
    }

    .sideLeft .festive-hat-fixed {
        width: 14px !important;
        height: auto !important;
        z-index: 50;
        pointer-events: none; 
    }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
  `}</style>
}

export { Style }
