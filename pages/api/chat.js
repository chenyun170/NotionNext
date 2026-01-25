// /api/chat.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // 1. 安全检查
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. 配置新的接口地址 (从你的DevTools截图提取)
  const client = new OpenAI({
    apiKey: "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", // 对应截图里的 API Token
    baseURL: "https://api-proxy.de/openai/v1", // ✅ 截图3里的真实地址
  });

  try {
    const { message } = req.body;

    // 3. 发起流式请求 (这是最关键的一步)
    const stream = await client.chat.completions.create({
      // ⚠️ 重点：模型名字。建议先填截图示例里的 "gpt-4.1-mini" 试试
      // 如果报错 404，就改成 "glm-4" 或 "[Z] GLM-4.7"
      model: "gpt-4.1-mini-2025-04-14", 
      
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: message }
      ],
      
      // ✅ 截图强制要求：必须开启流式
      stream: true, 
      
      // 💡 可选参数：根据截图，false 代表标准 OpenAI 流，这正好兼容 SDK
      // 如果 SDK 报错，可能需要手动加 extra_body: { onlyText: false }
    });

    // 4. 后端拼接流数据
    // 因为接口强制流式，但你的前端可能还在等一个完整的 JSON
    // 所以我们在服务器端把流“接完”，拼成一整句话
    let fullContent = "";
    
    for await (const chunk of stream) {
      // 取出每一小块的内容，拼接到大字符串里
      const content = chunk.choices[0]?.delta?.content || "";
      fullContent += content;
    }

    // 5. 拼装完成，一次性返回给前端
    res.status(200).json({ result: fullContent });

  } catch (error) {
    console.error("API调用失败:", error);
    res.status(500).json({ error: error.message || error.toString() });
  }
}
