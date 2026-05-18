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
  "overallScore": <0-100的整数>,
  "conversionPotential": "<高/中/低>",
  "executiveSummary": "<2-3句核心诊断结论>",
  "categories": {
    "headline": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "valueProposition": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "cta": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "trustSignals": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "painPoints": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "personalization": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "clarity": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" },
    "urgency": { "score": <0-100>, "issue": "<主要问题>", "suggestion": "<具体建议>" }
  },
  "topIssues": [
    { "priority": "P0", "title": "<关键问题标题>", "description": "<详细说明>", "impact": "<对转化率的影响>" },
    { "priority": "P1", "title": "<重要问题标题>", "description": "<详细说明>", "impact": "<对转化率的影响>" },
    { "priority": "P2", "title": "<优化建议标题>", "description": "<详细说明>", "impact": "<对转化率的影响>" }
  ],
  "rewriteSample": "<基于诊断结果，给出开发信开头3-5句话的优化示例>",
  "expectedImprovement": "<经过优化后，预计回复率提升幅度的描述>"
}`

  try {
    const response = await fetch('https://blazeai.boxu.dev/api/chat/completions', {
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

    if (!response.ok) {
      const errText = await response.text()
      console.error('BlazeAI API error:', response.status, errText)
      return res.status(502).json({ error: `API 请求失败（${response.status}），请稍后重试` })
    }

    const data = await response.json()

    // OpenAI 格式：data.choices[0].message.content
    const text = data.choices?.[0]?.message?.content || ''
    const clean = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(clean)

    return res.status(200).json(parsed)
  } catch (err) {
    console.error('Diagnosis error:', err)
    return res.status(500).json({ error: '诊断分析失败，请稍后重试' })
  }
}
