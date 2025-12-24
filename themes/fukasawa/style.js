/* eslint-disable react/no-unknown-property */
/**
 * Fukasawa 主题专用样式
 * 包含响应式分栏逻辑与视觉美化
 */
const Style = () => {
  return <style jsx global>{`
    /* 基础底色美化 */
    body {
        background-color: #f6f6f6;
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
    .dark body {
        background-color: #111111;
    }
    
    /* 瀑布流/响应式分栏核心逻辑 */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: 1rem;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    /* 悬停微动效：卡片轻微浮起 */
    #theme-fukasawa .grid-item:hover {
        transform: translateY(-4px);
    }
    
    /* 大屏幕（宽度≥1024px）下显示 3 列 */
    @media (min-width: 1024px) {
        #theme-fukasawa .grid-container {
            column-count: 3;
            column-gap: 1rem;
        }
    }
    
    /* 中等屏幕（宽度介于 640px 到 1023px）下显示 2 列 */
    @media (min-width: 640px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
            column-count: 2;
            column-gap: 0.8rem;
        }
    }
    
    /* 移动端下显示 1 列 */
    @media (max-width: 639px) {
        #theme-fukasawa .grid-container {
            column-count: 1;
            column-gap: 0;
        }
    }

    /* 图片圆角与阴影美化 */
    #theme-fukasawa img {
        border-radius: 8px;
        box-shadow: 0 4px 20px -5px rgba(0,0,0,0.1);
    }

    .container {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-gap: 15px;
        padding: 15px;
    }
  `}</style>
}

export { Style }
