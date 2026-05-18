// 文件路径：pages/api/diagnose.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { form } = req.body
  if (!form || !form.letterContent) {
    return res.status(400).json({ error: '缺少开发信内容' })
  }

  const prompt = `你是一位外贸开发信转化率优化专家，请对以下开发信内容进行深度诊断分析。

产品名称：${form.productName}
行业：${form.industry}
目标市场：${form.targetMarket}
目标职位：${form.targetRole}
当前开信率：${form.currentOpenRate || '未知'}%
当前回复率：${form.currentReplyRate || '未知'}%
开发信内容：${form.letterContent}
买家痛点：${form.painPoints}
核心优势：${form.uniqueAdvantage}

只输出纯JSON，不要有任何多余文字或markdown代码块，格式如下：
{"overallScore":75,"conversionPotential":"中","executiveSummary":"2-3句核心诊断结论","categories":{"headline":{"score":70,"issue":"主要问题","suggestion":"具体建议"},"valueProposition":{"score":65,"issue":"主要问题","suggestion":"具体建议"},"cta":{"score":60,"issue":"主要问题","suggestion":"具体建议"},"trustSignals":{"score":55,"issue":"主要问题","suggestion":"具体建议"},"painPoints":{"score":70,"issue":"主要问题","suggestion":"具体建议"},"personalization":{"score":50,"issue":"主要问题","suggestion":"具体建议"},"clarity":{"score":75,"issue":"主要问题","suggestion":"具体建议"},"urgency":{"score":45,"issue":"主要问题","suggestion":"具体建议"}},"topIssues":[{"priority":"P0","title":"关键问题标题","description":"详细说明","impact":"对转化率的影响"},{"priority":"P1","title":"重要问题标题","description":"详细说明","impact":"对转化率的影响"},{"priority":"P2","title":"优化建议标题","description":"详细说明","impact":"对转化率的影响"}],"rewriteSample":"开发信开头3-5句话的优化示例","expectedImprovement":"预计回复率提升幅度描述"}

注意：上方JSON只是格式模板，请根据实际开发信内容填写真实的诊断数据。`

  try {
    const response = await fetch('https://blazeai.boxu.dev/api/chat/completions', {
      method: 'POST',
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

    const rawText = await response.text()
    console.log('[diagnose] status:', response.status)
    console.log('[diagnose] raw:', rawText.slice(0, 300))

    if (!response.ok) {
      return res.status(502).json({ error: `API错误 ${response.status}: ${rawText.slice(0, 150)}` })
    }

    let data
    try {
      data = JSON.parse(rawText)
    } catch {
      return res.status(500).json({ error: `响应解析失败: ${rawText.slice(0, 150)}` })
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
      return res.status(500).json({ error: `AI输出不是合法JSON: ${clean.slice(0, 150)}` })
    }

    return res.status(200).json(parsed)

  } catch (err) {
    console.error('[diagnose] error:', err.message)
    return res.status(500).json({ error: `请求失败: ${err.message}` })
  }
}
