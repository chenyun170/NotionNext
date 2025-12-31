'use client'

import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Announcement from './Announcement'
import Catalog from './Catalog'
import Logo from './Logo'
import MailChimpForm from './MailChimpForm'
import { MenuList } from './MenuList'
import SearchInput from './SearchInput'
import SocialButton from './SocialButton'
import SidebarTools from './SidebarTools'

// ========== 烟花组件 ==========
const Fireworks = ({ isVisible }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    let particles = []
    let animationId

    class Particle {
      constructor(x, y) {
        this.x = x
        this.y = y
        this.vx = (Math.random() - 0.5) * 8
        this.vy = (Math.random() - 0.5) * 8 - 2
        this.life = 1
        this.size = Math.random() * 3 + 2
        
        const colors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6B9D', '#FFA500']
        this.color = colors[Math.floor(Math.random() * colors.length)]
      }

      update() {
        this.x += this.vx
        this.y += this.vy
        this.vy += 0.1
        this.life -= 0.015
      }

      draw() {
        ctx.save()
        ctx.globalAlpha = this.life
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
    }

    const createExplosion = (x, y) => {
      for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y))
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, idx) => {
        p.update()
        p.draw()
        if (p.life <= 0) particles.splice(idx, 1)
      })

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate)
      }
    }

    const fireworkInterval = setInterval(() => {
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height * 0.6
      createExplosion(x, y)
    }, 400)

    animate()

    return () => {
      clearInterval(fireworkInterval)
      cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  )
}

function AsideLeft(props) {
  const { post, notice, latestPosts = [] } = props
  const [runtime, setRuntime] = useState('')
  const [isCollapsed, setIsCollapse] = useState(false)
  const [showFireworks, setShowFireworks] = useState(false)

  // 圣诞氛围逻辑
  const now = new Date()
  const month = now.getMonth() + 1
  const showFestive = month >= 11 || month <= 2

  useEffect(() => {
    setIsCollapse(localStorage.getItem('fukasawa-sidebar-collapse') === 'true')
    const timer = setInterval(() => {
      const diff = Date.now() - new Date('2024-05-01').getTime()
      if (diff < 0) return
      setRuntime(`${Math.floor(diff / 86400000)}天 ${Math.floor((diff % 86400000) / 3600000)}时`)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 检查是否显示喜迎2026烟花
  useEffect(() => {
    const checkNewYear = () => {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const date = now.getDate()

      // 2026-01-01 至 2026-01-03 显示
      const isNewYearPeriod = 
        (year === 2026 && month === 1 && date <= 3)

      setShowFireworks(isNewYearPeriod)
    }

    checkNewYear()

    // 每小时检查一次
    const timer = setInterval(checkNewYear, 3600000)

    return () => clearInterval(timer)
  }, [])

  const toggleCollapse = () => {
    const next = !isCollapsed
    setIsCollapse(next)
    localStorage.setItem('fukasawa-sidebar-collapse', String(next))
  }

  const isReverse = siteConfig('LAYOUT_SIDEBAR_REVERSE')
  const btnPosition = isCollapsed 
    ? (isReverse ? 'right-4' : 'left-4') 
    : (isReverse ? 'right-[18.5rem]' : 'left-[18.5rem]')

  return (
    <div className="flex">
      {/* 1. 折叠按钮 */}
      <button
        onClick={toggleCollapse}
        className={`${btnPosition} fixed top-6 z-50 p-2.5 rounded-xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-lg border border-gray-200 dark:border-zinc-700 transition-all duration-500 hover:scale-110 active:scale-95 group`}
      >
        <i className={`fa-solid ${isCollapsed ? 'fa-indent text-blue-500' : 'fa-chevron-left text-gray-400'} text-sm group-hover:text-blue-500 transition-colors`}></i>
      </button>

      {/* 2. 侧边栏主体 */}
      <div className={`sideLeft relative ${isCollapsed ? 'w-0' : 'w-80'} duration-500 transition-all bg-white dark:bg-[#09090b] min-h-screen hidden lg:block z-30 border-r border-gray-100 dark:border-zinc-900 shadow-2xl`}>
        <div className={`h-full no-scrollbar overflow-y-auto flex flex-col transition-all duration-500 ${isCollapsed ? 'opacity-0 invisible' : 'opacity-100 px-8 py-10'}`}>

          {/* Logo 区域 */}
          <div className="flex flex-col items-start px-1 overflow-visible mb-10">
            <div className="relative overflow-visible" style={{ width: '140px', minWidth: '140px' }}>
              <div className="relative z-10 transition-transform hover:scale-105 duration-300">
                 <Logo {...props} />
              </div>

              {/* 喜迎 2026 烟花效果 */}
              {showFireworks && (
                <div className="absolute -top-12 right-0 z-20 pointer-events-none w-48 h-32">
                  {/* 烟花 Canvas */}
                  <Fireworks isVisible={showFireworks} />

                  {/* 喜迎 2026 文字 */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center z-30">
                    <div className="text-sm font-black bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent drop-shadow-lg animate-bounce">
                      喜迎2026
                    </div>
                    <div className="text-xs text-red-600 font-bold mt-0.5 drop-shadow-md animate-pulse">
                      新年快乐
                    </div>
                  </div>
                </div>
              )}
              
              {/* 圣诞装饰 */}
              {showFestive && (
                <>
                  <img
                    src="https://cloudflare-imgbed-aa9.pages.dev/file/1766591515499_hat.png"
                    className="festive-hat-fixed"
                    style={{ 
                        position: 'absolute',
                        top: '-29px', 
                        left: '5px', 
                        width: '65px !important', 
                        maxWidth: '65px !important',
                        zIndex: 100,
                        pointerEvents: 'none',
                        display: 'block',
                        mixBlendMode: 'multiply',
                        filter: 'contrast(110%) brightness(105%)'
                    }}
                    alt="Christmas Hat"
                  />
                  <div className="absolute top-0 left-0 w-full h-12 pointer-events-none overflow-visible" style={{ zIndex: 120 }}>
                    <span className="snowflake-anim text-[10px] absolute left-1">❄</span>
                    <span className="snowflake-anim text-[8px] absolute left-6" style={{animationDelay:'1.5s'}}>❅</span>
                  </div>
                </>
              )}
            </div>
            <section className="siteInfo relative pl-3 border-l-2 border-zinc-200 dark:border-zinc-800 mt-5 font-light text-[11px] italic text-zinc-400 leading-relaxed opacity-80">
              {siteConfig('DESCRIPTION')}
            </section>
          </div>

          {/* ================= 活动公告：静态图标版本 ================= */}
          <div className="marquee-border-container mb-10 p-[2px] rounded-2xl overflow-hidden relative shadow-sm">
             <div className="relative z-10 bg-[#fffcf5] dark:bg-[#1a1610] rounded-2xl p-4">
                <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 tracking-[0.2em] uppercase mb-3 px-1">
                  {/* 这里：删除了 animate-bounce，确保图标静止在左侧 */}
                  <i className="fas fa-bullhorn mr-2 opacity-80"></i>
                  <span>活动公告 / SPECIAL EVENTS</span>
                </div>
                <Announcement post={notice} />
             </div>
          </div>

          {/* 工具台 */}
          <section className="mb-10">
            <div className="flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 tracking-[0.2em] uppercase mb-5 px-1">
              <i className="fas fa-terminal mr-2 opacity-50 animate-pulse"></i>
              <span>Trade Terminal</span>
            </div>
            <SidebarTools />
          </section>

          {/* 搜索 */}
          <section className="mb-8">
            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <SearchInput {...props} />
            </div>
          </section>

          {/* 菜单 */}
          <section className="flex flex-col mb-10">
            <MenuList {...props} />
          </section>

          {/* 热门 - 升级版 */}
          {latestPosts?.length > 0 && (
            <section className="flex flex-col mb-10">
              <div className="flex items-center text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase mb-6 px-1">
                <i className="fas fa-fire-alt mr-2 text-orange-500 opacity-50"></i>
                <span>Trending Now</span>
              </div>
              <ul className="space-y-3">
                {latestPosts.slice(0, 5).map((p, index) => {
                  const isTopThree = index < 3;
                  return (
                    <li 
                      key={p.id} 
                      className={`group relative overflow-hidden rounded-full transition-all duration-300 ${
                        isTopThree 
                          ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-200 dark:border-blue-800/50 shadow-md hover:shadow-lg hover:scale-105' 
                          : 'bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      {/* 前3篇的动态背景光效 */}
                      {isTopThree && (
                        <>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
                          </div>
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-cyan-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </>
                      )}

                      {/* 内容容器 */}
                      <div className="relative z-10 flex items-center px-4 py-3 gap-3">
                        {/* 排名徽章 */}
                        <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-[11px] font-mono font-bold transition-all duration-300 ${
                          isTopThree 
                            ? `bg-gradient-to-br ${
                                index === 0 
                                  ? 'from-yellow-400 to-orange-500 text-white shadow-lg group-hover:scale-110 animate-bounce' 
                                  : index === 1 
                                  ? 'from-gray-300 to-gray-400 text-white shadow-lg group-hover:scale-105' 
                                  : 'from-orange-300 to-amber-400 text-white shadow-lg group-hover:scale-105'
                              }` 
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300'
                        }`}>
                          {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `0${index + 1}`}
                        </span>

                        {/* 文本内容 */}
                        <Link 
                          href={`${siteConfig('SUB_PATH', '')}/${p.slug}`} 
                          className={`flex-1 text-[13px] line-clamp-2 font-medium transition-all duration-300 ${
                            isTopThree
                              ? 'text-blue-700 dark:text-blue-300 group-hover:text-blue-600 dark:group-hover:text-blue-200 group-hover:translate-x-0.5'
                              : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                          }`}
                        >
                          {p.title}
                        </Link>

                        {/* 前3篇的热度指示 */}
                        {isTopThree && (
                          <div className="flex-shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {[...Array(index + 1)].map((_, i) => (
                              <div 
                                key={i}
                                className="w-1.5 h-4 bg-gradient-to-t from-orange-500 to-red-500 rounded-sm opacity-75 hover:opacity-100"
                              ></div>
                            ))}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* 运行状态 */}
          <section className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <SocialButton />
            <div className="mt-8 p-5 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <div className="text-[9px] text-zinc-400 uppercase mb-2 tracking-widest font-black">System Online</div>
              <div className="font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">{runtime}</div>
            </div>
          </section>

        </div>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .marquee-border-container::before {
          content: "";
          position: absolute;
          width: 150%;
          height: 150%;
          background: conic-gradient(transparent, #fbbf24, #f97316, #fbbf24, transparent 30%);
          top: -25%; left: -25%;
          animation: rotate-marquee 4s linear infinite;
        }
        @keyframes rotate-marquee {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .sideLeft .festive-hat-fixed {
            width: 45px !important;
            max-width: 45px !important;
            height: auto !important;
            border-radius: 0 !important;
            display: block !important;
        }

        .snowflake-anim {
          color: #fff;
          opacity: 0;
          text-shadow: 0 0 5px rgba(255,255,255,0.9);
          animation: snow-down 4s linear infinite;
        }
        @keyframes snow-down {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(40px) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default AsideLeft
