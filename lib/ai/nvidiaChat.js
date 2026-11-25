import OpenAI from 'openai'

// 已知不可用/挂起模型直接忽略，落到实测可用的免费层稳定模型
const UNAVAILABLE_CHAT_MODELS =
  /minimax|llama-3\.3-70b|llama-3\.1-8b|qwen2\.5-72b|gemma|glm-5\.3|kimi-k3\.1|step-5/i

/**
 * 解析当前可用的对话模型，屏蔽已知挂起或已下线的模型 ID。
 * @returns {string}
 */
export const resolveChatModel = () => {
  const configured = process.env.CHAT_MODEL
  if (configured && !UNAVAILABLE_CHAT_MODELS.test(configured)) {
    return configured
  }
  return process.env.CHAT_MODEL_FALLBACK || 'nvidia/nemotron-3.5-bolt-e4b'
}

/**
 * 创建 OpenAI 兼容客户端（默认指向 NVIDIA NIM 接口）。
 * @param {number} timeout
 * @returns {OpenAI}
 */
export const createChatClient = timeout =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL:
      process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    timeout,
    maxRetries: 1
  })

/**
 * 从请求头或 socket 提取客户端 IP。
 * @param {import('next').NextApiRequest} req
 * @returns {string}
 */
export const getClientIp = req => {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim()
  }
  return req.socket?.remoteAddress || 'unknown'
}

/**
 * 创建基于内存 Map 的进程内 IP 限流器（附带过期键清理防内存增长）。
 * @param {{ windowMs: number, maxRequests: number, maxEntries?: number }} options
 */
export const createIpRateLimiter = ({
  windowMs,
  maxRequests,
  maxEntries = 5000
}) => {
  const store = new Map()

  return ip => {
    const now = Date.now()
    const current = store.get(ip)

    if (!current || now - current.startedAt > windowMs) {
      if (store.size > maxEntries) {
        for (const [key, value] of store) {
          if (now - value.startedAt > windowMs) {
            store.delete(key)
          }
        }
      }
      store.set(ip, { startedAt: now, count: 1 })
      return false
    }

    current.count += 1
    return current.count > maxRequests
  }
}
