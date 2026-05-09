import requests
import time
import json

def chat_stream(prompt, model_type="default", thinking=False, max_retries=3):
    url = "https://4w4.dpdns.org/chat"
    
    payload = {
        "prompt": prompt,
        "model_type": model_type,
        "thinking_enabled": thinking,
        "stream_type": "text",      # 改成 "sse" 可能更流畅，但先用 text
        "include_thinking": False
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(url, json=payload, timeout=40, stream=True)
            
            if response.status_code == 200:
                print("🤖 开始流式输出：\n")
                full_response = ""
                
                for chunk in response.iter_lines():
                    if chunk:
                        try:
                            # 尝试解析
                            text = chunk.decode('utf-8')
                            if text.strip():
                                # 有些接口会直接返回纯文本，有些是 JSON
                                if text.startswith('{'):
                                    data = json.loads(text)
                                    delta = data.get('response') or data.get('content') or text
                                else:
                                    delta = text
                                
                                print(delta, end="", flush=True)
                                full_response += delta
                        except:
                            # 如果解析失败，直接打印原始内容
                            print(chunk.decode('utf-8'), end="", flush=True)
                
                print("\n\n✅ 输出完成")
                return full_response
                
            else:
                print(f"状态码错误: {response.status_code}")
                
        except Exception as e:
            print(f"第 {attempt+1} 次尝试失败: {e}")
        
        if attempt < max_retries - 1:
            wait = 2 ** attempt
            print(f"{wait}秒后重试...")
            time.sleep(wait)
    
    print("❌ 接口暂时无法连接，请稍后再试或更换API")
    return None


# ==================== 使用示例 ====================
if __name__ == "__main__":
    user_input = input("请输入你的问题: ")
    chat_stream(user_input, model_type="expert", thinking=False)
