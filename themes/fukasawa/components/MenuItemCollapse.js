import Collapse from '@/components/Collapse'
import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useState } from 'react'

/**
 * 折叠菜单
 * @param {*} param0
 * @returns
 */
export const MenuItemCollapse = props => {
  const { link } = props
  const [show, changeShow] = useState(false)
  const hasSubMenu = link?.subMenus?.length > 0

  const [isOpen, changeIsOpen] = useState(false)

  const router = useRouter()
  const LinkComponent = getLinkComponent(link?.href)

  if (!link || !link.show) {
    return null
  }

  const selected = router.pathname === link.href || router.asPath === link.href

  const toggleShow = () => {
    changeShow(!show)
  }

  const toggleOpenSubMenu = () => {
    changeIsOpen(!isOpen)
  }

  return (
    <div className='px-2 py-0.5'>
      <div
        className={
          (selected
            ? 'bg-[#e8f0ec] text-[#1c5a4a] font-semibold dark:bg-[#1c5a4a]/25 dark:text-[#6bc4a6]'
            : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-950 dark:text-stone-200 dark:hover:bg-stone-800/70') +
          ' px-3 w-full text-left rounded-xl transition-colors duration-200'
        }
        onClick={hasSubMenu ? toggleOpenSubMenu : toggleShow}>
        {!hasSubMenu && (
          <LinkComponent
            href={link?.href}
            target={link?.target}
            className='py-2.5 w-full my-auto items-center justify-between flex text-sm font-medium'>
            <div className='flex items-center'>
              {link.icon && <i className={`${link.icon} text-center w-4 mr-3 text-xs opacity-75`} />}
              <span>{link.name}</span>
            </div>
            {selected && <span className='w-1.5 h-1.5 rounded-full bg-[#1c5a4a] dark:bg-[#6bc4a6]' />}
          </LinkComponent>
        )}

        {hasSubMenu && (
          <div className='py-2.5 text-sm font-medium flex justify-between items-center cursor-pointer no-underline'>
            <div className='flex items-center'>
              {link.icon && <i className={`${link.icon} text-center w-4 mr-3 text-xs opacity-75`} />}
              <span>{link.name}</span>
            </div>
            <div className='inline-flex items-center'>
              <i
                className={`px-1.5 text-[11px] text-stone-400 fas fa-chevron-right transition-transform duration-200 ${isOpen ? 'rotate-90 text-[#1c5a4a] dark:text-[#6bc4a6]' : ''}`}></i>
            </div>
          </div>
        )}
      </div>

      {/* 折叠子菜单 */}
      {hasSubMenu && (
        <Collapse isOpen={isOpen} onHeightChange={props.onHeightChange}>
          <div className='mt-1 mb-1.5 ml-4 pl-3 border-l border-stone-200 dark:border-stone-800 space-y-0.5'>
            {link.subMenus.map((sLink, index) => {
              const SubLinkComponent = getLinkComponent(sLink.href)
              const subSelected = router.pathname === sLink.href || router.asPath === sLink.href
              return (
                <SubLinkComponent
                  key={index}
                  href={sLink.href}
                  target={sLink.target || link?.target}
                  className={
                    (subSelected
                      ? 'bg-[#e8f0ec]/70 text-[#1c5a4a] font-semibold dark:bg-[#1c5a4a]/20 dark:text-[#6bc4a6]'
                      : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800/60') +
                    ' flex items-center py-2 px-3 rounded-lg text-[13px] transition-colors duration-200 whitespace-nowrap'
                  }>
                  {sLink.icon && <i className={`${sLink.icon} text-center w-3.5 mr-2.5 text-[11px] opacity-75`} />}
                  <span>{sLink.name || sLink.title}</span>
                </SubLinkComponent>
              )
            })}
          </div>
        </Collapse>
      )}
    </div>
  )
}

const getLinkComponent = href => href?.endsWith('.html') ? 'a' : SmartLink
