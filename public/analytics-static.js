/**
 * 静态落地页（public/*.html）的统计脚本。
 *
 * 这些页面是绕过 Next.js 直接由 Vercel 静态托管的，不会加载 _app，
 * 因此必须单独引入统计，否则访问和点击全部统计不到。
 *
 * 输出两路：
 * 1. GA4 —— 免费、无事件上限，事件明细在 GA4「管理 > 事件」里看；
 * 2. Vercel Web Analytics —— 页面浏览和自定义事件（自定义事件需 Pro 套餐）。
 */
(function () {
  var GA_ID = 'G-PX7V3KTKQ1'
  var VA_SRC = '/_vercel/insights/script.js'

  // ---------- GA4 ----------
  if (!window.gtag) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_ID, { anonymize_ip: true })

    var gaScript = document.createElement('script')
    gaScript.async = true
    gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID
    document.head.appendChild(gaScript)
  }

  // ---------- Vercel Web Analytics ----------
  if (!document.querySelector('script[src="' + VA_SRC + '"]')) {
    var vaScript = document.createElement('script')
    vaScript.defer = true
    vaScript.src = VA_SRC
    document.head.appendChild(vaScript)
  }

  // ---------- 工具外链点击 ----------
  // 用捕获阶段，保证即使页面自身有 stopPropagation 也能记录到。
  document.addEventListener(
    'click',
    function (event) {
      var node = event.target
      if (!node || typeof node.closest !== 'function') return

      var link = node.closest('[data-track]')
      if (!link) return

      var source = link.getAttribute('data-track') || 'static_unknown'
      var sourceGroup = link.getAttribute('data-track-group') || 'static'
      var target = link.getAttribute('href') || ''

      if (window.gtag) {
        window.gtag('event', 'outbound_tool_click', {
          event_category: 'tool_outbound',
          event_label: source,
          page_path: window.location.pathname,
          link_url: target,
          transport_type: 'beacon'
        })
      }

      if (window.va) {
        window.va('event', {
          name: 'outbound_tool_click',
          data: {
            source: source,
            sourceGroup: sourceGroup,
            path: window.location.pathname,
            target: target
          }
        })
      }
    },
    true
  )
})()
