'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
    // 超长输入保护：避免模型上下文异常导致回复中断
    if (userMsg.length > 6000) {
      setHistory(prev => [
        ...prev,
        { role: 'assistant', text: '输入内容过长（超过 6000 字），请精简后重试，以免回复中断。' },
      ])
      return
    }

    setInput('')
    setLoading(true)
    setReply('')
    // 将用户消息加入历史
    setHistory(prev => [...prev, { role: 'user', text: userMsg }])

    let fullReply = ''
    let finished = false

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg,
          // 携带对话历史（不含当前消息，当前消息单独传），让模型能接上下文
          // 只取最近 20 条，避免历史过长撑爆上下文
          history: history.slice(-20).map(m => ({ role: m.role, content: m.text })),
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => null)
        throw new Error(errData?.error || `HTTP ${response.status}`)
      }
      if (!response.body) throw new Error('Response body is null')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = '' // SSE 缓冲：防止流被拆包导致 JSON 解析失败、内容丢失

      while (!finished) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        // 按 SSE 事件分隔符 \n\n 切分；末尾不完整片段留到下一轮拼接
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const event of events) {
          for (const line of event.split('\n')) {
            if (!line.startsWith('data:')) continue
            const text = line.slice(5).trim()
            if (text === '[DONE]') { finished = true; break }
            if (!text) continue
            try {
              const data = JSON.parse(text)
              if (data.error) throw new Error(data.error)
              if (data.content) {
                fullReply += data.content
                setReply(fullReply)
              }
            } catch (err) {
              // 忽略被拆包的残缺 JSON，等下一块补齐后再解析
              console.warn('SSE parse skip:', err)
            }
          }
          if (finished) break
        }
      }

      // 正常结束：将完整回复加入历史
      if (fullReply) {
        setHistory(prev => [...prev, { role: 'assistant', text: fullReply }])
      }
      setReply('')
    } catch (e) {
      console.error(e)
      // 断流时保留已收到的部分，避免"一半内容丢失"
      const partial = fullReply
        ? fullReply + '\n\n> ⚠️ 回复被中断，内容可能不完整，请重试。'
        : '请求出错，请稍后再试。'
      setHistory(prev => [...prev, { role: 'assistant', text: partial }])
      setReply('')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || typeof document === 'undefined') return null

  // 用 Portal 挂载到 document.body，彻底脱离主题容器的层叠上下文限制
  return createPortal(
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 对话框主体 */}
      <div
        className="fixed z-[10000] inset-0 flex flex-col overflow-hidden rounded-2xl shadow-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 animate-in fade-in slide-in-from-bottom-4 duration-300 lg:inset-auto lg:bottom-10 lg:left-1/2 lg:top-auto lg:right-auto lg:-translate-x-1/2 lg:w-[min(780px,calc(100vw-16px))] lg:h-[min(820px,calc(100vh-32px))]"
        style={{
          position: 'fixed',
          zIndex: 10000,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="AI 参谋对话框"
      >
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm shadow-sm">
              <i className="fas fa-robot"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-stone-800 dark:text-stone-100 leading-tight">AI 参谋</p>
              <p className="text-[10px] text-stone-400 leading-tight">外贸获客 · 邮件 · 数据查询</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 清空历史 */}
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                title="清空对话"
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <i className="fas fa-trash-alt text-xs"></i>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800"
              aria-label="关闭"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 no-scrollbar break-words overflow-wrap-anywhere w-full min-w-0">
          {history.length === 0 && !loading && !reply && (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-500 text-xl shadow-sm">
                <i className="fas fa-headset"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-700 dark:text-stone-200">您好，我是 AI 参谋</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed max-w-[240px]">
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
                    className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 border border-transparent hover:border-amber-200 dark:hover:border-amber-800 transition-all"
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
                className={`w-full max-w-full rounded-2xl px-4 py-3 text-sm leading-relaxed break-words overflow-wrap-anywhere ${
                  msg.role === 'user'
                    ? 'bg-amber-500 text-white rounded-br-md'
                    : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-bl-md'
                }`}
              >
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...p }) => (
                      <span className={`font-bold ${msg.role === 'user' ? 'text-white' : 'text-stone-900 dark:text-white'}`} {...p} />
                    ),
                    ul: ({ node, ...p }) => (
                      <ul className="list-disc list-inside my-1 space-y-0.5" {...p} />
                    ),
                    ol: ({ node, ...p }) => (
                      <ol className="list-decimal list-inside my-1 space-y-0.5" {...p} />
                    ),
                    p: ({ node, ...p }) => <p className="mb-1 last:mb-0" {...p} />,
                    code: ({ node, ...p }) => (
                      <code className={`text-[10px] px-1 py-0.5 rounded font-mono ${msg.role === 'user' ? 'bg-amber-400/30' : 'bg-stone-200 dark:bg-stone-700'}`} {...p} />
                    ),
                    a: ({ node, ...p }) => (
                      <a className="text-amber-500 underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...p} />
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
              <div className="w-full max-w-full rounded-2xl rounded-bl-md bg-stone-100 dark:bg-stone-800 px-4 py-3 text-sm leading-relaxed break-words overflow-wrap-anywhere text-stone-700 dark:text-stone-200">
                <ReactMarkdown
                  components={{
                    strong: ({ node, ...p }) => <span className="font-bold text-stone-900 dark:text-white" {...p} />,
                    ul: ({ node, ...p }) => <ul className="list-disc list-inside my-1 space-y-0.5" {...p} />,
                    p: ({ node, ...p }) => <p className="mb-1 last:mb-0" {...p} />,
                  }}
                >
                  {reply}
                </ReactMarkdown>
                <span className="inline-block ml-1 animate-pulse text-amber-400">▊</span>
              </div>
            </div>
          )}

          {loading && !reply && (
            <div className="flex justify-start">
              <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl rounded-bl-md px-4 py-3 text-xs text-stone-400 flex items-center gap-2">
                <i className="fas fa-circle-notch fa-spin text-sm"></i>
                <span>正在思考...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* 输入区 */}
        <div className="shrink-0 px-4 py-3 border-t border-stone-100 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:border-amber-400 dark:focus:border-amber-500 transition-colors text-stone-800 dark:text-stone-100 placeholder:text-stone-400"
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
              className="shrink-0 w-9 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-stone-200 disabled:text-stone-400 text-white transition-all flex items-center justify-center shadow-sm"
              aria-label="发送"
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin text-xs"></i>
              ) : (
                <i className="fas fa-paper-plane text-xs"></i>
              )}
            </button>
          </div>
          <p className="text-[9px] text-stone-300 dark:text-stone-600 mt-1.5 text-center">
            AI 辅助决策，请勿直接用于重要商业决策
          </p>
        </div>
      </div>
    </>,
    document.body
  )
}