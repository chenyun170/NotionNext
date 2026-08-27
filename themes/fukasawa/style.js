/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    :root {
        --fuka-bg: #f7f5f1;
        --fuka-dark-bg: #161412;
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

    /* 方案 A：黑白灰为主，琥珀橙只承担交互强调 */
    #theme-fukasawa {
        --fuka-bg: #f7f5f1;
        --fuka-surface: #ffffff;
        --fuka-surface-soft: #f5f5f4;
        --fuka-border: #ebe7e2;
        --fuka-line: #e7e5e4;
        --fuka-track: #a8a29e;
        --fuka-text: #1c1917;
        --fuka-ink: #1c1917;
        --fuka-ink-soft: #292524;
        --fuka-muted: #78716c;
        --fuka-orange: #d97706;
        --fuka-accent: #d97706;
        --fuka-accent-hover: #b45309;
        --fuka-shadow: 0 1px 2px rgba(23, 23, 23, 0.06);
        --fuka-title-font: 'PingFang SC', 'Noto Serif SC', 'Songti SC', SimSun, serif;
        --fuka-body-font: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
    }
    #theme-fukasawa .bg-\[\#faf6f0\] { background-color: var(--fuka-bg) !important; }
    #theme-fukasawa .bg-white { background-color: var(--fuka-surface) !important; }
    #theme-fukasawa .text-stone-900,
    #theme-fukasawa .text-stone-950 { color: var(--fuka-text) !important; }
    #theme-fukasawa .text-stone-500,
    #theme-fukasawa .text-stone-600,
    #theme-fukasawa .text-stone-700 { color: var(--fuka-muted) !important; }
    #theme-fukasawa [class*='border-stone-'] { border-color: var(--fuka-border) !important; }
    #theme-fukasawa [class*='text-blue-'],
    #theme-fukasawa [class*='text-green-'],
    #theme-fukasawa [class*='text-purple-'],
    #theme-fukasawa [class*='text-pink-'],
    #theme-fukasawa [class*='text-cyan-'],
    #theme-fukasawa [class*='text-teal-'],
    #theme-fukasawa [class*='text-emerald-'],
    #theme-fukasawa [class*='text-rose-'],
    #theme-fukasawa [class*='text-red-'],
    #theme-fukasawa [class*='text-indigo-'],
    #theme-fukasawa [class*='text-violet-'] { color: var(--fuka-muted) !important; }
    #theme-fukasawa [class*='bg-blue-'],
    #theme-fukasawa [class*='bg-green-'],
    #theme-fukasawa [class*='bg-purple-'],
    #theme-fukasawa [class*='bg-pink-'],
    #theme-fukasawa [class*='bg-cyan-'],
    #theme-fukasawa [class*='bg-teal-'],
    #theme-fukasawa [class*='bg-emerald-'],
    #theme-fukasawa [class*='bg-rose-'],
    #theme-fukasawa [class*='bg-red-'],
    #theme-fukasawa [class*='bg-indigo-'],
    #theme-fukasawa [class*='bg-violet-'] { background-color: #f5f5f5 !important; }
    #theme-fukasawa [class*='hover:text-blue-']:hover,
    #theme-fukasawa [class*='hover:text-green-']:hover,
    #theme-fukasawa [class*='hover:text-purple-']:hover,
    #theme-fukasawa [class*='hover:text-pink-']:hover,
    #theme-fukasawa [class*='hover:text-cyan-']:hover,
    #theme-fukasawa [class*='hover:text-teal-']:hover,
    #theme-fukasawa [class*='hover:text-violet-']:hover { color: #1c1917 !important; }
    #theme-fukasawa [class*='hover:bg-blue-']:hover,
    #theme-fukasawa [class*='hover:bg-green-']:hover,
    #theme-fukasawa [class*='hover:bg-purple-']:hover,
    #theme-fukasawa [class*='hover:bg-pink-']:hover,
    #theme-fukasawa [class*='hover:bg-cyan-']:hover,
    #theme-fukasawa [class*='hover:bg-teal-']:hover,
    #theme-fukasawa [class*='hover:bg-violet-']:hover {
        background-color: #292524 !important;
        color: #ffffff !important;
    }
    #theme-fukasawa .notion-red_background,
    #theme-fukasawa .notion-pink_background,
    #theme-fukasawa .notion-blue_background,
    #theme-fukasawa .notion-purple_background,
    #theme-fukasawa .notion-teal_background,
    #theme-fukasawa .notion-green_background,
    #theme-fukasawa .notion-orange_background,
    #theme-fukasawa .notion-yellow_background { background-color: #f5f5f5 !important; }
    .dark #theme-fukasawa .bg-white { background-color: #1a1a1a !important; }
    .dark #theme-fukasawa .text-stone-900,
    .dark #theme-fukasawa .text-stone-950 { color: #f5f5f5 !important; }
    .dark #theme-fukasawa .text-stone-500,
    .dark #theme-fukasawa .text-stone-600,
    .dark #theme-fukasawa .text-stone-700 { color: #a3a3a3 !important; }
    .dark #theme-fukasawa [class*='border-stone-'] { border-color: #2a2a2a !important; }
    .dark #theme-fukasawa [class*='bg-orange-'] { background-color: #292524 !important; }
    .dark #theme-fukasawa [class*='bg-blue-'],
    .dark #theme-fukasawa [class*='bg-green-'],
    .dark #theme-fukasawa [class*='bg-purple-'],
    .dark #theme-fukasawa [class*='bg-pink-'],
    .dark #theme-fukasawa [class*='bg-cyan-'],
    .dark #theme-fukasawa [class*='bg-teal-'],
    .dark #theme-fukasawa [class*='bg-emerald-'],
    .dark #theme-fukasawa [class*='bg-rose-'],
    .dark #theme-fukasawa [class*='bg-red-'],
    .dark #theme-fukasawa [class*='bg-indigo-'],
    .dark #theme-fukasawa [class*='bg-violet-'] { background-color: #222222 !important; }

    /* 橙色只保留在右侧边栏；其他区域统一降为墨灰 */
    #theme-fukasawa [class*='text-orange-'] { color: #78716c !important; }
    #theme-fukasawa [class*='hover:text-orange-']:hover { color: #1c1917 !important; }
    #theme-fukasawa [class*='bg-orange-'] { background-color: #292524 !important; }
    #theme-fukasawa [class*='hover:bg-orange-']:hover { background-color: #1c1917 !important; }
    #theme-fukasawa [class*='border-orange-'] { border-color: #e7e5e2 !important; }
    #theme-fukasawa [class*='hover:border-orange-']:hover { border-color: #a8a29e !important; }
    #theme-fukasawa [class*='shadow-orange-'] { box-shadow: none !important; text-shadow: none !important; }
    #theme-fukasawa [class*='ring-orange-'] { --tw-ring-color: #e7e5e2 !important; }

    /* 侧边栏重新点亮铜橙 */
    #theme-fukasawa .sideLeft [class*='text-orange-'] { color: var(--fuka-orange) !important; }
    #theme-fukasawa .sideLeft [class*='hover:text-orange-']:hover { color: var(--fuka-orange) !important; }
    #theme-fukasawa .sideLeft [class*='bg-orange-'] { background-color: var(--fuka-orange) !important; }
    #theme-fukasawa .sideLeft [class*='hover:bg-orange-']:hover { background-color: #b45309 !important; }
    #theme-fukasawa .sideLeft [class*='border-orange-'] { border-color: var(--fuka-orange) !important; }
    #theme-fukasawa .sideLeft [class*='hover:border-orange-']:hover { border-color: #b45309 !important; }
    #theme-fukasawa .sideLeft [class*='shadow-orange-'] { box-shadow: 0 0 0 1px rgba(217,119,6,0.18) !important; }

    /* 编辑部式排版：减少组件感，强化留白、细线和文字层级 */
    #theme-fukasawa [class*="rounded-2xl"],
    #theme-fukasawa [class*="rounded-xl"] { border-radius: 4px !important; }
    #theme-fukasawa [class*="shadow-lg"],
    #theme-fukasawa [class*="shadow-xl"],
    #theme-fukasawa [class*="shadow-2xl"] { box-shadow: 0 1px 2px rgba(17,24,39,0.04) !important; }
    #theme-fukasawa .grid-item { border-bottom: 1px solid #e5e5e5; padding-bottom: 1.25rem; }
    #theme-fukasawa .grid-item:hover { transform: translateY(-2px); }
    #theme-fukasawa .grid-item img,
    #theme-fukasawa #article-wrapper img { border-radius: 6px !important; box-shadow: 0 1px 2px rgba(17,24,39,0.08) !important; }
    #theme-fukasawa [class*="bg-gradient"] { background-image: none !important; }
    #theme-fukasawa .sideLeft section { border-radius: 4px !important; box-shadow: none !important; }
    #theme-fukasawa #sticky-nav { box-shadow: none !important; background: rgba(255,255,255,0.94) !important; }
    .dark #theme-fukasawa #sticky-nav { background: rgba(17,17,17,0.94) !important; }
    #theme-fukasawa #article-wrapper #notion-article { max-width: 760px; }
   #theme-fukasawa #article-wrapper .notion-h { letter-spacing: -0.02em; }

    /* 第二轮收敛：让首页和侧栏更像编辑部，而不是仪表盘 */
    #theme-fukasawa .sidebar-secondary-module,
    #theme-fukasawa .sidebar-runtime { display: none !important; }
    #theme-fukasawa .sideLeft > div { padding-top: 2.5rem !important; }
    #theme-fukasawa #posts-wrapper { gap: 0 3.5rem !important; }
    #theme-fukasawa #posts-wrapper article { margin: 0 !important; }
    #theme-fukasawa #posts-wrapper article img { aspect-ratio: 3 / 2; filter: saturate(0.88); }
    /* --- 第三轮排版：标题走衬线、正文走无衬线，弱化卡片感 --- */
    #theme-fukasawa body { font-family: var(--fuka-body-font); }
    #theme-fukasawa h1,
    #theme-fukasawa h2,
    #theme-fukasawa h3,
    #theme-fukasawa h4,
    #theme-fukasawa .notion-h {
      font-family: var(--fuka-title-font);
      letter-spacing: -0.015em;
    }
    #theme-fukasawa #article-wrapper #notion-article { line-height: 1.9; }
    #theme-fukasawa #article-wrapper .notion-text { letter-spacing: 0; }
    #theme-fukasawa [class*="shadow-lg"],
    #theme-fukasawa [class*="shadow-xl"],
    #theme-fukasawa [class*="shadow-2xl"] {
      box-shadow: var(--fuka-shadow) !important;
    }
    #theme-fukasawa :focus-visible {
      outline: 2px solid var(--fuka-track);
      outline-offset: 3px;
    }
    #theme-fukasawa .home-intro { border-width: 1px !important; }
    #theme-fukasawa .home-intro .home-diagnosis { border: 0 !important; background: transparent !important; padding: 0 !important; }
    #theme-fukasawa .home-intro .home-signal-panel { border: 0 !important; border-left: 1px solid #d4d4d4 !important; border-radius: 0 !important; background: transparent !important; }
    #theme-fukasawa .home-intro > div:first-child { padding-top: 1.5rem !important; padding-bottom: 1.5rem !important; }
    #theme-fukasawa .home-intro > div:last-child a { min-height: 96px !important; padding: 1rem 0 !important; }
    #theme-fukasawa .floating-activity-card { width: min(18rem, calc(100vw - 2rem)) !important; right: 1rem !important; }
    #theme-fukasawa .floating-activity-card > div { border-radius: 4px !important; box-shadow: 0 12px 30px rgba(23,23,23,0.18) !important; }
    #theme-fukasawa .animate-pulse-orange { animation: none !important; }
    @media (max-width: 767px) {
      #theme-fukasawa #posts-wrapper { display: block !important; }
      #theme-fukasawa #posts-wrapper > div { margin-bottom: 0 !important; }
      #theme-fukasawa .home-intro .home-signal-panel { border-left: 0 !important; border-top: 1px solid #d4d4d4 !important; margin-top: 1.5rem; padding-top: 1.5rem; }
      #theme-fukasawa .floating-activity-card { bottom: 6rem !important; }
    }
  `}</style>
}

export { Style }