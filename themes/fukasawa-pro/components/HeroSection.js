// themes/fukasawa/components/HeroSection.jsx
// 首屏 Hero 区域组件

import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import Link from 'next/link'

export default function HeroSection() {
  const { locale } = useGlobal()
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 动态背景网格 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0L0 0 0 10' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      ></div>

      {/* 光晕效果 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative container mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* 左侧内容 */}
          <div className="text-white">
            {/* 标签 */}
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-blue-300 text-sm font-medium">
                {siteConfig('DESCRIPTION') || '专注黑科技工具实战'}
              </span>
            </div>

            {/* 主标题 */}
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              用
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent animate-gradient">
                AI与数据
              </span>
              <br />
              重新定义外贸获客
            </h1>

            {/* 副标题 */}
            <p className="text-xl text-gray-300 mb-10 leading-relaxed max-w-xl">
              深耕图灵搜、海关数据与AI外贸助手，为 10,000+ 外贸人提供最前沿的客户开发系统实战方案
            </p>

            {/* CTA 按钮组 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href="/links" passHref legacyBehavior>
                <a className="group bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl font-medium hover:shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105 flex items-center justify-center gap-2">
                  立即开始获客
                  <i className="fas fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
                </a>
              </Link>
              
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-medium hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <i className="fas fa-play-circle"></i>
                观看演示视频
              </button>
            </div>

            {/* 数据展示 */}
            <div className="grid grid-cols-3 gap-8 max-w-xl">
              <div>
                <div className="text-4xl font-bold mb-1">10K+</div>
                <div className="text-gray-400 text-sm">活跃用户</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">50M+</div>
                <div className="text-gray-400 text-sm">客户数据</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">98%</div>
                <div className="text-gray-400 text-sm">满意度</div>
              </div>
            </div>
          </div>

          {/* 右侧装饰或工具预览 */}
          <div className="relative hidden lg:block">
            {/* 3D 卡片堆叠效果 */}
            <div className="relative h-[500px]">
              {/* 卡片1 */}
              <div className="absolute top-0 right-0 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-search text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-white font-bold">图灵搜</div>
                    <div className="text-gray-400 text-xs">Google Maps 获客</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">
                  全球 200+ 国家，5000 万+ 企业数据
                </div>
              </div>

              {/* 卡片2 */}
              <div className="absolute top-20 right-10 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl -rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-robot text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-white font-bold">AI 助手</div>
                    <div className="text-gray-400 text-xs">智能邮件生成</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">
                  30 秒生成专业开发信，转化率提升 3 倍
                </div>
              </div>

              {/* 卡片3 */}
              <div className="absolute top-40 right-5 w-80 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                    <i className="fas fa-chart-line text-white text-xl"></i>
                  </div>
                  <div>
                    <div className="text-white font-bold">海关数据</div>
                    <div className="text-gray-400 text-xs">全球贸易分析</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">
                  实时追踪竞争对手，精准定位目标客户
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部渐变遮罩 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-gray-950 to-transparent"></div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  )
}

/**
 * 精简版 Hero（用于其他页面）
 */
export function HeroSimple({ title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-700 py-16">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="relative container mx-auto px-6 text-center text-white">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        {subtitle && <p className="text-xl text-blue-100">{subtitle}</p>}
      </div>
    </section>
  )
}