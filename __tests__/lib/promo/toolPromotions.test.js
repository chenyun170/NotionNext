/** @jest-environment node */

import {
  getActiveToolPromotions,
  isCampaignActive
} from '@/lib/promo/toolPromotions'

describe('toolPromotions', () => {
  it('shows Double 11 campaign items before the deadline', () => {
    const beforeDeadline = new Date('2026-11-25T10:00:00+08:00')
    const result = getActiveToolPromotions(beforeDeadline)

    expect(result.hasLiveCampaign).toBe(true)
    expect(result.sectionTitle).toBe('限时工具活动')

    const turing = result.items.find(item => item.id === 'turingsearch')
    expect(turing.mode).toBe('campaign')
    expect(turing.href).toContain('20261111tls')
    expect(turing.badge).toBe('双十一活动')
  })

  it('automatically falls back to evergreen software trials after the deadline', () => {
    const afterDeadline = new Date('2026-12-01T00:00:01+08:00')
    const result = getActiveToolPromotions(afterDeadline)

    expect(result.hasLiveCampaign).toBe(false)
    expect(result.sectionTitle).toBe('外贸软件免费试用推荐')

    const turing = result.items.find(item => item.id === 'turingsearch')
    expect(turing.mode).toBe('evergreen')
    expect(turing.href).toBe('https://t.smartsousou.com/m?i=BB54F6')
    expect(turing.badge).toBe('免费试用')

    const dingyi = result.items.find(item => item.id === 'dingyiyun')
    expect(dingyi.mode).toBe('evergreen')
    expect(dingyi.href).toBe('/dingyiyun.html')

    expect(result.bannerItems.length).toBeGreaterThan(0)
  })

  it('handles invalid deadlines safely', () => {
    expect(isCampaignActive(null, Date.now())).toBe(false)
    expect(isCampaignActive({ deadline: 'invalid-date' }, Date.now())).toBe(false)
  })
})
