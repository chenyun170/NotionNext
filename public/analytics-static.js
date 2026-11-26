/**
 * 静态落地页（public/*.html）的统计与昼夜模式同步脚本。
 *
 * 这些页面是绕过 Next.js 直接由 Vercel 静态托管的，不会加载 _app，
 * 因此除了统计外，也需要与主站共享黑夜模式状态（localStorage / 系统偏好 / 夜间时段）并提供切换入口。
 */
(function () {
  var GA_ID = 'G-PX7V3KTKQ1'
  var VA_SRC = '/_vercel/insights/script.js'

  // ---------- 昼夜模式同步与注入（覆盖全部静态 .html 页，包括内联样式页） ----------
  function getQueryMode() {
    try {
      var params = new URLSearchParams(window.location.search)
      var mode = params.get('mode')
      if (mode === 'dark' || mode === 'light') return mode
    } catch (e) {}
    return ''
  }

  function resolveInitialDark() {
    var queryMode = getQueryMode()
    if (queryMode) return queryMode === 'dark'

    try {
      var stored = window.localStorage.getItem('darkMode')
      if (stored === 'true' || stored === 'dark') return true
      if (stored === 'false' || stored === 'light') return false
    } catch (e) {}

    var prefersDark = false
    try {
      prefersDark =
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {}

    var hour = new Date().getHours()
    return prefersDark || hour >= 18 || hour < 6
  }

  function injectStaticDarkCss() {
    if (document.getElementById('static-dark-mode-css')) return
    var style = document.createElement('style')
    style.id = 'static-dark-mode-css'
    style.textContent = [
      '.static-nav-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}',
      '.static-theme-toggle{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(28,25,23,.14);border-radius:999px;background:rgba(255,255,255,.82);padding:8px 13px;color:#57534e;font-size:13px;font-weight:700;cursor:pointer;line-height:1.2;transition:all .18s ease;white-space:nowrap;}',
      '.static-theme-toggle:hover{border-color:#1c5a4a;color:#1c5a4a;}',
      '.static-theme-toggle--floating{position:fixed;right:18px;bottom:18px;z-index:60;box-shadow:0 10px 28px rgba(0,0,0,.18);}',
      'html.dark{color-scheme:dark;}',
      'html.dark body{background:#131210 !important;color:#e7e5e4 !important;}',
      'html.dark .static-theme-toggle{background:#1c1a17 !important;border-color:rgba(255,255,255,.14) !important;color:#d6d3d1 !important;}',
      'html.dark .static-theme-toggle:hover{border-color:rgba(107,196,166,.55) !important;color:#6bc4a6 !important;}',
      'html.dark header{background:rgba(19,18,16,.92) !important;border-color:rgba(255,255,255,.08) !important;}',
      'html.dark .brand,html.dark h1,html.dark h2,html.dark h3,html.dark .section-title,html.dark .card strong,html.dark .summary h2,html.dark .answer h2,html.dark .answer-summary h2,html.dark .answer strong,html.dark .answer-summary-list strong,html.dark .prep-item strong,html.dark .hero-card h2,html.dark .tool h2,html.dark .faq-item h3,html.dark details summary,html.dark .links strong,html.dark .related strong,html.dark .metric strong,html.dark .aside-title,html.dark .faq-group-title{color:#f5f5f4 !important;}',
      'html.dark .lead,html.dark .section-copy,html.dark .card p,html.dark .summary p,html.dark .quick-list li,html.dark .answer p,html.dark .answer ul,html.dark .answer-summary-list span,html.dark .hero-card p,html.dark .prep-item span,html.dark .tool p,html.dark .example-card p,html.dark .faq-item p,html.dark details p,html.dark .links span,html.dark .related span,html.dark .metric span,html.dark .article p,html.dark .article ul,html.dark .trust-note,html.dark .platform-preview-header p,html.dark .examples-header p,html.dark .affiliate-disclosure,html.dark footer{color:#a8a29e !important;}',
      'html.dark .brand-icon,html.dark .brand-badge{background:#1c5a4a !important;color:#fff !important;}',
      'html.dark .back,html.dark .back-link,html.dark .nav-links a{background:#1c1a17 !important;border-color:rgba(255,255,255,.12) !important;color:#d6d3d1 !important;}',
      'html.dark .back:hover,html.dark .back-link:hover,html.dark .nav-links a:hover{border-color:rgba(107,196,166,.5) !important;color:#6bc4a6 !important;}',
      'html.dark .eyebrow,html.dark .tag,html.dark .summary-kicker{background:rgba(28,90,74,.24) !important;border-color:rgba(107,196,166,.35) !important;color:#6bc4a6 !important;}',
      'html.dark .summary-kicker{background:transparent !important;border-color:transparent !important;}',
      'html.dark .updated span,html.dark .tags span{background:#1c1a17 !important;border-color:rgba(255,255,255,.1) !important;color:#d6d3d1 !important;}',
      'html.dark .card,html.dark .summary,html.dark .panel,html.dark .hero-card,html.dark .answer-summary-panel,html.dark .tool,html.dark .example-card,html.dark .faq-item,html.dark details,html.dark .article,html.dark .link-list a,html.dark .links a,html.dark .related a{background:#1c1a17 !important;border-color:rgba(255,255,255,.08) !important;box-shadow:0 12px 32px rgba(0,0,0,.35) !important;}',
      'html.dark .prep-item,html.dark .answer-summary-list li,html.dark .aside,html.dark .path{background:#24211d !important;border-color:rgba(255,255,255,.08) !important;}',
      'html.dark .answer{background:rgba(28,90,74,.16) !important;border-color:rgba(107,196,166,.32) !important;}',
      'html.dark .btn-primary,html.dark .tool a:not(.secondary){background:#1c5a4a !important;border-color:#1c5a4a !important;color:#fff !important;}',
      'html.dark .btn-primary:hover,html.dark .tool a:not(.secondary):hover{background:#236f5b !important;border-color:#236f5b !important;}',
      'html.dark .btn-secondary,html.dark .tool a.secondary{background:#1c1a17 !important;border-color:rgba(255,255,255,.14) !important;color:#e7e5e4 !important;}',
      'html.dark .btn-secondary:hover,html.dark .tool a.secondary:hover{background:#26231f !important;border-color:rgba(107,196,166,.45) !important;color:#6bc4a6 !important;}',
      'html.dark .list a{background:#1c1a17 !important;border-color:rgba(255,255,255,.08) !important;color:#d6d3d1 !important;}',
      'html.dark .list a span,html.dark .example-card span,html.dark .card span{color:#6bc4a6 !important;}',
      'html.dark .mobile-sticky-cta{background:rgba(19,18,16,.92) !important;border-top-color:rgba(255,255,255,.1) !important;}',
      'html.dark footer{border-top-color:rgba(255,255,255,.08) !important;}'
    ].join('\n')
    document.head.appendChild(style)
  }

  function applyStaticDarkMode(isDark) {
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('light', !isDark)
    var btn = document.getElementById('static-theme-toggle-btn')
    if (btn) {
      btn.textContent = isDark ? '☀️ 日间' : '🌙 夜间'
      btn.setAttribute('aria-label', isDark ? '切换为日间模式' : '切换为夜间模式')
      btn.setAttribute('aria-pressed', String(isDark))
    }
  }

  function mountThemeToggle(initialDark) {
    if (document.getElementById('static-theme-toggle-btn')) return
    var btn = document.createElement('button')
    btn.type = 'button'
    btn.id = 'static-theme-toggle-btn'
    btn.className = 'static-theme-toggle'
    btn.addEventListener('click', function () {
      var nextDark = !document.documentElement.classList.contains('dark')
      try {
        window.localStorage.setItem('darkMode', String(nextDark))
      } catch (e) {}
      applyStaticDarkMode(nextDark)
    })

    var navLinks = document.querySelector('header .nav .nav-links')
    if (navLinks) {
      navLinks.appendChild(btn)
      applyStaticDarkMode(initialDark)
      return
    }

    var nav = document.querySelector('header .nav')
    if (nav) {
      var rightItem = nav.querySelector('.back, .back-link')
      if (rightItem && rightItem.parentNode === nav) {
        var wrapper = document.createElement('div')
        wrapper.className = 'static-nav-actions'
        nav.insertBefore(wrapper, rightItem)
        wrapper.appendChild(btn)
        wrapper.appendChild(rightItem)
      } else {
        nav.appendChild(btn)
      }
      applyStaticDarkMode(initialDark)
      return
    }

    btn.className = 'static-theme-toggle static-theme-toggle--floating'
    document.body.appendChild(btn)
    applyStaticDarkMode(initialDark)
  }

  var initialDark = resolveInitialDark()
  injectStaticDarkCss()
  applyStaticDarkMode(initialDark)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      mountThemeToggle(resolveInitialDark())
    })
  } else {
    mountThemeToggle(initialDark)
  }

  window.addEventListener('storage', function (event) {
    if (event.key === 'darkMode') {
      applyStaticDarkMode(resolveInitialDark())
    }
  })

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
      var groupNode = link.getAttribute('data-track-group')
        ? link
        : link.closest('[data-track-group]')
      var sourceGroup =
        (groupNode && groupNode.getAttribute('data-track-group')) || 'static'
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
