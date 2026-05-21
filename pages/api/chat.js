// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 校验请求体
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: '缺少 message 参数' });
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  try {
    // 设置 SSE 流式响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await client.chat.completions.create({
      model: "nvidia/llama-3.1-nemotron-70b-instruct", // ⚠️ 改成你实际有权限的模型名
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 流结束标志
    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    console.error("API 调用失败:", error);

    // 如果头还没发送，返回 JSON 错误
    if (!res.headersSent) {
      res.status(500).json({ error: error.message || error.toString() });
    } else {
      // 头已发送，只能通过流告知错误
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}
