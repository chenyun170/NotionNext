// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, session_id, model_type = "expert", thinking_enabled = true } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    const response = await fetch('https://4w4.dpdns.org/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: message,
        model_type: model_type,           // default / expert / vision
        thinking_enabled: thinking_enabled,
        stream_type: "text",              // 先用 text，后面可升级为 sse
        include_thinking: false,
        session_id: session_id || undefined,   // 支持对话记忆
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 调用失败 ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    res.status(200).json({
      result: data.response || data.content || data.result || data,
      session_id: data.session_id,        // 返回 session_id 给前端保存
      thinking: data.thinking || null,    // 如果需要思考过程
    });

  } catch (error) {
    console.error("【API调用异常】", error);
    res.status(500).json({
      error: '服务器处理失败',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
