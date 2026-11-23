// /api/chat.js
import OpenAI from 'openai'

// 简单的进程内限流：单个实例按 IP 计数。
// Vercel 上每个实例独立计数，不能当作强防护，但足以挡住直接脚本刷额度。
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = Number(process.env.CHAT_RATE_LIMIT_MAX) || 12
const MESSAGE_MAX_LENGTH = Number(process.env.CHAT_MESSAGE_MAX_LENGTH) || 4000
const HISTORY_MAX_MESSAGES = 12
const chatRateLimitStore = new Map()

const getClientIp = req => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

const isRateLimited = ip => {
  const now = Date.now()
  const current = chatRateLimitStore.get(ip)
  if (!current || now - current.startedAt > RATE_LIMIT_WINDOW_MS) {
    chatRateLimitStore.set(ip, { startedAt: now, count: 1 })
    return false
  }
  current.count += 1
  if (chatRateLimitStore.size > 5000) {
    for (const [key, value] of chatRateLimitStore) {
      if (now - value.startedAt > RATE_LIMIT_WINDOW_MS)
        chatRateLimitStore.delete(key)
    }
  }
  return current.count > RATE_LIMIT_MAX
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (isRateLimited(getClientIp(req))) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' })
  }
  // 校验请求体
  const { message, history } = req.body || {}
  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: '缺少 message 参数' })
  }
  if (message.length > MESSAGE_MAX_LENGTH) {
    return res
      .status(413)
      .json({ error: `内容过长，请控制在 ${MESSAGE_MAX_LENGTH} 字以内` })
  }

  // 组装上下文：system + 历史对话（仅保留 user/assistant，单条截断防超限）+ 当前问题
  const buildMessages = () => {
    const system = {
      role: 'system',
      content:
        '你是一个乐于助人的 AI 助手。请完整回答用户的问题，不要截断内容。回答时请结合对话历史中的上下文，保持话题连贯。'
    }
    const historyMessages = (Array.isArray(history) ? history : [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .slice(-HISTORY_MAX_MESSAGES)
      .map(m => ({
        role: m.role,
        content: String(m.content || '').slice(0, 4000)
      }))
    return [system, ...historyMessages, { role: 'user', content: message }]
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: '聊天服务暂未配置，请稍后再试' })
  }

  const controller = new AbortController()
  const canWrite = () => !res.writableEnded && !res.destroyed
  const onClose = () => controller.abort()
  res.once('close', onClose)
  const timer = setTimeout(() => {
    controller.abort()
    if (canWrite()) {
      res.end(
        `data: ${JSON.stringify({ error: '请求超时，请重试' })}\n\ndata: [DONE]\n\n`
      )
    }
  }, 120000)

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL:
      process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    timeout: 115000,
    maxRetries: 1
  })

  try {
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const stream = await client.chat.completions.create(
      {
        model:
          process.env.CHAT_MODEL || 'minimaxai/minimax-m3.1-flash',
        // 使用文本对话模型，生产环境可通过 CHAT_MODEL 覆盖。
        messages: buildMessages(),
        // 提高输出上限：长邮件、分析报告不再被模型默认上限截断；gpt-oss-120b 最大输出 8192 tokens，可通过环境变量 MAX_TOKENS 覆盖
        max_tokens: Number(process.env.MAX_TOKENS) || 8192,
        temperature: 0.7,
        stream: true
      },
      { signal: controller.signal }
    )
    for await (const chunk of stream) {
      if (controller.signal.aborted || !canWrite()) return
      const content = chunk.choices[0]?.delta?.content || ''
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`)
      }
    }
    if (!controller.signal.aborted && canWrite()) {
      res.end('data: [DONE]\n\n')
    }
  } catch (error) {
    if (controller.signal.aborted || !canWrite()) return
    console.error('[chat] upstream failed:', error?.name, error?.status)
    const errorMessage = '聊天服务暂时不可用，请稍后再试'
    if (!res.headersSent) {
      res.status(502).json({ error: errorMessage })
    } else {
      res.end(
        `data: ${JSON.stringify({ error: errorMessage })}\n\ndata: [DONE]\n\n`
      )
    }
  } finally {
    clearTimeout(timer)
    res.off('close', onClose)
  }
}
