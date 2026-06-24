import { ClerkProvider } from '@clerk/nextjs'
import { zhCN } from '@clerk/localizations'

const ClerkProviderWrapper = ({ children }) => {
  return <ClerkProvider localization={zhCN}>{children}</ClerkProvider>
}

export default ClerkProviderWrapper
