import { zhCN } from '@clerk/localizations'
import { ClerkProvider } from '@clerk/nextjs'

/**
 * 仅在启用 Clerk 时按需加载鉴权上下文与中文语言包，避免未开启登录功能时拖慢首屏
 */
export default function ClerkAuthProvider({ children }) {
  return <ClerkProvider localization={zhCN}>{children}</ClerkProvider>
}
