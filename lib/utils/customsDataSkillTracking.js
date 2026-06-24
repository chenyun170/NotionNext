const TRACK_ENDPOINT = '/api/track-click'
const EVENT_NAME = 'customs_data_skill_click'
const ORASKL_TARGET =
  'https://www.oraskl.com/?i=BB54F6&utm_source=123170&utm_medium=skill_page&utm_campaign=customs_data_skill'

const getSourceGroup = source => {
  if (source?.includes('home')) return 'home'
  if (source?.includes('article')) return 'article'
  if (source?.includes('search') || source?.includes('topic')) return 'search'
  if (source?.includes('related')) return 'related'
  if (source?.includes('static')) return 'static'
  return 'other'
}

export const trackCustomsDataSkillClick = (source, extra = {}) => {
  if (typeof window === 'undefined') {
    return
  }

  const payload = {
    event: EVENT_NAME,
    source: source || 'unknown',
    sourceGroup: getSourceGroup(source || ''),
    path: window.location.pathname,
    target: ORASKL_TARGET,
    title: document.title,
    ts: Date.now(),
    ...extra
  }

  window.gtag?.('event', EVENT_NAME, {
    event_category: 'customs_data_skill',
    event_label: payload.source,
    page_path: payload.path,
    transport_type: 'beacon'
  })

  window.va?.('event', {
    name: EVENT_NAME,
    data: {
      source: payload.source,
      sourceGroup: payload.sourceGroup,
      path: payload.path
    }
  })

  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      TRACK_ENDPOINT,
      new Blob([body], { type: 'application/json' })
    )
    return
  }

  fetch(TRACK_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => {})
}
