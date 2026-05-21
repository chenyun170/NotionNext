// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ✅ 换成 4w4.dpdns.org 的接口
  const client = new OpenAI({
    apiKey: "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",        // 改成 要求的 Token
    baseURL: "https://integrate.api.nvidia.com/v1", // OpenAI 兼容接口标准路径
  });

  try {
    const { message } = req.body;

    const stream = await client.chat.completions.create({
      model: "openai/gpt-oss-120b",  // ⚠️ 关键：改成文档里列出的模型名
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
      stream: true,
    });

    let fullContent = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullContent += content;
    }

    res.status(200).json({ result: fullContent });

  } catch (error) {
    console.error("API调用失败:", error);
    res.status(500).json({ error: error.message || error.toString() });
  }
}
