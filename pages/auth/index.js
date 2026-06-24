// pages/sitemap.xml.js
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Slug from '../[prefix]'

const isDevelopment = process.env.NODE_ENV === 'development'

const buildSuccessMessage = data => {
  const workspaceName = data?.workspace_name || 'Notion 工作区'
  return `授权成功：${workspaceName}`
}

/**
 * 根据notion的slug访问页面
 * 解析二级目录 /article/about
 * @param {*} props
 * @returns
 */
const UI = props => {
  const { redirect_pathname, redirect_query } = props
  const router = useRouter()
  useEffect(() => {
    router?.push({ pathname: redirect_pathname, query: redirect_query })
  }, [])
  return <Slug {...props} />
}

/**
 * 服务端接收参数处理
 * @param {*} ctx
 * @returns
 */
export const getServerSideProps = async ctx => {
  const from = `auth`
  const props = await fetchGlobalAllData({ from })
  delete props.allPages
  const code = ctx.query.code

  let params = null
  if (code) {
    params = await fetchToken(code)
  }

  // 授权成功的划保存下用户的workspace信息
  if (params?.status === 200) {
    props.redirect_query = {
      msg: buildSuccessMessage(params.data)
    }
  } else if (!params) {
    props.redirect_query = { msg: '无效请求' }
  } else {
    props.redirect_query = { msg: params.statusText }
  }

  props.redirect_pathname = '/auth/result'

  return {
    props
  }
}

const fetchToken = async code => {
  if (!code) {
    return '无效请求'
  }
  const clientId = process.env.OAUTH_CLIENT_ID
  const clientSecret = process.env.OAUTH_CLIENT_SECRET
  const redirectUri = process.env.OAUTH_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return {
      status: 500,
      statusText: 'OAuth 配置缺失'
    }
  }

  // encode in base 64
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  try {
    const response = await axios.post(
      'https://api.notion.com/v1/oauth/token',
      {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      },
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Basic ${encoded}`
        }
      }
    )

    return response
  } catch (error) {
    if (isDevelopment) {
      console.error('Error fetching token', error)
    }
  }
}

export default UI
