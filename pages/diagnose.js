// 文件路径：pages/diagnose.js
// 这个文件放在你 GitHub 项目的 pages/ 目录下
// 访问地址：https://www.123170.xyz/diagnose

import { useState } from 'react'
import Head from 'next/head'

const STEPS = ['基本信息', '开发信内容', '目标受众', '诊断报告']

const categoryLabels = {
  headline: '标题吸引力',
  valueProposition: '价值主张',
  cta: '行动召唤(CTA)',
  trustSignals: '信任背书',
  painPoints: '痛点共鸣',
  personalization: '个性化程度',
  clarity: '信息清晰度',
  urgency: '紧迫感设计',
}

const categoryIcons = {
  headline: '📌',
  valueProposition: '💎',
  cta: '👆',
  trustSignals: '🛡️',
  painPoints: '❤️',
  personalization: '🎯',
  clarity: '👁️',
  urgency: '⏰',
}

function ScoreBar({ score }) {
  const color =
    score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, minWidth: 28 }}>{score}</span>
    </div>
  )
}

function ScoreRing({ score, size = 90 }) {
  const r = size * 0.38
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const color = score >= 75 ? '#1D9E75' : score >= 50 ? '#BA7517' : '#E24B4A'
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`} style={{ transition: 'stroke-dasharray 1s ease' }} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        style={{ fontSize: size * 0.22, fontWeight: 700, fill: color, fontFamily: 'monospace' }}>
        {score}
      </text>
    </svg>
  )
}

export default function DiagnosePage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false)

  const [form, setForm] = useState({
    productName: '', industry: '', letterContent: '',
    currentOpenRate: '', currentReplyRate: '',
    targetMarket: '', targetRole: '', painPoints: '', uniqueAdvantage: '',
  })

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const industries = ['机械设备', '电子元器件', '纺织服装', '化工原料', '家具家居', '食品农产品', '医疗器械', '汽车配件', '其他']
  const markets = ['北美', '欧洲', '东南亚', '中东', '南美', '非洲', '日韩', '澳洲']
  const roles = ['采购经理', 'CEO/总裁', '产品经理', '技术负责人', '运营总监', '其他']

  async function runDiagnosis() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, privacyConfirmed }),
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

  const btnStyle = (active) => ({
    padding: '8px 16px', fontSize: 13, borderRadius: 8,
    background: active ? '#1D9E75' : 'transparent',
    color: active ? '#fff' : '#374151',
    border: `1px solid ${active ? '#1D9E75' : '#d1d5db'}`,
    cursor: 'pointer', transition: 'all 0.15s',
  })

  const cardStyle = {
    background: '#fff', border: '1px solid #e5e7eb',
    borderRadius: 12, padding: '1rem 1.25rem', marginBottom: 12,
  }
  const privacyNoticeStyle = {
    fontSize: 12,
    color: '#92400e',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: 8,
    padding: '8px 10px',
    margin: '8px 0 0',
    lineHeight: 1.6,
  }

  const nextBtnStyle = (active) => ({
    padding: '10px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14,
    background: active ? '#1D9E75' : '#f3f4f6',
    color: active ? '#fff' : '#9ca3af',
    border: 'none', cursor: active ? 'pointer' : 'not-allowed',
  })

  return (
    <>
      <Head>
        <title>开发信转化率诊断 | 外贸获客情报局</title>
        <meta name="description" content="AI 深度分析外贸开发信，找出转化瓶颈，给出可操作的优化建议。隐私提示：开发信内容会发送给第三方 AI 诊断接口，请先移除密码、报价底价、客户隐私和未公开合同等敏感信息。" />
      </Head>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, sans-serif', color: '#111827' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 6px' }}>
            🔬 外贸开发信诊断
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>落地页转化率诊断报告</h1>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
            输入开发信内容，AI 深度分析转化瓶颈，给出可操作的优化建议
          </p>
        </div>

        {/* Step indicator */}
        {step < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
            {STEPS.slice(0, 3).map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 12, fontWeight: 600,
                    background: i < step ? '#1D9E75' : i === step ? '#111827' : 'transparent',
                    border: `1px solid ${i < step ? '#1D9E75' : i === step ? '#111827' : '#d1d5db'}`,
                    color: i <= step ? '#fff' : '#9ca3af',
                  }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: i === step ? '#111827' : '#9ca3af', fontWeight: i === step ? 600 : 400 }}>{s}</span>
                </div>
                {i < 2 && <div style={{ flex: 1, height: 1, background: '#e5e7eb', margin: '0 8px' }} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 0: 基本信息 */}
        {step === 0 && (
          <div>
            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                产品 / 公司名称 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input value={form.productName} onChange={e => up('productName', e.target.value)}
                placeholder="如：ABC机械设备有限公司"
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
            </div>

            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                所属行业 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {industries.map(ind => (
                  <button key={ind} onClick={() => up('industry', ind)} style={btnStyle(form.industry === ind)}>{ind}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              {[['currentOpenRate', '当前开信率（%）', '如：25'], ['currentReplyRate', '当前回复率（%）', '如：3']].map(([k, label, ph]) => (
                <div key={k} style={cardStyle}>
                  <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</label>
                  <input type="number" value={form[k]} onChange={e => up(k, e.target.value)} placeholder={ph}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setStep(1)} disabled={!canNext0} style={nextBtnStyle(canNext0)}>
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: 开发信内容 */}
        {step === 1 && (
          <div>
            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                开发信正文内容 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 8px' }}>请粘贴完整的开发信内容，包括主题行（如有）、正文和签名</p>
              <textarea value={form.letterContent} onChange={e => up('letterContent', e.target.value)}
                placeholder={'Subject: High-quality CNC Machines from China Manufacturer\n\nDear [Name],\n\nI hope this email finds you well...\n（请粘贴您的完整开发信内容）'}
                rows={12}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, lineHeight: 1.7, fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box' }} />
              <p style={{ fontSize: 12, color: form.letterContent.length < 50 ? '#ef4444' : '#9ca3af', margin: '4px 0 0' }}>
                已输入 {form.letterContent.length} 字符 {form.letterContent.length >= 50 ? '✓' : '（至少50字符）'}
              </p>
              <p style={privacyNoticeStyle}>
                隐私提示：点击 AI 诊断后，开发信内容会发送给第三方 AI 诊断接口用于分析。请勿提交密码、报价底价、客户隐私、未公开合同等敏感信息。
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(0)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: 14 }}>
                ← 上一步
              </button>
              <button onClick={() => setStep(2)} disabled={!canNext1} style={nextBtnStyle(canNext1)}>
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 目标受众 */}
        {step === 2 && (
          <div>
            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                目标市场 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {markets.map(m => (
                  <button key={m} onClick={() => up('targetMarket', m)} style={btnStyle(form.targetMarket === m)}>{m}</button>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                目标收件人职位 <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roles.map(r => (
                  <button key={r} onClick={() => up('targetRole', r)} style={btnStyle(form.targetRole === r)}>{r}</button>
                ))}
              </div>
            </div>

            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>买家核心痛点</label>
              <textarea value={form.painPoints} onChange={e => up('painPoints', e.target.value)}
                placeholder="如：对供应商质量不稳定、交货期难以保证、沟通响应慢等方面有顾虑" rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            <div style={cardStyle}>
              <label style={{ display: 'block', fontSize: 13, color: '#6b7280', marginBottom: 4 }}>产品/公司核心优势</label>
              <textarea value={form.uniqueAdvantage} onChange={e => up('uniqueAdvantage', e.target.value)}
                placeholder="如：工厂直供价格优势、ISO认证、10年行业经验、72小时快速打样" rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: 13 }}>{error}</p>}
            <label style={{ ...privacyNoticeStyle, margin: '0 0 12px', display: 'flex', gap: 8, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={privacyConfirmed}
                onChange={e => setPrivacyConfirmed(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                我已移除密码、报价底价、客户隐私、未公开合同等敏感信息，并同意将上述内容发送给第三方 AI 诊断接口用于本次分析。
              </span>
            </label>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(1)} style={{ padding: '10px 20px', borderRadius: 8, background: 'transparent', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: 14 }}>
                ← 上一步
              </button>
              <button onClick={() => { void runDiagnosis() }} disabled={!canNext2 || loading} style={nextBtnStyle(canNext2 && !loading)}>
                {loading ? '⏳ AI 分析中...' : '🤖 开始 AI 诊断'}
              </button>
            </div>
          </div>
        )}

        {/* Report */}
        {step === 3 && report && (
          <div>
            {/* Overall score */}
            <div style={{ ...cardStyle, display: 'flex', gap: 20, alignItems: 'center' }}>
              <ScoreRing score={report.overallScore} size={90} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 16, fontWeight: 600 }}>综合转化诊断分</span>
                  <span style={{
                    fontSize: 12, padding: '2px 10px', borderRadius: 8, fontWeight: 600,
                    background: report.conversionPotential === '高' ? '#dcfce7' : report.conversionPotential === '中' ? '#fef3c7' : '#fee2e2',
                    color: report.conversionPotential === '高' ? '#166534' : report.conversionPotential === '中' ? '#92400e' : '#991b1b',
                  }}>转化潜力：{report.conversionPotential}</span>
                </div>
                <p style={{ fontSize: 13, color: '#4b5563', margin: 0, lineHeight: 1.7 }}>{report.executiveSummary}</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 12 }}>
              {[
                { label: '产品', val: form.productName.slice(0, 8) },
                { label: '目标市场', val: form.targetMarket },
                { label: '开信率', val: form.currentOpenRate ? form.currentOpenRate + '%' : '未知' },
                { label: '回复率', val: form.currentReplyRate ? form.currentReplyRate + '%' : '未知' },
              ].map(m => (
                <div key={m.label} style={{ background: '#f9fafb', borderRadius: 8, padding: '0.75rem 1rem' }}>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 4px' }}>{m.label}</p>
                  <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>{m.val}</p>
                </div>
              ))}
            </div>

            {/* Category scores */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 1rem' }}>八维度评分</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem 2rem' }}>
                {Object.entries(report.categories).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{categoryIcons[key]}</span>
                      <span style={{ fontSize: 13, color: '#4b5563' }}>{categoryLabels[key]}</span>
                    </div>
                    <ScoreBar score={val.score} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top issues */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 1rem' }}>关键问题诊断</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {report.topIssues.map((issue, i) => (
                  <div key={i} style={{
                    padding: '0.875rem', background: '#f9fafb', borderRadius: 8,
                    borderLeft: `3px solid ${issue.priority === 'P0' ? '#ef4444' : issue.priority === 'P1' ? '#f59e0b' : '#3b82f6'}`
                  }}>
                    <span style={{
                      display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '1px 8px', borderRadius: 6, marginBottom: 4,
                      background: issue.priority === 'P0' ? '#fee2e2' : issue.priority === 'P1' ? '#fef3c7' : '#dbeafe',
                      color: issue.priority === 'P0' ? '#991b1b' : issue.priority === 'P1' ? '#92400e' : '#1e40af',
                    }}>
                      {issue.priority === 'P0' ? '紧急' : issue.priority === 'P1' ? '重要' : '优化'}
                    </span>
                    <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 3px' }}>{issue.title}</p>
                    <p style={{ fontSize: 12, color: '#4b5563', margin: '0 0 3px', lineHeight: 1.6 }}>{issue.description}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>📈 {issue.impact}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 1rem' }}>各维度优化建议</h3>
              {Object.entries(report.categories).map(([key, val], i, arr) => (
                <div key={key} style={{ padding: '0.875rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 18, minWidth: 28 }}>{categoryIcons[key]}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{categoryLabels[key]}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: val.score >= 75 ? '#1D9E75' : val.score >= 50 ? '#BA7517' : '#E24B4A' }}>{val.score}分</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 3px' }}>⚠️ {val.issue}</p>
                      <p style={{ fontSize: 12, color: '#4b5563', margin: 0, lineHeight: 1.6 }}>💡 {val.suggestion}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rewrite sample */}
            {report.rewriteSample && (
              <div style={cardStyle}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 8px' }}>✨ 优化示例（开头片段）</h3>
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '0.875rem', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                  {report.rewriteSample}
                </div>
              </div>
            )}

            {/* Expected improvement */}
            {report.expectedImprovement && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>📈</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', margin: '0 0 2px' }}>预期优化效果</p>
                  <p style={{ fontSize: 13, color: '#166534', margin: 0, lineHeight: 1.6 }}>{report.expectedImprovement}</p>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center' }}>
              <button onClick={() => { setStep(0); setReport(null); setPrivacyConfirmed(false); setForm({ productName: '', industry: '', letterContent: '', currentOpenRate: '', currentReplyRate: '', targetMarket: '', targetRole: '', painPoints: '', uniqueAdvantage: '' }) }}
                style={{ padding: '10px 24px', borderRadius: 8, background: 'transparent', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: 13, color: '#6b7280' }}>
                🔄 重新诊断另一封开发信
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
