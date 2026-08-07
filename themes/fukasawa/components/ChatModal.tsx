'use client'

import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'

/**
 * AI 参谋对话框
 * 底部中央弹出，支持桌面和移动端
 * 受控于外部的 isOpen / onClose
 */
interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [input, setInput] = useState('')
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<ChatMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 每次打开时自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // 每次新回复出现时滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [reply, history])

  // ESC 关闭
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg = input.trim()
    setInput('')
    setLoading(true)
    setReply('')

    // 将用户消息加入历史
    setHistory(prev => [...prev, { role: 'user', text: userMsg }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      if (!response.body) throw new Error('Response body is null')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let fullReply = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split('\n')) {
          if (!line.startsWith('data:')) continue
          const text = line.slice(5).trim()
          if (text === '[DONE]') break
          if (!text) continue
          try {
            const { content } = JSON.parse(text)
            if (content) {
              fullReply += content
              setReply(fullReply)
            }
          } catch (_) { /* skip malformed */ }
        }
      }

      // 将助手回复加入历史
      if (fullReply) {
        setHistory(prev => [...prev, { role: 'assistant', text: fullReply }])
      }
      setReply('')
    } catch (e) {
      console.error(e)
      const errMsg = '请求出错，请稍后再试。'
      setHistory(prev => [...prev, { role: 'assistant', text: errMsg }])
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[200]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 对话框主体 */}
      <div
        className="fixed z-[201] flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-300"
        style={{
          // 桌面端居中偏下，移动端全宽贴底
          width: 'min(480px, calc(100vw - 24px))',
          height: 'min(600px, calc(100vh - 80px))',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="AI 参谋对话框"
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm shadow-sm">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 leading-tight">AI 参谋</p>
              <p className="text-[10px] text-zinc-400 leading-tight">外贸获客 · 邮件 · 数据查询</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 清空历史 */}
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                title="清空对话"
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="关闭"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar">
          {history.length === 0 && !loading && !reply && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 text-xl shadow-sm">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">您好，我是 AI 参谋</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-[240px]">
                  可以帮您写外贸邮件、查询海关数据、找客户、分析市场
                </p>
              </div>
              {/* 快捷提示 */}
              <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                {[
                  '写一封开发信',
                  '查询 LED 进口商',
                  '找俄罗斯采购商',
                  '海关数据 HS 查询',
                ].map(hint => (
                  <button
                    key={hint}
                    onClick={() => setInput(hint)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {history.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-md'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-bl-md'
                }`}
              >
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...p }) => (
                      <span className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-zinc-900 dark:text-white'}`} {...p} />
                    ),
                    ul: ({ node, ...p }) => (
                      <ul className="list-disc list-inside my-1 space-y-0.5" {...p} />
                    ),
                    ol: ({ node, ...p }) => (
                      <ol className="list-decimal list-inside my-1 space-y-0.5" {...p} />
                    ),
                    p: ({ node, ...p }) => <p className="mb-1 last:mb-0" {...p} />,
                    code: ({ node, ...p }) => (
                      <code className={`text-[10px] px-1 py-0.5 rounded font-mono ${msg.role === 'user' ? 'bg-blue-400/30' : 'bg-zinc-200 dark:bg-zinc-700'}`} {...p} />
                    ),
                    a: ({ node, ...p }) => (
                      <a className="text-blue-500 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...p} />
                    ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}

          {/* 正在输入的流式回复 */}
          {reply && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800 px-3.5 py-2.5 text-xs leading-relaxed text-zinc-700 dark:text-zinc-200">
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...p }) => <span className="font-bold text-zinc-900 dark:text-white" {...p} />,
                    ul: ({ node, ...p }) => <ul className="list-disc list-inside my-1 space-y-0.5" {...p} />,
                    p: ({ node, ...p }) => <p className="mb-1 last:mb-0" {...p} />,
                  }}
                >
                  {reply}
                </ReactMarkdown>
                <span className="inline-block ml-1 animate-pulse text-blue-400">▊</span>
              </div>
            </div>
          )}

          {loading && !reply && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-bl-md px-4 py-3 text-xs text-zinc-400 flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin text-sm"></i>
                <span>正在思考...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 输入区 */}
        <div className="shrink-0 px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs resize-none outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400"
              rows={2}
              placeholder="输入您的问题，回车发送..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-600 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 text-white transition-all flex items-center justify-center shadow-sm"
              aria-label="发送"
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin text-xs"></i>
              ) : (
                <i className="fas fa-paper-plane text-xs"></i>
              )}
            </button>
          </div>
          <p className="text-[9px] text-zinc-300 dark:text-zinc-600 mt-1.5 text-center">
            AI 辅助决策，请勿直接用于重要商业决策
          </p>
        </div>
      </div>
    </>
  )
}