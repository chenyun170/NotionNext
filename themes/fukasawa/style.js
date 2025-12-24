/* eslint-disable react/no-unknown-property */
/**
 * Fukasawa 主题专用样式优化版
 * 修复了注释语法，增强了图片可见性和卡片动效
 */
const Style = () => {
  return <style jsx global>{`
    /* 基础背景与平滑滚动 */
    body {
        background-color: #f6f6f6;
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
    }
    .dark body {
        background-color: #111111;
    }
    
    /* 瀑布流响应式布局核心 */
    #theme-fukasawa .grid-item {
        height: auto;
        break-inside: avoid-column;
        margin-bottom: 1.5rem;
        transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* 悬停微动效 */
    #theme-fukasawa .grid-item:hover {
        transform: translateY(-5px);
    }
    
    /* 响应式分栏逻辑 */
    @media (min-width: 1024px) {
        #theme-fukasawa .grid-container {
            column-count: 3;
            column-gap: 1.5rem;
        }
    }
    @media (min-width: 640px) and (max-width: 1023px) {
        #theme-fukasawa .grid-container {
            column-count: 2;
            column-gap: 1rem;
        }
    }
    @media (max-width: 639px) {
        #theme-fukasawa .grid-container {
            column-count: 1;
            column-gap: 0;
        }
    }

    /* 强制图片显示修复 */
    #theme-fukasawa img {
        border-radius: 8px;
        opacity: 1 !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
    }

    /* 文章摘要截断优化 */
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
  `}</style>
}

/* 必须使用命名导出，以匹配 index.js 中的 import { Style } */
export { Style } 
