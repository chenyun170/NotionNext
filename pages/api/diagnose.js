// 文件路径：pages/api/diagnose.js
// 使用 BlazeAI 第三方 API（兼容 OpenAI 格式）

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { form } = req.body

  if (!form || !form.letterContent) {
    return res.status(400).json({ error: '缺少开发信内容' })
  }

  const prompt = `你是一位外贸开发信转化率优化专家，请对以下开发信落地页内容进行深度诊断分析。

【产品/公司信息】
产品名称：${form.productName}
行业：${form.industry}
目标市场：${form.targetMarket}
目标职位：${form.targetRole}
当前开信率：${form.currentOpenRate || '未知'}%
当前回复率：${form.currentReplyRate || '未知'}%

【开发信内容】
${form.letterContent}

【买家痛点】
${form.painPoints}

【核心优势】
${form.uniqueAdvantage}

请严格按照以下JSON格式返回诊断报告，不要包含任何其他文字、不要有markdown代码块：
{
  "overallScore": 75,
  "conversionPotential": "中",
  "executiveSummary": "诊断结论示例",
  "categories": {
    "headline": { "score": 70, "issue": "问题", "suggestion": "建议" },
    "valueProposition": { "score": 65, "issue": "问题", "suggestion": "建议" },
    "cta": { "score": 60, "issue": "问题", "suggestion": "建议" },
    "trustSignals": { "score": 55, "issue": "问题", "suggestion": "建议" },
    "painPoints": { "score": 70, "issue": "问题", "suggestion": "建议" },
    "personalization": { "score": 50, "issue": "问题", "suggestion": "建议" },
    "clarity": { "score": 75, "issue": "问题", "suggestion": "建议" },
    "urgency": { "score": 45, "issue": "问题", "suggestion": "建议" }
  },
  "topIssues": [
    { "priority": "P0", "title": "问题标题", "description": "详细说明", "impact": "影响" },
    { "priority": "P1", "title": "问题标题", "description": "详细说明", "impact": "影响" },
    { "priority": "P2", "title": "问题标题", "description": "详细说明", "impact": "影响" }
  ],
  "rewriteSample": "优化示例",
  "expectedImprovement": "预期提升"
}

注意：上方JSON只是格式示例，请根据实际开发信内容填写真实的诊断数据。`

  // 依次尝试可能的 endpoint 路径
  const endpoints = [
    'https://blazeai.boxu.dev/api/chat/completions',
    'https://blazeai.boxu.dev/v1/chat/completions',
  ]

  let lastError = '未知错误'

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BLAZEAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'grok-4.1-fast',
          max_tokens: 2000,
          messages: [
            {
              role: 'system',
              content: '你是一位专业的外贸开发信转化率优化专家。只输出纯 JSON，不要有任何多余文字或 markdown 格式。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
        }),
      })

      // 先拿原始文本，方便调试
      const rawText = await response.text()
      console.log(`[diagnose] endpoint: ${endpoint}`)
      console.log(`[diagnose] status: ${response.status}`)
      console.log(`[diagnose] raw (500 chars): ${rawText.slice(0, 500)}`)

      if (!response.ok) {
        lastError = `HTTP ${response.status}: ${rawText.slice(0, 200)}`
        continue
      }

      if (!rawText || rawText.trim() === '') {
        lastError = 'API 返回空内容'
        continue
      }

      // 解析外层 OpenAI 格式
      let data
      try {
        data = JSON.parse(rawText)
      } catch {
        lastError = `外层响应不是合法 JSON: ${rawText.slice(0, 200)}`
        continue
      }

      const text = data.choices?.[0]?.message?.content || ''
      if (!text) {
        lastError = `choices 内容为空，完整响应: ${rawText.slice(0, 300)}`
        continue
      }

      // 清理并解析 AI 返回的 JSON
      const clean = text.replace(/```json\n?|```\n?/g, '').trim()
      let parsed
      try {
        parsed = JSON.parse(clean)
      } catch {
        lastError = `AI 返回内容无法解析为 JSON: ${clean.slice(0, 300)}`
        continue
      }

      return res.status(200).json(parsed)

    } catch (err) {
      lastError = err.message
      console.error(`[diagnose] fetch error at ${endpoint}:`, err.message)
    }
  }

  // 所有 endpoint 都失败
  console.error('[diagnose] All endpoints failed. Last error:', lastError)
  return res.status(500).json({ error: `诊断失败：${lastError}` })
}
