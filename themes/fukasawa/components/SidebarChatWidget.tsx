import { useState } from 'react';
import { Sparkles, Send, X } from 'lucide-react'; // 假设您项目里有lucide-react图标库，如果没有可以用文字代替

export default function SidebarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  // 发送消息的逻辑
  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setReply(''); // 清空旧回复

    try {
      // ✅ 这里请确保您已经配置好了后端的 /api/chat
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setReply(data.result || "抱歉，我暂时无法回答。");
    } catch (e) {
      setReply("请求出错，请稍后再试。");
    } finally {
      setLoading(false);
    }
  };

  // 如果处于关闭状态，显示“伪装”卡片
  if (!isOpen) {
    return (
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-100 group"
      >
        <div className="flex items-start gap-3">
          {/* 左侧圆形图标 (模仿您原本的数字标) */}
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Sparkles size={16} />
          </div>
          
          {/* 右侧文字 */}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-blue-600">
              AI 外贸小助手
            </h4>
            <p className="text-xs text-slate-400 line-clamp-2">
              遇到难题？点击这里，让我来帮您写邮件、查数据。
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 如果处于展开状态，显示聊天框
  return (
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-blue-100 relative">
      {/* 顶部标题栏 */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
          <Sparkles size={16} />
          <span>AI 助手在线</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
          <X size={16} />
        </button>
      </div>

      {/* 回复显示区 */}
      {reply && (
        <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-700 mb-3 leading-relaxed border border-slate-100 max-h-40 overflow-y-auto">
          {reply}
        </div>
      )}

      {/* 输入区 */}
      <div className="relative">
        <textarea
          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-blue-500 resize-none pr-8"
          rows={3}
          placeholder="请输入您的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="absolute bottom-2 right-2 text-blue-600 hover:text-blue-700 disabled:text-slate-300 transition-colors"
        >
          {loading ? <div className="animate-spin text-xs">...</div> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
