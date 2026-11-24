// 文件路径：pages/api/opportunity.js
// 首页「5 秒看商机」：输入产品词，快速用 AI 判断这个品类还有没有商机。
// 复用站内 AI 参谋配置（OPENAI_API_KEY / OPENAI_BASE_URL / CHAT_MODEL），非流式、小输出上限，保证响应快。
import OpenAI from 'openai'

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = Number(process.env.OPPORTUNITY_RATE_LIMIT_MAX) || 20
const PRODUCT_MAX_LENGTH = Number(
  process.env.OPPORTUNITY_PRODUCT_MAX_LENGTH
) || 100
const TIMEOUT_MS = Number(process.env.OPPORTUNITY_TIMEOUT_MS) || 45000
const MAX_TOKENS = Number(process.env.OPPORTUNITY_MAX_TOKENS) || 1500

const rateLimitStore = new Map()

// 免费 NVIDIA 账号下 minimax 不可用（挂起/限流），自动改用免费层开放的 llama
// 环境变量 CHAT_MODEL 可覆盖；若仍想用 minimax 之外的模型可用 CHAT_MODEL_FALLBACK 指定
const resolveChatModel = () => {
  const configured = process.env.CHAT_MODEL
  // 已知不可用/挂起模型直接忽略，落到实测可用的免费层稳定模型
  const UNAVAILABLE = /minimax|llama-3\.3-70b|llama-3\.1-8b|qwen2\.5-72b|gemma|glm-5\.3|kimi-k3\.1|step-5/i
  if (configured && !UNAVAILABLE.test(configured)) return configured
  return process.env.CHAT_MODEL_FALLBACK || 'nvidia/nemotron-3.5-bolt-e4b'
}

const getClientIp = req => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

const isRateLimited = ip => {
  const now = Date.now()
  const current = rateLimitStore.get(ip)
  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    if (rateLimitStore.size > 5000) {
      for (const [key, value] of rateLimitStore) {
        if (now - value.startedAt > RATE_LIMIT_WINDOW_MS)
          rateLimitStore.delete(key)
      }
    }
    rateLimitStore.set(ip, { startedAt: now, count: 1 })
    return false
  }
  current.count += 1
  return current.count > RATE_LIMIT_MAX
}

const sanitizeProduct = value => {
  return String(value || '')
    .replace(/\r/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, PRODUCT_MAX_LENGTH)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (isRateLimited(getClientIp(req))) {
    res.setHeader('Retry-After', String(RATE_LIMIT_WINDOW_MS / 1000))
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' })
  }

  const product = sanitizeProduct(req.body?.product)
  if (!product) {
    return res.status(400).json({ error: '请输入产品词，比如 LED 灯、轴承' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: '商机分析暂未配置，请稍后再试' })
  }

  const prompt = `你是一位资深外贸市场分析师，熟悉海关数据、进口商网络和 B2B 获客。

用户想快速判断「${product}」这个品类还有没有外贸商机。

请用简洁的纯文本（不要用 markdown 的 **、#、- 等符号，不要用列表符号，直接用短句和换行）给出 5-7 行分析，覆盖：
1. 商机判断：这个品类现在还有没有机会，一句话给结论（有机会 / 机会一般 / 竞争激烈需差异化）
2. 谁在进口：典型进口国 / 买家的方向
3. 采购信号：怎么判断哪些是真买家（海关数据、采购频率、供应商）
4. 切入建议：给一条最具体的下一步动作
5. 一句风险提示

要求：只输出分析正文，不要任何开头结尾的客套话，不要用编号符号，每行是一句完整的话。`

  const controller = new AbortController()
  const onClose = () => controller.abort()
  res.once('close', onClose)
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    timeout: TIMEOUT_MS,
    maxRetries: 1
  })

  try {
    const completion = await client.chat.completions.create(
      {
        model: resolveChatModel(),
        messages: [
          {
            role: 'system',
            content:
              '你是外贸市场分析助手，回答简洁、具体、可执行，只用纯文本。'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.5,
        stream: false
      },
      { signal: controller.signal }
    )

    if (res.destroyed || res.writableEnded) return
    controller.signal.throwIfAborted()

    const text = completion?.choices?.[0]?.message?.content || ''
    if (!text.trim()) {
      return res.status(500).json({ error: 'AI 返回内容为空' })
    }

    return res.status(200).json({
      ok: true,
      product,
      analysis: text.trim(),
      model: resolveChatModel()
    })
  } catch (error) {
    if (res.destroyed || res.writableEnded) return
    if (controller.signal.aborted) {
      return res.status(504).json({ error: '商机分析超时，请稍后再试' })
    }
    console.error('[opportunity] upstream failed:', error?.message)
    return res.status(502).json({
      error: '商机分析暂时不可用，请稍后再试',
      code: error?.status || error?.statusCode || null,
      type: error?.name || null
    })
  } finally {
    clearTimeout(timer)
    res.off('close', onClose)
  }
}
