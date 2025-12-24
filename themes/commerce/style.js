/* eslint-disable react/no-unknown-property */
/**
 * Fukasawa & Commerce 主题极致美化版
 * 升级点：磨砂滤镜回归、智能暗色系、交互动效层次感、品牌色渐变
 */
const Style = () => {
  return (<style jsx global>{`
    /* 1. 基础全局定义：更细腻的字体与平滑色彩切换 */
    :root {
      --brand-color: #D2232A;
      --brand-hover: #b01c22;
      --bg-light: #fbfbfd;
      --bg-dark: #09090b;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background-color: var(--bg-light);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      color: #1d1d1f;
      transition: background-color 0.5s ease;
    }

    .dark body {
      background-color: var(--bg-dark);
      color: #f5f5f7;
    }

    /* 2. 文本选中：品牌色半透明 */
    ::selection {
      background: rgba(210, 35, 42, 0.15);
      color: var(--brand-color);
    }

    /* 3. 侧边栏菜单精致化：增加流光效果 */
    .sideLeft :global(.menu-nav-wrapper nav a) {
      position: relative;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border-radius: 8px;
      margin: 2px 0;
    }

    .sideLeft :global(.menu-nav-wrapper nav a:hover) {
      padding-left: 24px !important;
      background: rgba(210, 35, 42, 0.08) !important;
      color: var(--brand-color) !important;
    }

    /* 侧边栏装饰条优化：改为垂直渐变 */
    .sideLeft :global(.menu-nav-wrapper nav a::before) {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 0;
      background: linear-gradient(to bottom, #ff5f6d, var(--brand-color));
      transition: height 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border-radius: 0 4px 4px 0;
    }

    .sideLeft :global(.menu-nav-wrapper nav a:hover::before) {
      height: 70%;
    }

    /* 4. 文章详情页：打造“印刷品”级质感 */
    #notion-article {
      line-height: 1.8;
      letter-spacing: 0.01em;
    }

    #notion-article img {
      border-radius: 16px !important;
      box-shadow: 0 20px 40px rgba(0,0,0,0.08) !important;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) !important;
      border: 1px solid rgba(0,0,0,0.03);
    }

    #notion-article img:hover {
      transform: translateY(-5px) scale(1.005);
      box-shadow: 0 30px 60px rgba(0,0,0,0.12) !important;
    }

    /* 文章引用块美化 */
    #notion-article blockquote {
      border-left: 4px solid var(--brand-color) !important;
      background: rgba(210, 35, 42, 0.03);
      padding: 1rem 1.5rem !important;
      border-radius: 0 12px 12px 0;
      font-style: italic;
    }

    /* 5. 极简滚动条：仅在桌面端显示 */
    @media (min-width: 768px) {
      ::-webkit-scrollbar {
        width: 8px;
      }
      ::-webkit-scrollbar-track {
        background: transparent;
      }
      ::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.1);
        border-radius: 20px;
        border: 2px solid transparent;
        background-clip: content-box;
      }
      .dark ::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.1);
      }
      ::-webkit-scrollbar-thumb:hover {
        background-color: var(--brand-color);
      }
    }

    /* 6. 开启全局磨砂感 (Glassmorphism) */
    .backdrop-blur {
      backdrop-filter: blur(12px) saturate(180%) !important;
      -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
    }

    /* 7. 产品介绍与卡片增强 */
    #brand-introduction {
      position: relative;
      overflow: hidden;
    }

    #brand-introduction::after {
      content: "";
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(210,35,42,0.03) 0%, transparent 70%);
      pointer-events: none;
    }

    #brand-introduction .notion {
      font-size: 1.15rem !important;
      font-weight: 400;
      color: #3a3a3c;
    }

    .dark #brand-introduction .notion {
      color: #d1d1d6;
    }

    /* 8. 阴影平滑处理 */
    .shadow-xl {
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02) !important;
    }

    /* 9. 移除干扰元素 */
    .tk-footer, .ad-wrapper { display: none !important; }

    /* 全局过渡动效 */
    * {
      transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 200ms;
    }
  `}</style>)
}

export { Style }
