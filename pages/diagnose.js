// 文件路径：pages/diagnose.js
// 访问地址：https://www.123170.xyz/diagnose

import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  trackSiteInteraction,
  trackToolOutboundClick
} from '@/lib/utils/customsDataSkillTracking'

const STEPS = ['基本信息', '开发信内容', '目标受众', '诊断报告']

const categoryLabels = {
  headline: '标题吸引力',
  valueProposition: '价值主张',
  cta: '行动召唤(CTA)',
  trustSignals: '信任背书',
  painPoints: '痛点共鸣',
  personalization: '个性化程度',
  clarity: '信息清晰度',
  urgency: '紧迫感设计'
}

const categoryIcons = {
  headline: '📌',
  valueProposition: '💎',
  cta: '👆',
  trustSignals: '🛡️',
  painPoints: '❤️',
  personalization: '🎯',
  clarity: '👁️',
  urgency: '⏰'
}

const TURINGSEARCH_TRIAL_URL = 'https://t.smartsousou.com/m?i=BB54F6'

function ScoreBar({ score }) {
  const barColor =
    score >= 75 ? 'bg-emerald-600' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
  const textColor =
    score >= 75
      ? 'text-emerald-700 dark:text-emerald-400'
      : score >= 50
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-red-600 dark:text-red-400'

  return (
    <div className='flex items-center gap-2.5'>
      <div className='h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-700'>
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`min-w-[28px] font-mono text-xs font-bold tabular-nums ${textColor}`}>
        {score}
      </span>
    </div>
  )
}

function ScoreRing({ score, size = 92 }) {
  const r = size * 0.38
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const strokeColor =
    score >= 75 ? '#1c5a4a' : score >= 50 ? '#d97706' : '#dc2626'

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='shrink-0'>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill='none'
        stroke='currentColor'
        className='text-stone-200 dark:text-stone-700'
        strokeWidth='6'
      />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill='none'
        stroke={strokeColor}
        strokeWidth='6'
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeLinecap='round'
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
      <text
        x={cx}
        y={cy + 2}
        textAnchor='middle'
        dominantBaseline='middle'
        style={{
          fontSize: size * 0.24,
          fontWeight: 800,
          fill: strokeColor,
          fontFamily: 'monospace'
        }}
      >
        {score}
      </text>
    </svg>
  )
}

export default function DiagnosePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false)

  const [form, setForm] = useState({
    productName: '',
    industry: '',
    letterContent: '',
    currentOpenRate: '',
    currentReplyRate: '',
    targetMarket: '',
    targetRole: '',
    painPoints: '',
    uniqueAdvantage: ''
  })

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    if (!router.isReady || form.productName) return
    const product = Array.isArray(router.query.product)
      ? router.query.product[0]
      : router.query.product

    if (product) {
      setForm(current => ({
        ...current,
        productName: product.slice(0, 80)
      }))
    }
  }, [router.isReady, router.query.product, form.productName])

  const industries = [
    '机械设备',
    '电子元器件',
    '纺织服装',
    '化工原料',
    '家具家居',
    '食品农产品',
    '医疗器械',
    '汽车配件',
    '其他'
  ]
  const markets = ['北美', '欧洲', '东南亚', '中东', '南美', '非洲', '日韩', '澳洲']
  const roles = ['采购经理', 'CEO/总裁', '产品经理', '技术负责人', '运营总监', '其他']

  async function runDiagnosis() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, privacyConfirmed })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setReport(data)
      setStep(3)
    } catch (e) {
      setError(e.message || '诊断分析失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const canNext0 = form.productName && form.industry
  const canNext1 = form.letterContent.trim().length > 50
  const canNext2 = form.targetMarket && form.targetRole && privacyConfirmed
  const customsSkillHref = form.productName
    ? `/customs-data-skill.html?product=${encodeURIComponent(form.productName)}`
    : '/customs-data-skill.html'

  const resetDiagnosis = (source = 'diagnose_reset') => {
    trackSiteInteraction({
      source,
      sourceGroup: 'lead',
      target: '/diagnose',
      action: 'restart_diagnosis'
    })
    setStep(0)
    setReport(null)
    setError('')
    setPrivacyConfirmed(false)
    setForm({
      productName: '',
      industry: '',
      letterContent: '',
      currentOpenRate: '',
      currentReplyRate: '',
      targetMarket: '',
      targetRole: '',
      painPoints: '',
      uniqueAdvantage: ''
    })
  }

  const cardClass =
    'mb-4 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'
  const inputClass =
    'w-full rounded-xl border border-stone-200 bg-[#faf9f6] px-3.5 py-2.5 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#1c5a4a] focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
  const optionBtnClass = active =>
    `rounded-lg border px-3.5 py-2 text-xs font-semibold transition cursor-pointer ${
      active
        ? 'border-[#1c5a4a] bg-[#1c5a4a] text-white'
        : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
    }`
  const nextBtnClass = active =>
    `rounded-xl px-6 py-2.5 text-sm font-semibold transition ${
      active
        ? 'cursor-pointer bg-[#1c5a4a] text-white shadow-sm hover:bg-[#14453a]'
        : 'cursor-not-allowed bg-stone-200 text-stone-400 dark:bg-stone-800 dark:text-stone-600'
    }`

  return (
    <div className='mx-auto w-full max-w-3xl py-2 text-stone-900 dark:text-stone-100'>
      {/* 头部说明 */}
      <div className='mb-6 rounded-2xl border border-stone-200/90 bg-white p-6 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'>
        <div className='mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#e8f0ec] px-3 py-1 text-[11px] font-bold text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
          <i className='fas fa-stethoscope text-[10px]' />
          外贸获客轻诊断
        </div>
        <h1 className='text-2xl font-extrabold leading-tight tracking-tight text-stone-950 dark:text-stone-50 sm:text-3xl'>
          先判断问题出在线索、验证，还是话术
        </h1>
        <p className='mt-2.5 text-sm leading-7 text-stone-600 dark:text-stone-300'>
          不确定先查海关数据、图灵搜还是顶易云时，可以先把产品和开发信放进来，看看问题更像出在线索、采购验证，还是触达话术。
        </p>

        <div className='mt-4 rounded-xl border border-[#c3d6cd] bg-[#f4f8f6] px-4 py-3 text-[13px] leading-6 text-[#1c5a4a] dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/15 dark:text-[#8fd8bf]'>
          简单判断：还没有客户名单，先从海关数据看谁真的在进口；已经有名单，先用采购记录验证优先级；已经在发开发信，就重点看话术和跟进节奏。
        </div>

        <p className='mt-3 text-xs leading-6 text-amber-800 dark:text-amber-300'>
          隐私提示：提交开发信前，请先删除密码、报价底价、客户隐私、未公开合同等敏感信息。
        </p>
      </div>

      {/* 两条分流卡片 */}
      {step < 3 && (
        <div className='mb-6 grid gap-3 sm:grid-cols-2'>
          <a
            href={customsSkillHref}
            onClick={() =>
              trackSiteInteraction({
                source: 'diagnose_choose_customs_data',
                sourceGroup: 'lead',
                target: customsSkillHref,
                action: 'choose_customs_data_path'
              })
            }
            className='block rounded-2xl border border-stone-200/90 bg-white p-5 no-underline transition hover:-translate-y-0.5 hover:border-[#1c5a4a]/50 hover:shadow-md dark:border-stone-800 dark:bg-[#1c1a17]'
          >
            <p className='text-xs font-bold text-[#b97a52]'>还没有客户名单</p>
            <h2 className='mt-1 text-base font-bold text-stone-900 dark:text-stone-100'>
              先查谁真的在进口 →
            </h2>
            <p className='mt-1.5 text-xs leading-6 text-stone-500 dark:text-stone-400'>
              先用产品词或 HS 编码查真实进口商，再看采购量、采购频率和供应商关系。
            </p>
          </a>

          <button
            type='button'
            onClick={() => {
              trackSiteInteraction({
                source: 'diagnose_choose_email_review',
                sourceGroup: 'lead',
                target: '/diagnose#diagnose-form',
                action: 'choose_email_diagnosis_path'
              })
              document
                .getElementById('diagnose-form')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className='rounded-2xl border border-[#c3d6cd] bg-[#f4f8f6] p-5 text-left transition hover:-translate-y-0.5 hover:border-[#1c5a4a] hover:shadow-md dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/15'
          >
            <p className='text-xs font-bold text-[#1c5a4a] dark:text-[#6bc4a6]'>
              已有名单或开发信
            </p>
            <h2 className='mt-1 text-base font-bold text-stone-900 dark:text-stone-100'>
              继续做开发信诊断 ↓
            </h2>
            <p className='mt-1.5 text-xs leading-6 text-stone-600 dark:text-stone-300'>
              如果已经在发邮件，重点看目标客户、痛点、价值主张和跟进动作是否清楚。
            </p>
          </button>
        </div>
      )}

      {/* 步骤条 */}
      {step < 3 && (
        <div className='mb-5 flex items-center px-1'>
          {STEPS.slice(0, 3).map((s, i) => (
            <div key={s} className={`flex items-center ${i < 2 ? 'flex-1' : ''}`}>
              <div className='flex items-center gap-2'>
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                    i < step
                      ? 'border-[#1c5a4a] bg-[#1c5a4a] text-white'
                      : i === step
                        ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
                        : 'border-stone-300 bg-white text-stone-400 dark:border-stone-700 dark:bg-stone-900'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span
                  className={`text-xs ${
                    i === step
                      ? 'font-bold text-stone-900 dark:text-stone-100'
                      : 'text-stone-400'
                  }`}
                >
                  {s}
                </span>
              </div>
              {i < 2 && (
                <div className='mx-3 h-px flex-1 bg-stone-200 dark:bg-stone-800' />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 0: 基本信息 */}
      {step === 0 && (
        <div id='diagnose-form'>
          <div className={cardClass}>
            <label className='mb-2 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              产品 / 公司名称 <span className='text-red-500'>*</span>
            </label>
            <input
              value={form.productName}
              onChange={e => up('productName', e.target.value)}
              placeholder='如：LED 投光灯 / 精密轴承'
              className={inputClass}
            />
          </div>

          <div className={cardClass}>
            <label className='mb-2.5 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              所属行业 <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {industries.map(ind => (
                <button
                  key={ind}
                  type='button'
                  onClick={() => up('industry', ind)}
                  className={optionBtnClass(form.industry === ind)}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div className='mb-4 grid gap-4 sm:grid-cols-2'>
            {[
              ['currentOpenRate', '当前开信率（%）', '如：25'],
              ['currentReplyRate', '当前回复率（%）', '如：3']
            ].map(([k, label, ph]) => (
              <div key={k} className={`${cardClass} mb-0`}>
                <label className='mb-2 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
                  {label}
                </label>
                <input
                  type='number'
                  value={form[k]}
                  onChange={e => up(k, e.target.value)}
                  placeholder={ph}
                  className={inputClass}
                />
              </div>
            ))}
          </div>

          <div className='flex justify-end'>
            <button
              type='button'
              onClick={() => setStep(1)}
              disabled={!canNext0}
              className={nextBtnClass(canNext0)}
            >
              下一步 →
            </button>
          </div>
        </div>
      )}

      {/* Step 1: 开发信内容 */}
      {step === 1 && (
        <div>
          <div className={cardClass}>
            <label className='mb-1 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              开发信正文内容 <span className='text-red-500'>*</span>
            </label>
            <p className='mb-2.5 text-xs text-stone-400'>
              请粘贴完整的开发信内容，包括主题行（如有）、正文和签名
            </p>
            <textarea
              value={form.letterContent}
              onChange={e => up('letterContent', e.target.value)}
              placeholder={
                'Subject: High-quality CNC Machines from China Manufacturer\n\nDear [Name],\n\nI hope this email finds you well...\n（请粘贴您的完整开发信内容）'
              }
              rows={11}
              className={`${inputClass} resize-y font-mono text-[13px] leading-relaxed`}
            />
            <p
              className={`mt-1.5 text-xs ${
                form.letterContent.length < 50 ? 'text-red-500' : 'text-stone-400'
              }`}
            >
              已输入 {form.letterContent.length} 字符{' '}
              {form.letterContent.length >= 50 ? '✓' : '（至少 50 字符）'}
            </p>
            <p className='mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs leading-6 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
              隐私提示：点击 AI 诊断后，开发信内容会发送给第三方 AI 诊断接口用于分析。请勿提交密码、报价底价、客户隐私、未公开合同等敏感信息。
            </p>
          </div>

          <div className='flex justify-between'>
            <button
              type='button'
              onClick={() => setStep(0)}
              className='rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
            >
              ← 上一步
            </button>
            <button
              type='button'
              onClick={() => setStep(2)}
              disabled={!canNext1}
              className={nextBtnClass(canNext1)}
            >
              下一步 →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: 目标受众 */}
      {step === 2 && (
        <div>
          <div className={cardClass}>
            <label className='mb-2.5 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              目标市场 <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {markets.map(m => (
                <button
                  key={m}
                  type='button'
                  onClick={() => up('targetMarket', m)}
                  className={optionBtnClass(form.targetMarket === m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <label className='mb-2.5 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              目标收件人职位 <span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {roles.map(r => (
                <button
                  key={r}
                  type='button'
                  onClick={() => up('targetRole', r)}
                  className={optionBtnClass(form.targetRole === r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <label className='mb-2 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              买家核心痛点
            </label>
            <textarea
              value={form.painPoints}
              onChange={e => up('painPoints', e.target.value)}
              placeholder='如：对供应商质量不稳定、交货期难以保证、沟通响应慢等方面有顾虑'
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          <div className={cardClass}>
            <label className='mb-2 block text-xs font-semibold text-stone-600 dark:text-stone-300'>
              产品 / 公司核心优势
            </label>
            <textarea
              value={form.uniqueAdvantage}
              onChange={e => up('uniqueAdvantage', e.target.value)}
              placeholder='如：工厂直供价格优势、ISO 认证、10 年行业经验、72 小时快速打样'
              rows={3}
              className={`${inputClass} resize-y`}
            />
          </div>

          {error && (
            <div className='mb-4 rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900/60 dark:bg-red-950/30'>
              <p className='text-sm font-bold text-red-800 dark:text-red-300'>
                诊断暂时没有跑通
              </p>
              <p className='mt-1 text-xs leading-6 text-red-700 dark:text-red-200'>
                {error}。你可以稍后再试，也可以先去查谁真的在进口你的产品，先把目标客户名单跑出来。
              </p>
              <div className='mt-3 grid gap-2 sm:grid-cols-2'>
                <a
                  href={customsSkillHref}
                  onClick={() =>
                    trackSiteInteraction({
                      source: 'diagnose_error_customs_data',
                      sourceGroup: 'lead',
                      target: customsSkillHref,
                      action: 'diagnose_error_open_customs_data'
                    })
                  }
                  className='flex h-10 items-center justify-center rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 no-underline transition hover:border-[#1c5a4a] hover:text-[#1c5a4a]'
                >
                  先查进口商
                </a>
                <a
                  href={TURINGSEARCH_TRIAL_URL}
                  target='_blank'
                  rel='sponsored noopener noreferrer'
                  onClick={() =>
                    trackToolOutboundClick({
                      source: 'diagnose_error_turingsearch_trial',
                      sourceGroup: 'lead',
                      target: TURINGSEARCH_TRIAL_URL,
                      tool: 'turingsearch'
                    })
                  }
                  className='flex h-10 items-center justify-center rounded-xl border border-[#c3d6cd] bg-[#e8f0ec] text-xs font-bold text-[#1c5a4a] no-underline transition hover:bg-[#1c5a4a] hover:text-white'
                >
                  体验图灵搜
                </a>
              </div>
            </div>
          )}

          <label className='mb-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-6 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'>
            <input
              type='checkbox'
              checked={privacyConfirmed}
              onChange={e => setPrivacyConfirmed(e.target.checked)}
              className='mt-1'
            />
            <span>
              我已移除密码、报价底价、客户隐私、未公开合同等敏感信息，并同意将上述内容发送给第三方 AI 诊断接口用于本次分析。
            </span>
          </label>

          <div className='flex justify-between'>
            <button
              type='button'
              onClick={() => setStep(1)}
              className='rounded-xl border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200'
            >
              ← 上一步
            </button>
            <button
              type='button'
              onClick={() => {
                void runDiagnosis()
              }}
              disabled={!canNext2 || loading}
              className={nextBtnClass(canNext2 && !loading)}
            >
              {loading ? '⏳ AI 分析中...' : '🤖 开始 AI 诊断'}
            </button>
          </div>
        </div>
      )}

      {/* Report */}
      {step === 3 && report && (
        <div>
          <div className={`${cardClass} flex flex-col gap-5 sm:flex-row sm:items-center`}>
            <ScoreRing score={report.overallScore} size={92} />
            <div className='flex-1'>
              <div className='mb-2 flex flex-wrap items-center gap-2'>
                <span className='text-base font-bold text-stone-900 dark:text-stone-100'>
                  综合转化诊断分
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    report.conversionPotential === '高'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : report.conversionPotential === '中'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  转化潜力：{report.conversionPotential}
                </span>
              </div>
              <p className='text-sm leading-7 text-stone-600 dark:text-stone-300'>
                {report.executiveSummary}
              </p>
            </div>
          </div>

          <div className='mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4'>
            {[
              { label: '产品', val: form.productName.slice(0, 10) },
              { label: '目标市场', val: form.targetMarket },
              {
                label: '开信率',
                val: form.currentOpenRate ? `${form.currentOpenRate}%` : '未知'
              },
              {
                label: '回复率',
                val: form.currentReplyRate ? `${form.currentReplyRate}%` : '未知'
              }
            ].map(m => (
              <div
                key={m.label}
                className='rounded-xl border border-stone-200/80 bg-white p-3.5 dark:border-stone-800 dark:bg-[#1c1a17]'
              >
                <p className='text-[11px] text-stone-400'>{m.label}</p>
                <p className='mt-1 truncate text-sm font-bold text-stone-900 dark:text-stone-100'>
                  {m.val}
                </p>
              </div>
            ))}
          </div>

          <div className={cardClass}>
            <h3 className='mb-4 text-sm font-bold text-stone-900 dark:text-stone-100'>
              八维度评分
            </h3>
            <div className='grid gap-x-8 gap-y-3.5 sm:grid-cols-2'>
              {Object.entries(report.categories).map(([key, val]) => (
                <div key={key}>
                  <div className='mb-1 flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-300'>
                    <span>{categoryIcons[key]}</span>
                    <span>{categoryLabels[key]}</span>
                  </div>
                  <ScoreBar score={val.score} />
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className='mb-4 text-sm font-bold text-stone-900 dark:text-stone-100'>
              关键问题诊断
            </h3>
            <div className='space-y-3'>
              {report.topIssues.map((issue, i) => (
                <div
                  key={i}
                  className={`rounded-xl border-l-4 bg-[#faf9f6] p-4 dark:bg-[#151412] ${
                    issue.priority === 'P0'
                      ? 'border-l-red-500'
                      : issue.priority === 'P1'
                        ? 'border-l-amber-500'
                        : 'border-l-[#1c5a4a]'
                  }`}
                >
                  <span
                    className={`mb-1.5 inline-block rounded-md px-2 py-0.5 text-[11px] font-bold ${
                      issue.priority === 'P0'
                        ? 'bg-red-100 text-red-800'
                        : issue.priority === 'P1'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#e8f0ec] text-[#1c5a4a]'
                    }`}
                  >
                    {issue.priority === 'P0'
                      ? '紧急'
                      : issue.priority === 'P1'
                        ? '重要'
                        : '优化'}
                  </span>
                  <p className='text-sm font-bold text-stone-900 dark:text-stone-100'>
                    {issue.title}
                  </p>
                  <p className='mt-1 text-xs leading-6 text-stone-600 dark:text-stone-300'>
                    {issue.description}
                  </p>
                  <p className='mt-1 text-xs text-stone-400'>📈 {issue.impact}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={cardClass}>
            <h3 className='mb-3 text-sm font-bold text-stone-900 dark:text-stone-100'>
              各维度优化建议
            </h3>
            <div className='divide-y divide-stone-100 dark:divide-stone-800'>
              {Object.entries(report.categories).map(([key, val]) => (
                <div key={key} className='flex gap-3 py-3.5 first:pt-0 last:pb-0'>
                  <span className='text-lg'>{categoryIcons[key]}</span>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <span className='text-xs font-bold text-stone-900 dark:text-stone-100'>
                        {categoryLabels[key]}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          val.score >= 75
                            ? 'text-emerald-600'
                            : val.score >= 50
                              ? 'text-amber-600'
                              : 'text-red-600'
                        }`}
                      >
                        {val.score} 分
                      </span>
                    </div>
                    <p className='text-xs text-red-600 dark:text-red-400'>
                      ⚠️ {val.issue}
                    </p>
                    <p className='mt-1 text-xs leading-6 text-stone-600 dark:text-stone-300'>
                      💡 {val.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {report.rewriteSample && (
            <div className={cardClass}>
              <h3 className='mb-2.5 text-sm font-bold text-stone-900 dark:text-stone-100'>
                ✨ 优化示例（开头片段）
              </h3>
              <div className='whitespace-pre-wrap rounded-xl bg-[#f4f8f6] p-4 font-mono text-xs leading-7 text-stone-800 dark:bg-[#1c5a4a]/15 dark:text-stone-200'>
                {report.rewriteSample}
              </div>
            </div>
          )}

          {report.expectedImprovement && (
            <div className='mb-4 flex gap-3 rounded-2xl border border-[#c3d6cd] bg-[#e8f0ec] p-4 text-[#1c5a4a] dark:border-[#2d6f5d] dark:bg-[#1c5a4a]/20 dark:text-[#8fd8bf]'>
              <span className='text-xl'>📈</span>
              <div>
                <p className='text-xs font-bold'>预期优化效果</p>
                <p className='mt-0.5 text-xs leading-6'>{report.expectedImprovement}</p>
              </div>
            </div>
          )}

          <div className='rounded-2xl border border-stone-200/90 bg-white p-5 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'>
            <p className='text-base font-bold text-stone-900 dark:text-stone-100'>
              诊断之后，下一步这样做
            </p>
            <p className='mt-1.5 text-xs leading-6 text-stone-600 dark:text-stone-300'>
              先把开发信问题记下来，再用真实采购记录验证目标客户。线索、联系人和话术连起来，后续跟进会更稳。
            </p>
            <div className='mt-4 grid gap-2.5 sm:grid-cols-3'>
              <a
                href={customsSkillHref}
                onClick={() =>
                  trackSiteInteraction({
                    source: 'diagnose_result_customs_data',
                    sourceGroup: 'lead',
                    target: customsSkillHref,
                    action: 'diagnose_result_open_customs_data'
                  })
                }
                className='flex h-10 items-center justify-center rounded-xl bg-[#1c5a4a] px-3 text-xs font-semibold text-white no-underline transition hover:bg-[#14453a]'
              >
                根据产品查进口商
              </a>
              <a
                href={TURINGSEARCH_TRIAL_URL}
                target='_blank'
                rel='sponsored noopener noreferrer'
                onClick={() =>
                  trackToolOutboundClick({
                    source: 'diagnose_result_turingsearch_trial',
                    sourceGroup: 'lead',
                    target: TURINGSEARCH_TRIAL_URL,
                    tool: 'turingsearch'
                  })
                }
                className='flex h-10 items-center justify-center rounded-xl border border-[#c3d6cd] bg-[#e8f0ec] px-3 text-xs font-semibold text-[#1c5a4a] no-underline transition hover:bg-[#1c5a4a] hover:text-white'
              >
                免费体验图灵搜
              </a>
              <button
                type='button'
                onClick={() => resetDiagnosis('diagnose_result_restart')}
                className='flex h-10 items-center justify-center rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-600 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300'
              >
                重新诊断另一封
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
