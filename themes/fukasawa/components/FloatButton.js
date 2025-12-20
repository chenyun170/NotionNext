import React, { useState } from 'react'

const FloatContact = () => {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="fixed bottom-10 right-10 z-50">
      {/* 1. 悬浮按钮 - 呼吸灯效果 */}
      <div 
        onClick={() => setShowPopup(!showPopup)}
        className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center cursor-pointer shadow-2xl hover:bg-orange-700 transition-all duration-300 animate-bounce-slow"
        style={{ animation: 'pulse 2s infinite' }}
      >
        <i className="fas fa-comment-dots text-white text-2xl"></i>
        {/* 提示文字气泡 */}
        <div className="absolute -top-10 right-0 bg-slate-800 text-white text-xs py-1 px-3 rounded-full whitespace-nowrap shadow-md">
          领外贸获客资料包 🎁
        </div>
      </div>

      {/* 2. 弹出的二维码组件 */}
      {showPopup && (
        <div className="absolute bottom-20 right-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 transition-all transform scale-100">
          <div className="text-center">
            <h3 className="text-slate-800 dark:text-gray-200 font-bold text-lg mb-2">情报局长私域</h3>
            <p className="text-gray-500 text-xs mb-4">扫码添加微信，备注“获客”<br/>进情报交流群</p>
            
            {/* 这里的图片地址换成你的微信二维码 */}
            <div className="bg-gray-100 p-2 rounded-lg mb-4">
               <img src="/wechat-qr.png" alt="微信二维码" className="w-full h-auto" />
            </div>

            <button 
              onClick={() => setShowPopup(false)}
              className="text-gray-400 text-xs hover:text-orange-600 transition-colors"
            >
              稍后再说
            </button>
          </div>
        </div>
      )}

      {/* 3. 注入呼吸灯动画 CSS */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.7); }
          70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(234, 88, 12, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 88, 12, 0); }
        }
      `}</style>
    </div>
  )
}

export default FloatContact
