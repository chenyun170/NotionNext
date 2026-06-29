const TRACK_ENDPOINT = '/api/track-click'
const EVENT_NAME = 'customs_data_skill_click'
const OUTBOUND_EVENT_NAME = 'outbound_tool_click'
const INTERACTION_EVENT_NAME = 'site_interaction'
const ORASKL_TARGET =
  'https://www.oraskl.com/?i=BB54F6&utm_source=123170&utm_medium=skill_page&utm_campaign=customs_data_skill'

const getSourceGroup = source => {
  if (source?.includes('home')) return 'home'
  if (source?.includes('article')) return 'article'
  if (source?.includes('cluster')) return 'cluster'
  if (source?.includes('tools')) return 'tools'
  if (source?.includes('activity') || source?.includes('marquee')) return 'activity'
  if (source?.includes('gift') || source?.includes('wechat')) return 'lead'
  if (source?.includes('brand') || source?.includes('oraskl')) return 'brand'
  if (source?.includes('topic')) return 'topic'
  if (source?.includes('search')) return 'search'
  if (source?.includes('related')) return 'related'
  if (source?.includes('static')) return 'static'
  return 'other'
}

const sendTrackPayload = payload => {
  if (typeof window === 'undefined') {
    return
  }

  const eventName = payload.event || EVENT_NAME

  window.gtag?.('event', eventName, {
    event_category:
      eventName === OUTBOUND_EVENT_NAME
        ? 'tool_outbound'
        : eventName === INTERACTION_EVENT_NAME
          ? 'site_interaction'
          : 'customs_data_skill',
    event_label: payload.source,
    page_path: payload.path,
    transport_type: 'beacon'
  })

  window.va?.('event', {
    name: eventName,
    data: {
      source: payload.source,
      sourceGroup: payload.sourceGroup,
      path: payload.path,
      target: payload.target,
      tool: payload.tool,
      action: payload.action
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

  sendTrackPayload(payload)
}

export const trackToolOutboundClick = ({ source, target, tool, sourceGroup }) => {
  if (typeof window === 'undefined' || !target) {
    return
  }

  sendTrackPayload({
    event: OUTBOUND_EVENT_NAME,
    source: source || 'unknown',
    sourceGroup: sourceGroup || getSourceGroup(source || ''),
    path: window.location.pathname,
    target,
    title: document.title,
    tool: tool || '',
    ts: Date.now()
  })
}

export const trackSiteInteraction = ({
  source,
  action,
  target,
  sourceGroup,
  tool
}) => {
  if (typeof window === 'undefined') {
    return
  }

  sendTrackPayload({
    event: INTERACTION_EVENT_NAME,
    source: source || 'unknown',
    sourceGroup: sourceGroup || getSourceGroup(source || ''),
    path: window.location.pathname,
    target: target || window.location.pathname,
    title: document.title,
    tool: tool || '',
    action: action || '',
    ts: Date.now()
  })
}
