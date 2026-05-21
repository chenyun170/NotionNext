// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;
    
    // 简化测试：先不用 stream
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "sk-NYShgZ3c6GuXvxUyDv8H7OZLZr7mtjss9BfdnLoM3sLk0YBo",
      baseURL: "https://newapi.lingrana.top/v1",
    });

    const completion = await client.chat.completions.create({
      model: "mimo-v2.5-pro",
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
      // 暂时去掉 stream: true
    });

    res.status(200).json({ 
      result: completion.choices[0].message.content 
    });

  } catch (error) {
    // 打印详细错误
    console.error("完整错误:", JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: error.message,
      code: error.code,
      type: error.type 
    });
  }
}
