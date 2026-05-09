// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const client = new OpenAI({
    apiKey: "12345asd",
    baseURL: "https://2pi.dyy.gv.uy/v1",
  });

  // ✅ 改1：设置 SSE 响应头
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { message } = req.body;

    const stream = await client.chat.completions.create({
      model: "grok-4.1-fast",
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
      stream: true,
    });

    // ✅ 改2：每块立即推出去，不再拼接等待
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // ✅ 改3：发结束信号
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error("API调用失败:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
}
