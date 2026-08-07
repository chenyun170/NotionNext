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

    // 请求级超时保护：60s 无响应则中断，避免客户端一直等待
    const timer = setTimeout(() => {
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: '请求超时，请重试' })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }, 60000);

    const stream = await client.chat.completions.create({
      model: process.env.CHAT_MODEL || "openai/gpt-oss-120b", // ⚠️ 改成你实际有权限的模型名
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。请完整回答用户的问题，不要截断内容。" },
        { role: "user", content: message }
      ],
      // 提高输出上限：长邮件、分析报告不再被模型默认上限截断
      max_tokens: 4096,
      temperature: 0.7,
      stream: true,
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    // 流结束标志
    if (!res.writableEnded) {
      res.write('data: [DONE]\n\n');
      res.end();
    }
    clearTimeout(timer);
  } catch (error) {
    console.error("API 调用失败:", error);
    clearTimeout(timer);
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
