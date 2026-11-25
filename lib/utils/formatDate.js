import BLOG from '@/blog.config'

/**
 * 格式化日期
 * @param date
 * @param local
 * @returns {string}
 */
export default function formatDate(date, local = BLOG.LANG) {
  if (!date || !local) return date || ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  // 中文站输出 YYYY-MM-DD，月份和日期补零。
  // 结构化数据（schema.org）要求 ISO 日期，2025-4-11 这种写法会校验失败。
  if (local.slice(0, 2).toLowerCase() === 'zh') {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  return d.toLocaleDateString(local, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * 时间戳格式化
 * @param {*} timestamp
 * @param {*} fmt
 * @returns
 */
export function formatDateFmt(timestamp, fmt) {
  const date = new Date(timestamp)
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substr(4 - RegExp.$1.length)
    )
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
      )
    }
  }
  return fmt.trim()
}
