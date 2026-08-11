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
    <>
      <div
        className={
          (selected
            ? 'bg-stone-600 text-white hover:text-white'
            : 'hover:text-stone-600') +
          ' px-5 w-full text-left duration-200 dark:bg-hexo-black-gray dark:border-black'
        }
        onClick={toggleShow}>
        {!hasSubMenu && (
          <LinkComponent
            href={link?.href}
            target={link?.target}
            className='dark:text-stone-200 py-2 w-full my-auto items-center justify-between flex  '>
            <div>
              <div className={`${link.icon} text-center w-4 mr-4`} />
              {link.name}
            </div>
          </LinkComponent>
        )}

        {hasSubMenu && (
          <div
            onClick={hasSubMenu ? toggleOpenSubMenu : null}
            className='py-2 font-extralight flex justify-between cursor-pointer  dark:text-stone-200 no-underline tracking-widest'>
            <div>
              <div className={`${link.icon} text-center w-4 mr-4`} />
              {link.name}
            </div>
            <div className='inline-flex items-center '>
              <i
                className={`px-2 fas fa-chevron-right transition-all duration-200 ${isOpen ? 'rotate-90' : ''}`}></i>
            </div>
          </div>
        )}
      </div>

      {/* 折叠子菜单 */}
      {hasSubMenu && (
        <Collapse isOpen={isOpen} onHeightChange={props.onHeightChange}>
          {link.subMenus.map((sLink, index) => {
            const SubLinkComponent = getLinkComponent(sLink.href)
            return (
              <div
                key={index}
                className='whitespace-nowrap dark:text-stone-200
              not:last-child:border-b-0 border-b dark:border-stone-800 py-2 px-14 cursor-pointer hover:bg-stone-100
              font-extralight dark:bg-black text-left justify-start text-stone-600 bg-stone-50 dark:hover:bg-stone-900 tracking-widest transition-all duration-200'>
                <SubLinkComponent href={sLink.href} target={link?.target}>
                  <div>
                    <div
                      className={`${sLink.icon} text-center w-3 mr-3 text-xs`}
                    />
                    {sLink.title}
                  </div>
                </SubLinkComponent>
              </div>
            )
          })}
        </Collapse>
      )}
    </>
  )
}

const getLinkComponent = href => href?.endsWith('.html') ? 'a' : SmartLink
