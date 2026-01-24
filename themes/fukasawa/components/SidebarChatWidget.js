import { useEffect, useState, useRef } from 'react'

export default function SidebarChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [nickname, setNickname] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('未连接')
  const msgListRef = useRef(null)
  const knownMsgIds = useRef(new Set())

  // API 基础地址 - 请确保你的 FastAPI 后端已启动
  const API_BASE = 'http://127.0.0.1:8000' 

  useEffect(() => {
    // 1. 初始化 SessionID
    let sid = localStorage.getItem('chat_sid')
    if (!sid) {
      sid = 'u_' + Math.random().toString(36).substr(2, 8)
      localStorage.setItem('chat_sid', sid)
    }

    // 2. 初始化称呼
    const savedName = localStorage.getItem('chat_nickname')
    if (savedName) {
      setNickname(savedName)
      setIsLoggedIn(true)
      setStatus(savedName)
    }
  }, [])

  // 轮询逻辑
  useEffect(() => {
    let timer
    if (isLoggedIn && isOpen) {
      timer = setInterval(pollMessages, 2000)
    }
    return () => clearInterval(timer)
  }, [isLoggedIn, isOpen])

  // 滚动触底
  useEffect(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight
    }
  }, [messages])

  const pollMessages = async () => {
    const sid = localStorage.getItem('chat_sid')
    try {
      const res = await fetch(`${API_BASE}/api/chat/poll?session_id=${sid}`)
      const data = await res.json()
      const newMsgs = data.messages.filter(msg => !knownMsgIds.current.has(msg.id))
      
      if (newMsgs.length > 0) {
        newMsgs.forEach(msg => knownMsgIds.current.add(msg.id))
        setMessages(prev => [...prev, ...newMsgs])
      }
    } catch (e) { console.error('轮询失败', e) }
  }

  const loginChat = async () => {
    if (!inputValue.trim()) return alert("请先输入称呼")
    const sid = localStorage.getItem('chat_sid')
    try {
      await fetch(`${API_BASE}/api/chat/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, nickname: inputValue })
      })
      localStorage.setItem('chat_nickname', inputValue)
      setNickname(inputValue)
      setStatus(inputValue)
      setIsLoggedIn(true)
    } catch (e) { alert('连接后端失败，请检查 FastAPI 是否运行') }
  }

  const sendMsg = async () => {
    if (!inputValue.trim()) return
    const sid = localStorage.getItem('chat_sid')
    const text = inputValue
    setMessages(prev => [...prev, { id: Date.now(), content: text, direction: 'in' }])
    setInputValue('')
    
    try {
      await fetch(`${API_BASE}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sid, content: text })
      })
    } catch (e) { console.error('发送失败', e) }
  }

  return (
    <div className="font-sans">
      {/* 悬浮按钮 */}
      <div onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 cursor-pointer hover:-translate-y-1 transition-transform duration-300 shadow-lg group">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-3 rounded-full flex items-center gap-2 shadow-blue-500/30">
          <span className="font-bold text-sm tracking-wide">在线客服</span>
        </div>
      </div>

      {/* 聊天窗口 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[450px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate__animated animate__fadeInUp">
          {/* 头部 */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-bold text-sm flex items-center gap-1">💬 客服支持<span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span></span>
              <span className="text-[10px] opacity-80">{status}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">✕</button>
          </div>

          {!isLoggedIn ? (
            /* 登录界面 */
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50/50">
              <p className="text-sm font-bold text-gray-700 mb-1">欢迎咨询</p>
              <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="例如: 张老板" className="w-full border border-gray-200 p-2.5 rounded-lg mb-3 text-sm outline-none focus:border-blue-500 transition" />
              <button onClick={loginChat} className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition">开始对话</button>
            </div>
          ) : (
            /* 消息列表 */
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              <div ref={msgListRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div key={msg.id} className={`${msg.direction === 'in' ? 'bg-blue-600 text-white ml-auto rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'} px-3 py-2 rounded-2xl max-w-[85%] break-words text-sm shadow-sm`}>
                    {msg.content}
                  </div>
                ))}
              </div>
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                <input type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyPress={e => e.key === 'Enter' && sendMsg()} className="flex-1 bg-gray-100 border-none rounded-full px-4 py-2 text-sm outline-none" placeholder="输入消息..." />
                <button onClick={sendMsg} className="text-blue-600 font-bold text-sm px-2">发送</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
