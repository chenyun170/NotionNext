import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useEffect, useRef, useState } from 'react'

/**
 * 目录导航组件
 * @param toc
 * @returns {JSX.Element}
 * @constructor
 */
const Catalog = ({ toc }) => {
  const { locale } = useGlobal()

  // 同步选中目录事件
  const [activeSection, setActiveSection] = useState(null)
  const activeSectionRef = useRef(null)
  const tRef = useRef(null)
  const itemRefs = useRef({})

  // 监听滚动事件
  useEffect(() => {
    const throttleMs = 200
    const actionSectionScrollSpy = throttle(() => {
      const sections = document.getElementsByClassName('notion-h')
      let prevBBox = null
      let currentSectionId = activeSectionRef.current
      for (let i = 0; i < sections.length; ++i) {
        const section = sections[i]
        if (!section || !(section instanceof Element)) continue
        if (!currentSectionId) {
          currentSectionId = section.getAttribute('data-id')
        }
        const bbox = section.getBoundingClientRect()
        const prevHeight = prevBBox ? bbox.top - prevBBox.bottom : 0
        const offset = Math.max(150, prevHeight / 4)
        // GetBoundingClientRect returns values relative to viewport
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
        // No need to continue loop, if last element has been detected
        break
      }
      if (activeSectionRef.current !== currentSectionId) {
        activeSectionRef.current = currentSectionId
        setActiveSection(currentSectionId)
        itemRefs.current[currentSectionId]?.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        })
      }
    }, throttleMs)

    actionSectionScrollSpy()
    window.addEventListener('scroll', actionSectionScrollSpy)
    return () => {
      window.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [toc])

  // 无目录就直接返回空
  if (!toc || toc?.length < 1) {
    return <></>
  }
  return (
    <div
      id='catalog'
      className='flex flex-1 flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40'>
      <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400'>
        <i className='fas fa-stream text-blue-500' />
        <span>{locale.COMMON.TABLE_OF_CONTENTS}</span>
      </div>
      <nav
        ref={tRef}
        className='scroll-hidden mb-1 flex-1 space-y-1 overflow-auto overscroll-none pr-1 text-sm'>
        {toc.map(tocItem => {
          const id = uuidToId(tocItem.id)
          const isActive = activeSection === id
          return (
            <a
              key={id}
              ref={element => {
                if (element) {
                  itemRefs.current[id] = element
                } else {
                  delete itemRefs.current[id]
                }
              }}
              href={`#${id}`}
              className={`catalog-item block rounded-xl border-l-2 px-3 py-2 transition-all duration-200 notion-table-of-contents-item-indent-level-${tocItem.indentLevel} ${
                isActive
                  ? 'border-blue-500 bg-blue-50 font-bold text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/30 dark:text-blue-200'
                  : 'border-zinc-200 text-zinc-500 hover:border-zinc-400 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/70 dark:hover:text-zinc-100'
              }`}>
              <span
                style={{
                  display: 'inline-block',
                  marginLeft: tocItem.indentLevel * 16
                }}
                className='max-w-full truncate'>
                {tocItem.text}
              </span>
            </a>
          )
        })}
      </nav>
    </div>
  )
}

export default Catalog
