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

    /* 图片保护 */
    #theme-fukasawa .grid-item img {
        border-radius: 10px;
        opacity: 1 !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
    }

    /* 侧边栏/装饰物锁定 */
    .sideLeft img {
        width: auto !important;
        max-width: fit-content !important;
        border-radius: 0 !important;
        box-shadow: none !important;
    }

    .sideLeft .festive-hat-fixed {
        width: 14px !important;
        height: auto !important;
        z-index: 50;
        pointer-events: none; /* 防止遮挡下方Logo点击 */
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
