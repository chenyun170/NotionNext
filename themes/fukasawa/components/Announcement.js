'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useGlobal } from '@/lib/global'
import { getActiveToolPromotions } from '@/lib/promo/toolPromotions'
import {
  trackCustomsDataSkillClick,
  trackSiteInteraction,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'

const LazyNotionContent = dynamic(() => import('./LazyNotionContent'))

const ANNOUNCEMENT_DISMISS_KEY = 'fukasawa_activity_announcement_dismissed_at'
const ANNOUNCEMENT_DISMISS_MS = 24 * 60 * 60 * 1000

/**
 * 获客工具活动 / 免费试用软推区块
 * - 活动期内展示限时活动方案
 * - 活动到期后自动切换为常驻软件免费试用软推荐（不出现空盒）
 */
const Announcement = ({ post, className = '' }) => {
  const { locale } = useGlobal()
  const [promoData, setPromoData] = useState(() => getActiveToolPromotions())
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    try {
      const dismissedAt = Number(
        window.localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY)
      )
      if (dismissedAt && Date.now() - dismissedAt < ANNOUNCEMENT_DISMISS_MS) {
        setDismissed(true)
      }
    } catch {
      // ignore storage error
    }

    const syncPromos = () => setPromoData(getActiveToolPromotions())
    syncPromos()
    const timer = setInterval(syncPromos, 60000)
    return () => clearInterval(timer)
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    trackSiteInteraction({
      source: 'activity_announcement_dismiss',
      sourceGroup: 'activity',
      action: 'dismiss_announcement'
    })
    try {
      window.localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore storage error
    }
  }

  if (dismissed) return null

  return (
    <section
      aria-label={promoData.sectionTitle}
      className={`rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17] sm:p-6 ${className}`}
    >
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              promoData.hasLiveCampaign
                ? 'bg-[#b97a52]/15 text-[#9a5833] dark:bg-[#d29a63]/20 dark:text-[#e8c9a8]'
                : 'bg-[#e8f0ec] text-[#1c5a4a] dark:bg-[#1c5a4a]/30 dark:text-[#6bc4a6]'
            }`}
          >
            <i
              className={`fas ${promoData.hasLiveCampaign ? 'fa-bolt' : 'fa-flask'} text-[10px]`}
            />
            {promoData.hasLiveCampaign ? '限时工具活动' : '软件免费试用'}
          </span>
          <h2 className='text-base font-bold text-stone-900 dark:text-stone-100'>
            {promoData.sectionTitle}
          </h2>
          <span className='hidden text-xs text-stone-500 dark:text-stone-400 md:inline'>
            · {promoData.sectionSubtitle}
          </span>
        </div>

        <button
          type='button'
          onClick={handleDismiss}
          aria-label='收起推荐'
          title='24 小时内不再显示'
          className='inline-flex h-7 w-7 items-center justify-center rounded-full border border-stone-200 text-xs text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 dark:border-stone-700 dark:hover:bg-stone-800 dark:hover:text-stone-200'
        >
          <i className='fas fa-times' />
        </button>
      </div>

      <div className='grid gap-3 md:grid-cols-3'>
        {promoData.items.map(item => (
          <div
            key={item.id}
            className='flex flex-col justify-between rounded-xl border border-stone-200/80 bg-[#faf9f6] p-4 transition-all hover:border-[#1c5a4a]/40 hover:bg-white dark:border-stone-800 dark:bg-[#151412] dark:hover:border-[#3fa383]/50 dark:hover:bg-[#1c1a17]'
          >
            <div>
              <div className='mb-2 flex items-center justify-between gap-2'>
                <span className='inline-flex items-center gap-2 text-sm font-bold text-stone-900 dark:text-stone-100'>
                  <span className='flex h-7 w-7 items-center justify-center rounded-lg bg-[#e8f0ec] text-xs text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
                    <i className={`fas ${item.icon}`} />
                  </span>
                  {item.name}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    item.mode === 'campaign'
                      ? 'bg-[#b97a52]/15 text-[#9a5833] dark:text-[#e8c9a8]'
                      : 'bg-stone-200/70 text-stone-600 dark:bg-stone-800 dark:text-stone-300'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
              <p className='text-xs leading-6 text-stone-600 dark:text-stone-400'>
                {item.description}
              </p>
            </div>

            <div className='mt-4'>
              <a
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'sponsored noopener noreferrer' : undefined}
                onClick={() => {
                  if (item.id === 'oraskl') {
                    trackCustomsDataSkillClick(item.trackSource)
                  } else {
                    trackToolOutboundClick({
                      source: item.trackSource,
                      target: item.href,
                      tool: item.tool,
                      sourceGroup: 'activity'
                    })
                  }
                }}
                className='inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-stone-300/90 bg-white px-3 py-2 text-xs font-semibold text-stone-800 no-underline transition hover:border-[#1c5a4a] hover:bg-[#1c5a4a] hover:text-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:border-[#1c5a4a] dark:hover:bg-[#1c5a4a] dark:hover:text-white'
              >
                <span>{item.cta}</span>
                <i className='fas fa-arrow-right text-[10px]' />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className='mt-3 text-[11px] text-stone-400 dark:text-stone-500'>
        说明：含合作伙伴推广或试用入口，建议先用免费试用和海关数据交叉验证再按需采购。
      </p>

      {post?.blockMap && (
        <div className='mt-4 border-t border-stone-200/80 pt-4 dark:border-stone-800'>
          <div className='mb-2 text-[11px] font-bold uppercase tracking-widest text-stone-400'>
            <i className='fas fa-bullhorn mr-2' />
            {locale.COMMON.ANNOUNCEMENT}
          </div>
          <LazyNotionContent post={post} />
        </div>
      )}
    </section>
  )
}

export default Announcement
