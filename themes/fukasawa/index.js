// themes/fukasawa/index.js
// 首页主文件 - 集成所有升级组件 (已修复)

import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/notion/getNotionData'
import { useGlobal } from '@/lib/global'
import Head from 'next/head'
import React from 'react'

// 导入组件
import HeroSection from './components/HeroSection'
// 修复：导入正确的 BlogCard 组件，而不是不存在的 ArticleGrid
import BlogCard from './components/BlogCard' 
import CONFIG from './config'
import { Style } from './style'
import { useRouter } from 'next/router'

/**
 * Fukasawa 首页
 * @param {*} props
 * @returns
 */
const Index = (props) => {
  const { siteInfo } = props
  const router = useRouter()

  return (
    <>
      <Head>
        <title>{`${siteInfo?.title} | ${siteInfo?.description}`}</title>
        <meta name="description" content={siteInfo?.description} />
      </Head>

      <Style />

      {/* Hero 区域 */}
      <HeroSection />

      {/* 主内容区 */}
      <div className="container mx-auto px-6 py-16">
        {/* 热门文章区域 */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">🔥</span>
                热门文章
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                最受欢迎的外贸实战技巧和工具推荐
              </p>
            </div>
            <button 
              onClick={() => router.push('/archive')}
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:gap-3 transition-all font-medium"
            >
              查看全部
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>

          {/* 修复：使用循环渲染 BlogCard 替代不存在的 ArticleGrid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {props.posts?.slice(0, 6).map(post => (
              <BlogCard key={post.id} post={post} showSummary={true} />
            ))}
          </div>
        </section>

        {/* 最新文章区域（紧凑样式） */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-clock text-blue-500"></i>
              最新发布
            </h2>
          </div>

          {/* 修复：使用循环渲染 BlogCard 替代不存在的 ArticleGrid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {props.posts?.slice(6, 12).map(post => (
              <BlogCard key={post.id} post={post} showSummary={false} />
            ))}
          </div>
        </section>

        {/* 工具推荐区域 */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <i className="fas fa-tools text-orange-500"></i>
            推荐工具
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: '🔍', 
                name: '图灵搜', 
                desc: '谷歌地图获客', 
                link: '/links',
                color: 'blue' 
              },
              { 
                icon: '📊', 
                name: '海关数据', 
                desc: '全球贸易数据', 
                link: '/links',
                color: 'green' 
              },
              { 
                icon: '🤖', 
                name: 'AI助手', 
                desc: '智能邮件生成', 
                link: '/links',
                color: 'purple' 
              },
              { 
                icon: '💬', 
                name: 'WhatsApp', 
                desc: '客户直连工具', 
                link: '/links',
                color: 'orange' 
              }
            ].map((tool, i) => (
              <a
                key={i}
                href={tool.link}
                className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer text-center"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                  {tool.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  {tool.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {tool.desc}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* CTA 区域 */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 text-center text-white">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">
              准备好开始外贸获客了吗？
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              加入 10,000+ 外贸人，使用我们的工具和方法，让客户开发变得更简单
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all">
                免费领取资料包 🎁
              </button>
              <button className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all">
                了解更多
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

/**
 * 服务端获取数据
 */
export async function getStaticProps() {
  const from = 'index'
  const props = await getGlobalData({ from })
  
  // 排序和过滤
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  
  delete props.allPages
  
  return {
    props,
    revalidate: parseInt(BLOG.NEXT_REVALIDATE_SECOND)
  }
}

export default Index
