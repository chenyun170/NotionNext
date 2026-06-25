(function () {
  var endpoint = '/api/track-click'
  var eventName = 'customs_data_skill_click'

  function sendClick(link) {
    var href = link.getAttribute('href') || ''
    var payload = {
      event: eventName,
      source: link.getAttribute('data-track') || 'cluster_unknown',
      sourceGroup: link.getAttribute('data-track-group') || 'cluster',
      path: window.location.pathname,
      target: href,
      title: document.title,
      ts: Date.now()
    }
    var body = JSON.stringify(payload)

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
        return
      }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: body,
        keepalive: true
      }).catch(function () {})
    } catch (error) {}
  }

  document.querySelectorAll('[data-track]').forEach(function (link) {
    link.addEventListener('click', function () {
      sendClick(link)
    })
  })
})()
