import BLOG from '@/blog.config'
import subscribeToMailchimpApi from '@/lib/plugins/mailchimp'
import { Validator } from '@/lib/utils/validation'

/**
 * 接受邮件订阅
 * @param {*} req
 * @param {*} res
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ status: 'error', message: 'Method not allowed' })
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {}
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const firstName =
    typeof (body.firstName ?? body.first_name) === 'string'
      ? (body.firstName ?? body.first_name).trim().slice(0, 80)
      : ''
  const lastName =
    typeof (body.lastName ?? body.last_name) === 'string'
      ? (body.lastName ?? body.last_name).trim().slice(0, 80)
      : ''

  if (!Validator.isValidEmail(email)) {
    return res.status(400).json({ status: 'error', message: 'Invalid email address!' })
  }

  if (!BLOG.MAILCHIMP_LIST_ID || !BLOG.MAILCHIMP_API_KEY) {
    return res.status(503).json({ status: 'error', message: 'Subscription service is not configured!' })
  }

  try {
    const response = await subscribeToMailchimpApi({
      email,
      first_name: firstName,
      last_name: lastName
    })
    if (!response?.ok) {
      return res.status(400).json({ status: 'error', message: 'Subscription failed!' })
    }
    await response.json()
    return res.status(200).json({ status: 'success', message: 'Subscription successful!' })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[subscribe] failed:', error?.message)
    }
    return res.status(400).json({ status: 'error', message: 'Subscription failed!' })
  }
}
