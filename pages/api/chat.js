// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const {
      message,
      model_type = "expert",       // default / expert / vision
      thinking_enabled = false,     // 是否开启深度思考
      search_enabled = true,        // 是否联网搜索
      session_id,                   // 传入可保持上下文
      files = [],                   // 识图时传 base64 图片
    } = req.body;

    const upstream = await fetch("https://4w4.dpdns.org/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,
        model_type,
        thinking_enabled,
        search_enabled,
        stream_type: "sse",         // ✅ 用 SSE 流式
        include_thinking: false,
        ...(session_id && { session_id }),
        ...(files.length && { files }),
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

      for (const line of raw.split('\n')) {
        if (!line.startsWith('data:')) continue;

        const text = line.slice(5).trim();

        if (text === '[DONE]') {
          res.write(`data: [DONE]\n\n`);
          res.end();
          return;
        }

        if (!text) continue;

        try {
          const data = JSON.parse(text);
          const content = data.content ?? data.response ?? data.delta ?? "";
          if (content) {
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch {
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
    }

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
