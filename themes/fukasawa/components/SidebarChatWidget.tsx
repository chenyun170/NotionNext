import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SidebarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // ✅ 改为多轮对话历史
  const [loading, setLoading] = useState(false);
  const replyRef = useRef(null);

  // ✅ 自动滚动到底部
  useEffect(() => {
    if (replyRef.current) {
      replyRef.current.scrollTop = replyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // ✅ 加入用户消息
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    // ✅ 先占位 AI 消息
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }), // ✅ 传完整历史
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const raw = decoder.decode(value);

        for (const line of raw.split('\n')) {
          if (!line.startsWith('data:')) continue;
          const text = line.slice(5).trim();

          if (text === '[DONE]') {
            done = true; // ✅ 正确跳出 while 循环
            break;
          }
          if (!text) continue;

          try {
            const { content } = JSON.parse(text);
            if (content) {
              // ✅ 追加到最后一条 AI 消息
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + content,
                };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: '请求出错，请稍后再试。',
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-100 group mt-4"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <i className="fas fa-robot text-sm"></i>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
              AI 外贸小助手
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2">
              点击这里，让我帮您写邮件、查数据。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-lg border border-blue-100 dark:border-zinc-700 relative mt-4">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm">
          <i className="fas fa-robot"></i>
          <span>AI 助手在线</span>
        </div>
        <button
          onClick={() => { setIsOpen(false); setMessages([]); }} // ✅ 关闭时清空历史
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>

      {/* ✅ 多轮对话气泡展示 */}
      <div
        ref={replyRef}
        className="flex flex-col gap-2 mb-3 max-h-52 overflow-y-auto"
      >
        {messages.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-4">有什么可以帮您？</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-xs rounded-lg px-3 py-2 leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 self-end ml-4'
                : 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 self-start mr-4 border border-slate-100 dark:border-zinc-700'
            }`}
          >
            {msg.role === 'assistant' ? (
              msg.content ? (
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...props }) => <span className="font-bold text-slate-900 dark:text-white" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside my-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                // ✅ AI 回复加载中占位
                <span className="text-slate-400 animate-pulse">正在思考中...</span>
              )
            ) : (
              msg.content
            )}
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 resize-none pr-8 dark:text-slate-200"
          rows={3}
          placeholder="请输入您的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !loading) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="absolute bottom-2 right-2 text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-colors"
        >
          {loading
            ? <i className="fas fa-spinner fa-spin text-xs"></i>
            : <i className="fas fa-paper-plane"></i>
          }
        </button>
      </div>
    </div>
  );
}
