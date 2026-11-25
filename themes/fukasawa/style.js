/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    :root {
        --fuka-bg: #f7f5f1;
        --fuka-dark-bg: #131210;
        --fuka-item-gap: 1.5rem;
        --fuka-transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    body,
    #theme-fukasawa,
    .main-wrapper,
    #wrapper {
        background-color: var(--fuka-bg);
        color: #1c1917;
        transition: background-color 0.25s ease, color 0.25s ease;
    }

    .dark body,
    .dark #theme-fukasawa,
    .dark .main-wrapper,
    .dark #wrapper,
    [data-theme='dark'] body {
        background-color: var(--fuka-dark-bg);
        color: #e7e5e4;
    }

    #theme-fukasawa {
        --fuka-bg: #f7f5f1;
        --fuka-surface: #ffffff;
        --fuka-surface-soft: #f5f3ef;
        --fuka-border: rgba(28, 25, 23, 0.08);
        --fuka-line: #e7e5e4;
        --fuka-track: #a8a29e;
        --fuka-text: #1c1917;
        --fuka-ink: #1c1917;
        --fuka-ink-soft: #292524;
        --fuka-muted: #6b635b;
        /* 品牌主色：深墨绿 */
        --fuka-accent: #1c5a4a;
        --fuka-accent-hover: #14453a;
        --fuka-accent-ink: #1c5a4a;
        --fuka-accent-ink-hover: #14453a;
        --fuka-accent-soft: #e8f0ec;
        --fuka-accent-line: #c3d6cd;
        --fuka-shadow: 0 1px 3px rgba(28, 25, 23, 0.04), 0 8px 24px rgba(28, 25, 23, 0.03);
        --fuka-title-font: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei UI', 'Noto Sans SC', sans-serif;
        --fuka-body-font: 'PingFang SC', -apple-system, BlinkMacSystemFont, 'Microsoft YaHei UI', 'Noto Sans SC', sans-serif;
    }

    .dark #theme-fukasawa {
        --fuka-bg: #131210;
        --fuka-surface: #1c1a17;
        --fuka-surface-soft: #24211d;
        --fuka-border: rgba(255, 255, 255, 0.08);
        --fuka-text: #f5f5f4;
        --fuka-muted: #a8a29e;
        --fuka-accent-ink: #6bc4a6;
        --fuka-accent-ink-hover: #8fd8bf;
        --fuka-accent-soft: rgba(28, 90, 74, 0.18);
        --fuka-accent-line: #2d6f5d;
    }

    #theme-fukasawa body,
    #theme-fukasawa {
        font-family: var(--fuka-body-font);
        font-feature-settings: "tnum";
    }

    #theme-fukasawa h1,
    #theme-fukasawa h2,
    #theme-fukasawa h3,
    #theme-fukasawa h4,
    #theme-fukasawa .notion-h {
        font-family: var(--fuka-title-font);
        letter-spacing: -0.015em;
    }

    /* 文章主体阅读宽度与排版 */
    #theme-fukasawa #article-wrapper #notion-article {
        max-width: 760px;
        line-height: 1.88;
    }

    #theme-fukasawa #article-wrapper img {
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(28, 25, 23, 0.06);
        border: 1px solid rgba(28, 25, 23, 0.06);
    }

    .dark #theme-fukasawa #article-wrapper img {
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
        border-color: rgba(255, 255, 255, 0.08);
    }

    /* 正文行内链接：墨绿识别色 */
    #theme-fukasawa #notion-article .notion-text a.notion-link,
    #theme-fukasawa #notion-article .notion-quote a.notion-link,
    #theme-fukasawa #notion-article .notion-toggle a.notion-link,
    #theme-fukasawa #notion-article .notion-callout a.notion-link {
        color: var(--fuka-accent-ink);
        text-decoration-color: rgba(28, 90, 74, 0.35);
    }

    #theme-fukasawa #notion-article .notion-text a.notion-link:hover,
    #theme-fukasawa #notion-article .notion-quote a.notion-link:hover {
        color: var(--fuka-accent-ink-hover);
        text-decoration-color: var(--fuka-accent-ink-hover);
    }

    /* 瀑布流与滚动列表兼容 */
    #theme-fukasawa .grid-container { column-fill: balance; }
    #theme-fukasawa .grid-item {
        display: inline-block;
        width: 100%;
        break-inside: avoid;
        margin-bottom: 1.5rem;
    }
    @media (min-width: 1024px) { #theme-fukasawa .grid-container { column-count: 3; } }
    @media (max-width: 767px) { #theme-fukasawa .grid-container { column-count: 1; } }

    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* 标签尺寸精修 */
    .tag-item-mini {
        padding: 4px 10px;
        font-size: 12px;
        min-height: 28px;
        line-height: 1.4;
        border-radius: 9999px;
    }

    #theme-fukasawa :focus-visible {
        outline: 2px solid var(--fuka-accent);
        outline-offset: 2px;
    }
  `}</style>
}

export { Style }
