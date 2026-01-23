
// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // 1. 安全检查：只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 初始化 OpenAI，但用的是 Poixe 的地址
  // 注意：API Key 放在服务器端，用户看不到
  const client = new OpenAI({
    apiKey: "sk-9e2e8315827f2df74e171b06cb781d51", // 建议以后放在环境变量里
    baseURL: "https://api.siliconflow.cn/v1",
  });

  try {
    const { message } = req.body;

    // 3. 调用 AI 模型
    const completion = await client.chat.completions.create({
      model: "qwen3-max", // 截图中的免费模型名称
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message } // 使用前端传来的消息
      ],
    });

    // 4. 把结果返回给前端
    res.status(200).json({ result: completion.choices[0].message.content });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI 思考时出错了' });
  }
}
