import { useEffect, useState, useRef } from 'react'

export default function SidebarChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [nickname, setNickname] = useState('')
  const msgListRef = useRef(null)

  // 初始化逻辑：从本地存储读取数据
  useEffect(() => {
    const savedSid = localStorage.getItem('chat_sid') || 'u_' + Math.random().toString(36).substr(2, 8)
    localStorage.setItem('chat_sid', savedSid)
    
    const savedName = localStorage.getItem('chat_nickname')
    if (savedName) {
      setNickname(savedName)
      setIsLoggedIn(true)
    }
  }, [])

  // 轮询逻辑
  useEffect(() => {
    let timer
    if (isLoggedIn && isOpen) {
      timer = setInterval(fetchMessages, 2000)
    }
    return () => clearInterval(timer)
  }, [isLoggedIn, isOpen])

  // 将你原本 script 里的逻辑写成函数...
  const fetchMessages = async () => { /* ... */ }

  return (
    <div className='z-50'>
       {/* 这里放入你原本的 HTML 结构，但注意将 class 改为 className */}
    </div>
  )
}
