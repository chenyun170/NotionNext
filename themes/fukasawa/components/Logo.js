'use client'

import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'

const Logo = ({ compact = false }) => {
  return (
    <SmartLink
      href='/'
      className='group inline-flex items-center gap-2.5 text-left no-underline'
    >
      <div className='relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-stone-200/80 bg-white shadow-xs transition-transform duration-200 group-hover:scale-105 dark:border-stone-700/80 dark:bg-stone-800'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src='/logo.png'
          className='h-full w-full object-cover'
          alt={siteConfig('TITLE')}
        />
      </div>

      <div className='min-w-0'>
        <div className='flex items-center gap-1.5 text-[15px] font-bold tracking-tight text-stone-900 transition-colors group-hover:text-[#1c5a4a] dark:text-stone-100 dark:group-hover:text-[#6bc4a6]'>
          <span>外贸获客情报局</span>
        </div>
        {!compact && (
          <div className='text-[10px] font-medium tracking-[0.12em] text-stone-400 dark:text-stone-500'>
            123170.XYZ · 实战情报
          </div>
        )}
      </div>
    </SmartLink>
  )
}

export default Logo
