// 诊断端点：列出当前 API Key 可访问的模型 id（只返回模型名，不含任何凭据）
import { createChatClient } from '@/lib/ai/nvidiaChat'

const getConfiguredToken = () =>
  process.env.MODELS_DIAG_TOKEN ||
  process.env.CACHE_API_TOKEN ||
  process.env.API_TOKEN

const getRequestToken = req => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : ''

  return req.headers['x-api-token'] || bearerToken
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const configuredToken = getConfiguredToken()
  if (process.env.NODE_ENV !== 'development') {
    if (!configuredToken) {
      return res.status(503).json({ error: 'Diag API token is not configured' })
    }
    if (getRequestToken(req) !== configuredToken) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  } else if (configuredToken && getRequestToken(req) !== configuredToken) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: '聊天服务暂未配置，请稍后再试' })
  }
  const client = createChatClient(30000)
  try {
    // ?probe=MODEL 对指定模型发一个最小请求，实测是否可调用（不只列出）
    const probe = req.query.probe
    if (probe) {
      try {
        await client.chat.completions.create({
          model: String(probe),
          messages: [{ role: 'user', content: 'hi' }],
          max_tokens: 8,
          stream: false
        })
        return res.status(200).json({ ok: true, model: probe })
      } catch (e) {
        return res.status(200).json({
          ok: false,
          model: probe,
          code: e?.status || e?.statusCode || null,
          type: e?.name || null
        })
      }
    }
    const list = await client.models.list()
    const ids = (list.data || []).map(m => m.id).sort()
    return res.status(200).json({ count: ids.length, models: ids })
  } catch (error) {
    console.error('[models] failed:', error?.name, error?.status)
    return res.status(502).json({
      error: '模型列表获取失败',
      code: error?.status || error?.statusCode || null,
      type: error?.name || null
    })
  }
}
