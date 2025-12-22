/* eslint-disable react/no-unknown-property */
import { useEffect } from 'react'

const Style = () => {
  useEffect(() => {
    // 自动侦测滚动淡入逻辑
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active')
        }
      })
    }, { threshold: 0.1 })

    const sections = document.querySelectorAll('#notion-article > div, .notion-image, .notion-text, .notion-quote, .notion-collection')
    sections.forEach(s => {
      s.classList.add('reveal-hidden')
      observer.observe(s)
    })
    return () => observer.disconnect()
  }, [])

  return <style jsx global>{`
    body { background-color: #eeedee; scroll-behavior: smooth; }
    .dark body { background-color: black; }
    
    /* 页面滚动淡入动画样式 */
    .reveal-hidden {
      opacity: 0;
      transform: translateY(25px);
      transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .reveal-active {
      opacity: 1;
      transform: translateY(0);
    }

    /* 文章图片美化 */
    #notion-article img, .notion-image img {
      border-radius: 16px !important;
      box-shadow: 0 12px 40px -12px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid rgba(0, 0, 0, 0.05) !important;
      transition: transform 0.4s ease !important;
    }
    #notion-article img:hover { transform: translateY(-5px) !important; }

    /* 彻底清除模糊滤镜 */
    * { backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }

    /* 瀑布流布局修正 */
    #theme-fukasawa .grid-item { break-inside: avoid-column; margin-bottom: 0.5rem; }
    @media (min-width: 1024px) { #theme-fukasawa .grid-container { column-count: 3; } }
  `}</style>
}
export { Style }
