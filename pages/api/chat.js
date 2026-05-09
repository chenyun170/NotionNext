// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { message } = req.body;

    // ✅ 换成 4w4 的接口格式（对应 Python 版的 payload）
    const upstream = await fetch("https://4w4.dpdns.org/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,
        model_type: "expert",
        thinking_enabled: false,
        stream_type: "sse",
        include_thinking: false,
      }),
    });

    if (!upstream.ok) {
      res.write(`data: ${JSON.stringify({ error: `上游错误 ${upstream.status}` })}\n\n`);
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const raw = decoder.decode(value);
      const lines = raw.split('\n');

      for (const line of lines) {
        // 剥掉 "data: " 前缀
        if (!line.startsWith('data:')) continue;
        const text = line.slice(5).trim();

        if (text === '[DONE]') {
          res.write(`data: [DONE]\n\n`);
          res.end();
          return;
        }

        if (!text) continue;

        // 解析上游 JSON，提取 content
        try {
          const data = JSON.parse(text);
          const content =
            data.content ?? data.response ?? data.delta ?? "";
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch {
          // 纯文本直接转发
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("调用失败:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
