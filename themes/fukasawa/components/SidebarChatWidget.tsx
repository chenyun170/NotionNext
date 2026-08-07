import { useState } from 'react';
import dynamic from 'next/dynamic';

// 独立客服式对话框（弹窗）
const ChatModal = dynamic(() => import('./ChatModal'), {
  ssr: false,
  loading: () => null,
});

/**
 * AI 参谋入口卡片
 * 点击后弹出独立客服式对话框，不再挤在侧边栏内
 */
export default function SidebarChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 入口卡片：点击弹出独立对话框 */}
      <div
        onClick={() => setIsOpen(true)}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-transparent hover:border-blue-100 group"
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

          <i className="fas fa-external-link-alt text-xs text-blue-400/70 mt-1 shrink-0"></i>
        </div>
      </div>

      {/* 独立客服式对话框 */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
