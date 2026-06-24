import { cleanCache } from '@/lib/cache/local_file_cache'

const getConfiguredToken = () => process.env.CACHE_API_TOKEN || process.env.API_TOKEN

const getRequestToken = req => {
  const authHeader = req.headers.authorization || ''
  const bearerToken = authHeader.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : ''

  return req.headers['x-api-token'] || bearerToken
}

/**
 * 清理缓存
 * @param {*} req
 * @param {*} res
 */
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  const configuredToken = getConfiguredToken()
  if (!configuredToken) {
    return res.status(503).json({
      status: 'error',
      message: 'Cache API token is not configured'
    })
  }

  if (getRequestToken(req) !== configuredToken) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' })
  }

  try {
    cleanCache()
    res.status(200).json({ status: 'success', message: 'Clean cache successful!' })
  } catch (error) {
    res.status(400).json({ status: 'error', message: 'Clean cache failed!', error })
  }
}
