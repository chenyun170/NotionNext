import { useEffect, useRef, useState } from 'react'

const COPY_SUCCESS_TEXT = '本文链接已复制，可以分享给需要的外贸朋友。'
const COPY_FAILED_TEXT = '复制失败，请手动复制浏览器地址栏链接。'

export default function ArticleCopyrightNotice({ post }) {
  const [toastText, setToastText] = useState('')
  const toastTimerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const showToast = text => {
    setToastText(text)

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current)
    }

    toastTimerRef.current = setTimeout(() => {
      setToastText('')
    }, 2200)
  }

  const copyArticleLink = async () => {
    if (typeof window === 'undefined') {
      return
    }

    try {
      await navigator.clipboard.writeText(window.location.href)
      showToast(COPY_SUCCESS_TEXT)
    } catch (error) {
      showToast(COPY_FAILED_TEXT)
    }
  }

  return (
    <div className='group mt-14 print:hidden'>
      <div className='relative overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 p-8 transition-all hover:border-blue-500/30 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/50'>
        <div className='pointer-events-none absolute -right-6 -top-6 opacity-[0.03] transition-opacity group-hover:opacity-10 dark:opacity-[0.05]'>
          <i className='fas fa-shield-alt rotate-12 text-9xl text-slate-900 dark:text-white'></i>
        </div>

        <div className='relative z-10'>
          <div className='mb-8 flex items-center space-x-3'>
            <div className='flex space-x-1'>
              <div className='h-4 w-1 rounded-full bg-blue-600'></div>
              <div className='h-4 w-1 rounded-full bg-blue-600/40'></div>
            </div>
            <h3 className='text-xs font-black uppercase tracking-[0.2em] text-slate-800 dark:text-gray-200'>
              版权与引用说明
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2'>
            <div className='flex flex-col border-l-2 border-gray-200 pl-4 transition-colors group-hover:border-blue-600/50 dark:border-gray-800'>
              <span className='mb-1 text-[10px] uppercase tracking-widest text-gray-400'>
                内容来源
              </span>
              <span className='flex items-center text-sm font-bold dark:text-gray-300'>
                外贸获客情报局
                <i
                  className='fas fa-check-circle ml-2 text-[10px] text-blue-500'
                  title='本站原创整理'></i>
              </span>
            </div>

            <div className='flex flex-col border-l-2 border-gray-200 pl-4 transition-colors group-hover:border-blue-600/50 dark:border-gray-800'>
              <span className='mb-1 text-[10px] uppercase tracking-widest text-gray-400'>
                分享链接
              </span>
              <button
                onClick={() => {
                  copyArticleLink()
                }}
                className='group/link flex items-center text-left font-mono text-sm text-blue-600 transition-colors hover:text-blue-500'>
                <span className='truncate'>点击复制本文永久链接</span>
                <i className='fas fa-copy ml-2 text-[10px] opacity-0 transition-opacity group-hover/link:opacity-100'></i>
              </button>
            </div>

            <div className='flex flex-col border-l-2 border-gray-200 pl-4 transition-colors group-hover:border-blue-600/50 dark:border-gray-800'>
              <span className='mb-1 text-[10px] uppercase tracking-widest text-gray-400'>
                转载许可
              </span>
              <span className='text-sm dark:text-gray-300'>
                CC BY-NC-SA 4.0
                <span className='ml-1 text-[10px] text-gray-500'>
                  署名 / 非商用 / 相同方式共享
                </span>
              </span>
            </div>

            <div className='flex flex-col border-l-2 border-gray-200 pl-4 transition-colors group-hover:border-blue-600/50 dark:border-gray-800'>
              <span className='mb-1 text-[10px] uppercase tracking-widest text-gray-400'>
                情报索引
              </span>
              <span className='font-mono text-sm uppercase tabular-nums dark:text-gray-400'>
                #TC-{new Date().getFullYear()}-{post?.id?.slice(0, 6)}
              </span>
            </div>
          </div>

          <div className='mt-8 border-t border-dashed border-gray-200 pt-5 dark:border-gray-800'>
            <p className='text-[11px] italic leading-relaxed text-gray-500 dark:text-gray-400'>
              <i className='fas fa-info-circle mr-2 opacity-60'></i>
              本文用于外贸获客方法、工具使用和数据理解交流。欢迎保留出处后分享，禁止未授权批量搬运、洗稿或商用采集。
            </p>
          </div>
        </div>

        <div
          aria-live='polite'
          className={`absolute bottom-4 right-4 rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white shadow-lg transition-all duration-200 dark:bg-white dark:text-slate-900 ${
            toastText
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-2 opacity-0'
          }`}>
          {toastText}
        </div>
      </div>
    </div>
  )
}
