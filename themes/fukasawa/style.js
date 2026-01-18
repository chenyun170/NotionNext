/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    :root {
        --fuka-bg: #f8f8f8;
        --fuka-dark-bg: #0d0d0d;
        --fuka-item-gap: 1.5rem;
        --fuka-transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* --- Logo 顺时针旋转终极补偿 --- */
    /* 针对左侧边栏中的图片进行过渡定义 */
    .sideLeft img, 
    img[alt="外贸获客情报局"] {
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important; /* 增加回弹感 */
        display: inline-block !important;
        transform-origin: center center;
    }

    /* 触发旋转逻辑：鼠标指向容器或图片本身 */
    .sideLeft:hover img,
    img[alt="外贸获客情报局"]:hover {
        transform: rotate(12deg) scale(1.05) !important; /* 旋转时微调放大，更有冲击力 */
    }

    /* --- 标签尺寸精修 (解决 WhatsApp找客户/海关数据 过大问题) --- */
    #theme-fukasawa .grid-item .flex-wrap a, 
    #article-wrapper .flex-nowrap a,
    .tag-item-mini {
        padding: 2px 6px !important;    /* 极简边距 */
        font-size: 10px !important;     /* 缩小字号 */
        min-width: fit-content !important; 
        line-height: 1.2 !important;
        border-radius: 4px !important;
        margin: 2px !important;
        display: inline-flex !important;
        align-items: center !important;
        background-color: rgba(0,0,0,0.03) !important;
        border: 1px solid rgba(0,0,0,0.05) !important;
    }

    /* --- 文章页图片立体倒角 --- */
    #theme-fukasawa .grid-item img,
    #article-wrapper img {
        border-radius: 16px !important; 
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
        transition: var(--fuka-transition) !important;
    }

    #theme-fukasawa .grid-item:hover img,
    #article-wrapper img:hover {
        transform: translateY(-4px); /* 图片悬停升起 */
        box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.15) !important;
    }

    /* 保持原有的瀑布流与装饰物锁定逻辑... */
    .sideLeft .festive-hat-fixed {
        width: 14px !important;
        pointer-events: none;
    }
  `}</style>
}

export { Style }
