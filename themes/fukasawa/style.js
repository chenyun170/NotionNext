/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    :root {
        --fuka-bg: #f8f8f8;
        --fuka-dark-bg: #0d0d0d;
        --fuka-item-gap: 1.5rem;
        --fuka-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* 💡 核心修复：多级容器暗色穿透 */
    body, 
    #theme-fukasawa, 
    .main-wrapper, 
    #container,
    #wrapper {
        background-color: var(--fuka-bg) !important;
        transition: background-color 0.3s ease;
    }

    /* 强制黑夜模式背景 */
    .dark body,
    .dark #theme-fukasawa,
    .dark .main-wrapper,
    .dark #container,
    .dark #wrapper,
    [data-theme='dark'] body {
        background-color: var(--fuka-dark-bg) !important;
        color: #d1d5db !important;
    }

    /* 首页列表卡片在暗色模式下的适配 */
    .dark .grid-item {
        background-color: #18181b !important;
        border: 1px solid #27272a !important;
    }

    /* --- 1. Logo 旋转逻辑 (保持原样) --- */
    .sideLeft img, 
    img[alt="外贸获客情报局"] {
        transition: transform 0.5s ease-in-out !important;
        display: inline-block !important;
    }
    .sideLeft:hover img,
    img[alt="外贸获客情报局"]:hover {
        transform: rotate(12deg) !important;
    }

    /* --- 2. 瀑布流与卡片效果 --- */
    #theme-fukasawa .grid-container { column-fill: balance; }
    #theme-fukasawa .grid-item {
        display: inline-block;
        width: 100%;
        break-inside: avoid;
        margin-bottom: var(--fuka-item-gap);
        transition: var(--fuka-transition);
    }
    #theme-fukasawa .grid-item:hover { transform: translateY(-6px); }

    /* --- 3. 图片立体倒角 (首页+详情页) --- */
    #theme-fukasawa .grid-item img,
    #article-wrapper img {
        border-radius: 16px !important; 
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        transition: all 0.3s ease !important;
        border: 1px solid rgba(0,0,0,0.05);
    }
    .dark #theme-fukasawa .grid-item img,
    .dark #article-wrapper img {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5) !important;
        border-color: rgba(255,255,255,0.1);
    }

    /* --- 4. 标签尺寸精修 (缩小海关数据等标签) --- */
    #article-wrapper .flex-nowrap a,
    .subpixel-antialiased .flex-nowrap a,
    .tag-item-mini {
        padding: 2px 8px !important;    
        font-size: 11px !important;     
        min-width: fit-content !important; 
        line-height: 1.4 !important;
        border-radius: 4px !important;   
    }

    /* --- 5. 响应式布局与锁定 --- */
    @media (min-width: 1024px) { #theme-fukasawa .grid-container { column-count: 3; } }
    @media (max-width: 767px) { #theme-fukasawa .grid-container { column-count: 1; } }

    .sideLeft .festive-hat-fixed { width: 14px !important; z-index: 50; pointer-events: none; }
    .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  `}</style>
}

export { Style }
