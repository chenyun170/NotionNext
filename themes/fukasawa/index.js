// themes/fukasawa/index.js
// 首页主文件 - 集成所有升级组件 (优化版)

import BLOG from '@/blog.config'
import { getGlobalData } from '@/lib/notion/getNotionData'
import { useGlobal } from '@/lib/global'
import Head from 'next/head'
import React from 'react'
import { useRouter } from 'next/router'

// 导入组件
import HeroSection from './components/HeroSection'
import { ArticleGrid } from './components/ArticleCard' // 假设这是增强版文章卡片
import CONFIG from './config'
import { Style } from './style'

// --- 小组件定义 ---

/**
 * 区域标题组件
 * @param {{
 *   icon: string | React.ReactNode;
 *   title: string;
 *   description?: string;
 *   showMoreLink?: string;
 *   moreText?: string;
 * }} props
 */
const SectionHeader = ({ icon, title, description, showMoreLink, moreText }) => {
  const router = useRouter()
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          {icon && (typeof icon === 'string' ? <span className="text-4xl">{icon}</span> : icon)}
          {title}
        </h2>
        {description && <p className="text-gray-500 dark:text-gray-400">{description}</p>}
      </div>
      {showMoreLink && (
        <button
          onClick={() => router.push(showMoreLink)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:gap-3 transition-all font-medium"
        >
          {moreText}
          <i className="fas fa-arrow-right" aria-hidden="true"></i>
        </button>
      )}
    </div>
  )
}

/**
 * 工具卡片组件
 * @param {{ tool: { icon: string; name: string; desc: string; link: string; } }} props
 */
const ToolCard = ({ tool }) => (
  <a
    href={tool.link}
    target="_blank"
    rel="noopener noreferrer"
    className="group bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer text-center"
  >
    <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
      {tool.icon}
    </div>
    <h3 className="font-bold text-gray-900 dark:text-white mb-2">{tool.name}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400">{tool.desc}</p>
  </a>
)

/**
 * Call-to-Action 组件
 * @param {{ cta: { title: string; description: string; primaryButton: { text: string; url: string; }; secondaryButton: { text: string; url: string; } } }} props
 */
const CallToAction = ({ cta }) => (
  <section className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-12 text-center text-white">
    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div className="relative z-10">
      <h2 className="text-4xl font-bold mb-4">{cta.title}</h2>
      <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">{cta.description}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href={cta.primaryButton.url} className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all">
          {cta.primaryButton.text}
        </a>
        <a href={cta.secondaryButton.url} className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/30 transition-all">
          {cta.secondaryButton.text}
        </a>
      </div>
    </div>
  </section>
)

// --- 页面主组件 ---

/**
 * Fukasawa 首页 - 优化版
 * @param {*} props
 * @returns
 */
const Index = (props) => {
  const { siteInfo } = props
  const { locale } = useGlobal()

  // 从本地化文件中获取文本
  const t = locale.LANG.INDEX || {}

  // 从主题配置中获取数据
  const { FUKASAWA_INDEX_TOOLS, FUKASAWA_INDEX_CTA } = CONFIG

  return (
    <>
      <Head>
        <title>{`${siteInfo?.title} | ${siteInfo?.description}`}</title>
        <meta name="description" content={siteInfo?.description} />
      </Head>

      <Style />

      <HeroSection />

      <div className="container mx-auto px-6 py-16">
        {/* 热门文章区域 */}
        <section className="mb-20">
          <SectionHeader
            icon="🔥"
            title={t.HOT_POSTS}
            description={t.HOT_POSTS_DESC}
            showMoreLink="/archive"
            moreText={t.VIEW_ALL}
          />
          <ArticleGrid posts={props.posts?.slice(0, 6)} variant="default" />
        </section>

        {/* 最新文章区域 */}
        <section className="mb-20">
          <SectionHeader
            icon={<i className="fas fa-clock text-blue-500" aria-hidden="true"></i>}
            title={t.LATEST_POSTS}
          />
          <ArticleGrid posts={props.posts?.slice(6, 12)} variant="compact" />
        </section>

        {/* 工具推荐区域 */}
        {FUKASAWA_INDEX_TOOLS && (
          <section className="mb-20">
            <SectionHeader
              icon={<i className="fas fa-tools text-orange-500" aria-hidden="true"></i>}
              title={t.RECOMMENDED_TOOLS}
            />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {FUKASAWA_INDEX_TOOLS.map((tool, i) => (
                <ToolCard key={i} tool={tool} />
              ))}
            </div>
          </section>
        )}

        {/* CTA 区域 */}
        {FUKASAWA_INDEX_CTA && <CallToAction cta={FUKASAWA_INDEX_CTA} />}
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

  // 仅保留已发布的文章
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )
  
  // 删除不再需要的数据，减轻客户端负担
  delete props.allPages

  return {
    props,
    revalidate: parseInt(BLOG.NEXT_REVALIDATE_SECOND)
  }
}

export default Index
