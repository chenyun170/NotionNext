import { useGlobal } from '@/lib/global'
import { useEffect, useRef, useState } from 'react'

/**
 * 加密文章校验组件
 */
const ArticleLock = props => {
  const { validPassword } = props
  const { locale } = useGlobal()
  const [passwordError, setPasswordError] = useState('')
  const passwordInputRef = useRef(null)

  const submitPassword = () => {
    setPasswordError('')
    if (!validPassword(passwordInputRef.current?.value)) {
      setPasswordError(locale.COMMON.PASSWORD_ERROR)
    }
  }

  useEffect(() => {
    passwordInputRef.current?.focus()
  }, [])

  return (
    <div id='container' className='flex min-h-[60vh] items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-2xl border border-stone-200/90 bg-white p-8 text-center shadow-sm dark:border-stone-800 dark:bg-[#1c1a17]'>
        <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8f0ec] text-lg text-[#1c5a4a] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'>
          <i className='fas fa-lock' />
        </div>
        <h2 className='text-base font-bold text-stone-900 dark:text-stone-100'>
          {locale.COMMON.ARTICLE_LOCK_TIPS}
        </h2>
        <p className='mt-1.5 text-xs text-stone-500 dark:text-stone-400'>
          本文为加密文章，输入访问密码后即可阅读完整内容
        </p>

        <div className='mt-5 flex gap-2'>
          <input
            id='password'
            type='password'
            placeholder='请输入阅读密码…'
            onKeyDown={e => {
              if (e.key === 'Enter') {
                submitPassword()
              }
            }}
            ref={passwordInputRef}
            className='h-10 flex-1 rounded-xl border border-stone-200 bg-[#faf9f6] px-3.5 text-sm text-stone-900 outline-none transition focus:border-[#1c5a4a] focus:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100'
          />
          <button
            type='button'
            onClick={submitPassword}
            className='inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-[#1c5a4a] px-4 text-xs font-semibold text-white transition hover:bg-[#14453a]'
          >
            <i className='fas fa-key text-[11px]' />
            <span>{locale.COMMON.SUBMIT}</span>
          </button>
        </div>

        <div aria-live='polite' className='mt-3 min-h-[20px]'>
          {passwordError && (
            <div className='text-xs font-medium text-red-600 dark:text-red-400'>
              {passwordError}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ArticleLock
