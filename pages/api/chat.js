// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { message } = req.body;

  try {
    const upstream = await fetch("https://4w4.dpdns.org/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: message,
        stream_type: "sse",
      }),
    });

    if (!upstream.ok) {
      res.write(`data: ${JSON.stringify({ error: "上游请求失败" })}\n\n`);
      res.end();
      return;
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data:')) continue;

        const text = line.slice(5).trim();
        if (text === '[DONE]' || !text) continue;

        try {
          const data = JSON.parse(text);
          const content = data.content ?? data.response ?? "";
          if (content) res.write(`data: ${JSON.stringify({ content })}\n\n`);
        } catch {
          res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
        }
      }
    }

  } catch (error) {
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
  }

  res.write(`data: [DONE]\n\n`);
  res.end();
}
