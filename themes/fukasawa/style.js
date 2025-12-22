/* eslint-disable react/no-unknown-property */
const Style = () => {
  return <style jsx global>{`
    /* --- [新增] 页面滚动平滑淡入效果 --- */

    /* 定义淡入动画关键帧 */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px); /* 从下方30px处浮起 */
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* 针对文章内的段落、图片、组件应用动画 */
    #notion-article > div, 
    #article-wrapper > article > div,
    .notion-text, 
    .notion-image, 
    .notion-collection,
    .notion-quote {
      opacity: 0; /* 初始隐藏 */
      animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
      animation-play-state: paused; /* 默认暂停，待滚动到视口时激活（配合下方JS或简单的延迟） */
    }

    /* 简单的纯CSS方案：利用现有的滚动容器 */
    /* 如果不想写JS，可以直接给所有块级元素加一个简单的延迟进入 */
    #notion-article > div {
       opacity: 1;
       animation: fadeInUp 1s ease-out forwards;
    }

    /* --- 2. 极致平滑滚动补丁 --- */
    html {
      scroll-behavior: smooth; /* 强制全站平滑滚动，点击目录跳转时不会突兀 */
    }

    /* --- 3. 修正图片与阴影（保持之前的优良效果） --- */
    #notion-article img, .notion-image img {
      border-radius: 16px !important;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15) !important;
      transition: transform 0.4s ease, box-shadow 0.4s ease !important;
    }
  `}</style>
}
export { Style }
