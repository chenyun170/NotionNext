import { useGlobal } from '@/lib/global'
import throttle from 'lodash.throttle'
import { uuidToId } from 'notion-utils'
import { useEffect, useRef, useState } from 'react'

/**
 * 文章目录导航（右侧粘性栏专用）
 */
const Catalog = ({ toc }) => {
  const { locale } = useGlobal()
  const [activeSection, setActiveSection] = useState(null)
  const activeSectionRef = useRef(null)
  const itemRefs = useRef({})

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
        if (bbox.top - offset < 0) {
          currentSectionId = section.getAttribute('data-id')
          prevBBox = bbox
          continue
        }
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
    window.addEventListener('scroll', actionSectionScrollSpy, { passive: true })
    return () => {
      window.removeEventListener('scroll', actionSectionScrollSpy)
    }
  }, [toc])

  if (!toc || toc?.length < 1) {
    return null
  }

  return (
    <div
      id='catalog'
      className='flex max-h-[56vh] flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs dark:border-stone-800 dark:bg-[#1c1a17]'
    >
      <div className='mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-stone-500 dark:text-stone-400'>
        <i className='fas fa-list-ul text-[#1c5a4a] dark:text-[#6bc4a6]' />
        <span>{locale?.COMMON?.TABLE_OF_CONTENTS || '本文目录'}</span>
      </div>
      <nav className='no-scrollbar flex-1 space-y-1 overflow-y-auto pr-1 text-[13px]'>
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
              className={`block rounded-lg border-l-2 px-2.5 py-1.5 no-underline transition-colors ${
                isActive
                  ? 'border-[#1c5a4a] bg-[#e8f0ec] font-semibold text-[#1c5a4a] dark:border-[#6bc4a6] dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
                  : 'border-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800/70 dark:hover:text-stone-100'
              }`}
            >
              <span
                style={{ paddingLeft: `${Math.min(tocItem.indentLevel || 0, 2) * 12}px` }}
                className='block truncate'
              >
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
