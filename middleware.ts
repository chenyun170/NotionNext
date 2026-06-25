import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { checkStrIsNotionId, getLastPartOfUrl } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import BLOG from './blog.config'

/**
 * ✅ 明确放行的静态/公共文件（避免被 i18n / rewrite / auth 误处理）
 */
function isPublicFile(pathname: string) {
  return (
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    pathname === '/sitemap-core.xml' ||
    pathname === '/sitemap-index.xml' ||
    pathname === '/llms.txt' ||
    pathname === '/redirect.json' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/_next/')
  )
}

function getCustomsSkillSearchRedirect(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  if (!pathname.toLowerCase().startsWith('/search/')) {
    return null
  }

  const rawKeyword = pathname.slice('/search/'.length).split('/')[0] || ''
  let keyword = rawKeyword

  try {
    keyword = decodeURIComponent(rawKeyword)
  } catch {
    keyword = rawKeyword
  }

  const normalizedKeyword = keyword.toLowerCase().replace(/\s+/g, '')

  if (!/oraskl|skll/.test(normalizedKeyword)) {
    return null
  }

  const redirectToUrl = req.nextUrl.clone()
  redirectToUrl.pathname = '/customs-data-skill.html'
  redirectToUrl.search = ''
  return NextResponse.redirect(redirectToUrl, 308)
}

/**
 * Clerk 身份验证中间件
 */
export const config = {
  // ✅ 只对“页面路由”生效，排除 robots/sitemap 等公共文件
  matcher: [
    '/((?!robots\\.txt|sitemap\\.xml|sitemap-core\\.xml|sitemap-index\\.xml|llms\\.txt|redirect\\.json|favicon\\.ico|_next/).*)'
  ]
}

// 限制登录访问的路由
const isTenantRoute = createRouteMatcher([
  '/user/organization-selector(.*)',
  '/user/orgid/(.*)',
  '/dashboard',
  '/dashboard/(.*)'
])

// 限制权限访问的路由
const isTenantAdminRoute = createRouteMatcher([
  '/admin/(.*)/memberships',
  '/admin/(.*)/domain'
])

/**
 * 没有配置权限相关功能的返回
 */
// eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const noAuthMiddleware = async (req: NextRequest, ev: any) => {
  // ✅ 再保险：公共文件直接放行
  if (isPublicFile(req.nextUrl.pathname)) return NextResponse.next()

  const customsSkillRedirect = getCustomsSkillSearchRedirect(req)
  if (customsSkillRedirect) return customsSkillRedirect

  if (BLOG['UUID_REDIRECT']) {
    let redirectJson: Record<string, string> = {}
    try {
      const response = await fetch(`${req.nextUrl.origin}/redirect.json`)
      if (response.ok) {
        redirectJson = (await response.json()) as Record<string, string>
      }
    } catch (err) {
      console.error('Error fetching static file:', err)
    }
    let lastPart = getLastPartOfUrl(req.nextUrl.pathname) as string
    if (checkStrIsNotionId(lastPart)) {
      lastPart = idToUuid(lastPart)
    }
    if (lastPart && redirectJson[lastPart]) {
      const redirectToUrl = req.nextUrl.clone()
      redirectToUrl.pathname = '/' + redirectJson[lastPart]
      return NextResponse.redirect(redirectToUrl, 308)
    }
  }
  return NextResponse.next()
}

/**
 * 鉴权中间件
 */
const authMiddleware = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware((auth, req) => {
      // ✅ 再保险：公共文件直接放行
      if (isPublicFile(req.nextUrl.pathname)) return NextResponse.next()

      const customsSkillRedirect = getCustomsSkillSearchRedirect(req)
      if (customsSkillRedirect) return customsSkillRedirect

      const { userId } = auth()

      // 处理 /dashboard 路由的登录保护
      if (isTenantRoute(req)) {
        if (!userId) {
          const url = new URL('/sign-in', req.url)
          url.searchParams.set('redirectTo', req.url)
          return NextResponse.redirect(url)
        }
      }

      // 处理管理员相关权限保护
      if (isTenantAdminRoute(req)) {
        auth().protect(has => {
          return (
            has({ permission: 'org:sys_memberships:manage' }) ||
            has({ permission: 'org:sys_domains_manage' })
          )
        })
      }

      return NextResponse.next()
    })
  : noAuthMiddleware

export default authMiddleware
