// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 不要 hardcode key，只用环境变量
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://newapi.lingrana.top/v1",
    });

    const completion = await client.chat.completions.create({
      model: "mimo-v2.5-pro",
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
    });

    res.status(200).json({ 
      result: completion.choices[0].message.content 
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ 
      error: error.message,
      status: error.status
    });
  }
}
