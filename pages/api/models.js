// 临时诊断端点：列出当前 API Key 可访问的模型 id（只返回模型名，不含任何凭据）
import OpenAI from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: '聊天服务暂未配置，请稍后再试' })
  }
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL:
      process.env.OPENAI_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    timeout: 30000,
    maxRetries: 1
  })
  try {
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
