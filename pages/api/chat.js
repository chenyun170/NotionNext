// /api/chat.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息不能为空' });
    }

    console.log("正在调用API，消息:", message.substring(0, 50) + "...");

    const response = await fetch('https://4w4.dpdns.org/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; YourApp/1.0)',  // 模拟浏览器
      },
      body: JSON.stringify({
        prompt: message,
        model_type: "default",        // 用 default 最稳定
        thinking_enabled: false,      // 先关闭思考
        stream_type: "text"
      }),
      // 增加超时时间
      signal: AbortSignal.timeout(30000),   // 30秒超时
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API错误:", response.status, errorText);
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const resultText = data.response || data.content || data.result || 
                      (typeof data === 'string' ? data : JSON.stringify(data));

    res.status(200).json({ 
      result: resultText 
    });

  } catch (error) {
    console.error("调用4w4 API失败:", error.message);
    
    res.status(200).json({ 
      result: "AI助手暂时无法连接，请稍后重试～" 
    });
  }
}
