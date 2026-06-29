// 文件路径：pages/api/diagnose.js

const DIAGNOSE_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const DIAGNOSE_RATE_LIMIT_MAX = readPositiveInteger(
  'DIAGNOSE_RATE_LIMIT_MAX',
  5
)
const DIAGNOSE_LETTER_MAX_LENGTH = readPositiveInteger(
  'DIAGNOSE_LETTER_MAX_LENGTH',
  12000
)
const DIAGNOSE_FIELD_MAX_LENGTH = 300
const DIAGNOSE_API_TIMEOUT_MS = readPositiveInteger(
  'DIAGNOSE_API_TIMEOUT_MS',
  20000
)
const diagnoseRateLimitStore = new Map()

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '80kb'
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = req.body?.form
  if (!form || !form.letterContent) {
    return res.status(400).json({ error: '缺少开发信内容' })
  }

  const letterContent = normalizeText(
    form.letterContent,
    DIAGNOSE_LETTER_MAX_LENGTH + 1
  )

  if (letterContent.length > DIAGNOSE_LETTER_MAX_LENGTH) {
    return res.status(413).json({
      error: `开发信内容过长，请控制在 ${DIAGNOSE_LETTER_MAX_LENGTH} 字以内`
    })
  }

  const safeForm = {
    productName: normalizeText(form.productName, DIAGNOSE_FIELD_MAX_LENGTH),
    industry: normalizeText(form.industry, DIAGNOSE_FIELD_MAX_LENGTH),
    targetMarket: normalizeText(form.targetMarket, DIAGNOSE_FIELD_MAX_LENGTH),
    targetRole: normalizeText(form.targetRole, DIAGNOSE_FIELD_MAX_LENGTH),
    currentOpenRate: normalizeText(form.currentOpenRate, 20),
    currentReplyRate: normalizeText(form.currentReplyRate, 20),
    letterContent,
    painPoints: normalizeText(form.painPoints, 1000),
    uniqueAdvantage: normalizeText(form.uniqueAdvantage, 1000)
  }

  if (!process.env.BLAZEAI_API_KEY) {
    return res.status(503).json({
      error: '诊断服务暂未配置，请稍后再试'
    })
  }

  const clientIp = getClientIp(req)
  const userAgent = sanitizeValue(req.headers['user-agent'], 160)

  if (isRateLimited(clientIp, userAgent)) {
    res.setHeader('Retry-After', String(DIAGNOSE_RATE_LIMIT_WINDOW_MS / 1000))
    return res.status(429).json({
      error: '请求过于频繁，请稍后再试'
    })
  }

  const prompt = `你是一位外贸开发信转化率优化专家，请对以下开发信内容进行深度诊断分析。

产品名称：${safeForm.productName}
行业：${safeForm.industry}
目标市场：${safeForm.targetMarket}
目标职位：${safeForm.targetRole}
当前开信率：${safeForm.currentOpenRate || '未知'}%
当前回复率：${safeForm.currentReplyRate || '未知'}%
开发信内容：${safeForm.letterContent}
买家痛点：${safeForm.painPoints}
核心优势：${safeForm.uniqueAdvantage}

只输出纯JSON，不要有任何多余文字或markdown代码块，格式如下：
{"overallScore":75,"conversionPotential":"中","executiveSummary":"2-3句核心诊断结论","categories":{"headline":{"score":70,"issue":"主要问题","suggestion":"具体建议"},"valueProposition":{"score":65,"issue":"主要问题","suggestion":"具体建议"},"cta":{"score":60,"issue":"主要问题","suggestion":"具体建议"},"trustSignals":{"score":55,"issue":"主要问题","suggestion":"具体建议"},"painPoints":{"score":70,"issue":"主要问题","suggestion":"具体建议"},"personalization":{"score":50,"issue":"主要问题","suggestion":"具体建议"},"clarity":{"score":75,"issue":"主要问题","suggestion":"具体建议"},"urgency":{"score":45,"issue":"主要问题","suggestion":"具体建议"}},"topIssues":[{"priority":"P0","title":"关键问题标题","description":"详细说明","impact":"对转化率的影响"},{"priority":"P1","title":"重要问题标题","description":"详细说明","impact":"对转化率的影响"},{"priority":"P2","title":"优化建议标题","description":"详细说明","impact":"对转化率的影响"}],"rewriteSample":"开发信开头3-5句话的优化示例","expectedImprovement":"预计回复率提升幅度描述"}

注意：上方JSON只是格式模板，请根据实际开发信内容填写真实的诊断数据。`

  let timeout
  try {
    const controller = new AbortController()
    timeout = setTimeout(() => controller.abort(), DIAGNOSE_API_TIMEOUT_MS)
    const response = await fetch('https://blazeai.boxu.dev/api/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BLAZEAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'grok-4.1-fast',
        stream: false,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: '只输出纯JSON，不要有任何多余文字或markdown格式。' },
          { role: 'user', content: prompt }
        ],
      }),
    })
    clearTimeout(timeout)
    timeout = null

    const rawText = await response.text()
    if (process.env.NODE_ENV === 'development') {
      console.log('[diagnose] status:', response.status)
      console.log('[diagnose] raw:', rawText.slice(0, 300))
    }

    if (!response.ok) {
      console.warn('[diagnose] upstream failed:', response.status, rawText.slice(0, 200))
      return res.status(response.status === 429 ? 429 : 502).json({
        error:
          response.status === 429
            ? '诊断服务当前繁忙，请稍后再试'
            : '诊断服务暂时不可用，请稍后再试'
      })
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      console.warn('[diagnose] upstream response is not json:', rawText.slice(0, 200))
      return res.status(502).json({ error: '诊断服务返回异常，请稍后再试' })
    }

    const text = data.choices?.[0]?.message?.content || ''
    if (!text) {
      return res.status(500).json({ error: 'AI 返回内容为空' })
    }

    const clean = text.replace(/```json\n?|```\n?/g, '').trim()

    let parsed
    try {
      parsed = JSON.parse(clean)
    } catch {
      console.warn('[diagnose] ai output is not json:', clean.slice(0, 200))
      return res.status(502).json({ error: '诊断结果生成异常，请稍后再试' })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    if (err?.name === 'AbortError') {
      return res.status(504).json({ error: '诊断服务响应超时，请稍后再试' })
    }

    console.error('[diagnose] error:', err.message)
    return res.status(500).json({ error: '诊断服务请求失败，请稍后再试' })
  } finally {
    if (timeout) {
      clearTimeout(timeout)
    }
  }
}

function readPositiveInteger(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const sanitizeValue = (value, maxLength) => {
  return String(value || '')
    .replace(/[\r\n\t]/g, ' ')
    .slice(0, maxLength)
}

const normalizeText = (value, maxLength) => {
  return String(value || '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, maxLength)
}

const getClientIp = req => {
  return sanitizeValue(
    String(req.headers['x-forwarded-for'] || '').split(',')[0] ||
      req.socket?.remoteAddress,
    80
  )
}

const isRateLimited = (ip, userAgent) => {
  const key = `${ip || 'unknown'}:${userAgent || 'unknown'}`
  const now = Date.now()
  const current = diagnoseRateLimitStore.get(key)

  if (!current || now - current.startedAt > DIAGNOSE_RATE_LIMIT_WINDOW_MS) {
    cleanupRateLimitStore(now)
    diagnoseRateLimitStore.set(key, { startedAt: now, count: 1 })
    return false
  }

  current.count += 1
  return current.count > DIAGNOSE_RATE_LIMIT_MAX
}

const cleanupRateLimitStore = now => {
  for (const [key, value] of diagnoseRateLimitStore.entries()) {
    if (now - value.startedAt > DIAGNOSE_RATE_LIMIT_WINDOW_MS) {
      diagnoseRateLimitStore.delete(key)
    }
  }
}
