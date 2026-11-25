import SmartLink from '@/components/SmartLink'
import { useRouter } from 'next/router'
import { useGlobal } from '@/lib/global'

/**
 * 简易翻页插件
 * @param page 当前页码
 * @param showNext 是否有下一页
 * @returns {JSX.Element}
 * @constructor
 */
const PaginationSimple = ({ page, showNext }) => {
  const { locale } = useGlobal()
  const router = useRouter()
  const currentPage = +page
  // 不用 router.asPath 拼接：首页在部分环境下 asPath 为 /index，
  // 会生成 /index/page/2 这种不存在的地址。改为按路由和参数确定前缀。
  const routeParam = value => {
    const raw = Array.isArray(value) ? value[0] : value
    return raw ? encodeURIComponent(raw) : ''
  }
  let pagePrefix = ''
  if (router.route.startsWith('/category/')) {
    pagePrefix = `/category/${routeParam(router.query.category)}`
  } else if (router.route.startsWith('/tag/')) {
    pagePrefix = `/tag/${routeParam(router.query.tag)}`
  } else if (router.route.startsWith('/search/')) {
    pagePrefix = `/search/${routeParam(router.query.keyword)}`
  }
  // 只在真正可跳转时才渲染链接：否则 /page/0、/category/x/page/2 这类
  // 不存在的地址会被 Googlebot / Ahrefs 当成站内链接抓取，产生大量 404
  const showPrev = currentPage > 1
  const hasNext = Boolean(showNext)

  return (
    <div className="my-10 flex justify-between font-medium text-black dark:text-stone-100 space-x-2">
      {showPrev ? (
        <SmartLink
          href={{
            pathname:
              currentPage === 2
                ? pagePrefix || '/'
                : `${pagePrefix}/page/${currentPage - 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          passHref
          rel="prev"
          className="text-center w-full duration-200 px-4 py-2 hover:border-black border-b-2 hover:font-bold">
          ←{locale.PAGINATION.PREV}
        </SmartLink>
      ) : (
        <span aria-hidden="true" className="invisible text-center w-full px-4 py-2 border-b-2 border-transparent">
          ←{locale.PAGINATION.PREV}
        </span>
      )}
      {hasNext ? (
        <SmartLink
          href={{
            pathname: `${pagePrefix}/page/${currentPage + 1}`,
            query: router.query.s ? { s: router.query.s } : {}
          }}
          passHref
          rel="next"
          className="text-center w-full duration-200 px-4 py-2 hover:border-black border-b-2 hover:font-bold">
          {locale.PAGINATION.NEXT}→
        </SmartLink>
      ) : (
        <span aria-hidden="true" className="invisible text-center w-full px-4 py-2 border-b-2 border-transparent">
          {locale.PAGINATION.NEXT}→
        </span>
      )}
    </div>
  )
}

export default PaginationSimple
