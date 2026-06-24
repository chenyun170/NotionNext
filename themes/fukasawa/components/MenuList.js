import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import CONFIG from '../config'
import { MenuItemCollapse } from './MenuItemCollapse'
import { MenuItemDrop } from './MenuItemDrop'

const officialNavLinks = [
  {
    name: '海关数据专题',
    href: '/customs-data.html',
    show: true,
    icon: 'fas fa-layer-group'
  },
  {
    name: '工具导航',
    href: '/tools.html',
    show: true,
    icon: 'fas fa-toolbox'
  },
  {
    name: '常见问题',
    href: '/faq.html',
    show: true,
    icon: 'fas fa-circle-question'
  },
  {
    name: '关于本站',
    href: '/about.html',
    show: true,
    icon: 'fas fa-circle-info'
  }
]
/**
 * 菜单列表
 * @param {*} props
 * @returns
 */
export const MenuList = props => {
  const { customNav, customMenu } = props
  const { locale } = useGlobal()

  let links = [
    { name: locale.NAV.INDEX, href: '/' || '/', show: true },
    {
      name: locale.COMMON.CATEGORY,
      href: '/category',
      show: siteConfig('FUKASAWA_MENU_CATEGORY', null, CONFIG)
    },
    {
      name: locale.COMMON.TAGS,
      href: '/tag',
      show: siteConfig('FUKASAWA_MENU_TAG', null, CONFIG)
    },
    {
      name: locale.NAV.ARCHIVE,
      href: '/archive',
      show: siteConfig('FUKASAWA_MENU_ARCHIVE', null, CONFIG)
    }
  ]

  if (customNav) {
    links = links.concat(customNav)
  }

  // 如果 开启自定义菜单，则覆盖Page生成的菜单
  if (siteConfig('CUSTOM_MENU')) {
    links = customMenu
  }

  links = mergeOfficialNavLinks(links)

  if (!links || links.length === 0) {
    return null
  }

  return (
    <>
      <menu id='nav-pc' className='hidden md:block  text-sm z-10'>
        {links?.map((link, index) => (
          <MenuItemDrop key={index} link={link} />
        ))}
      </menu>
      <menu id='nav-mobile' className='block md:hidden  text-sm z-10 pb-1'>
        {links?.map((link, index) => (
          <MenuItemCollapse
            key={index}
            link={link}
            onHeightChange={props.onHeightChange}
          />
        ))}
      </menu>
    </>
  )
}

const mergeOfficialNavLinks = links => {
  const safeLinks = Array.isArray(links) ? links : []
  const hrefSet = new Set(safeLinks.map(link => link?.href).filter(Boolean))
  const missingOfficialLinks = officialNavLinks.filter(link => !hrefSet.has(link.href))
  return safeLinks.concat(missingOfficialLinks)
}
