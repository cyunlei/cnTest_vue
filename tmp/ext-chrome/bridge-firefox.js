console.log('[cntest-bg] background script started')

let isRecording = false
let recordingTabId = null
const recordings = []
const pendingWebRequests = new Map()

browser.storage.local.get(['cntest_recording', 'cntest_recording_tab_id']).then((res) => {
  isRecording = !!res.cntest_recording
  recordingTabId = res.cntest_recording_tab_id || null
  console.log('[cntest-bg] restored state:', { isRecording, recordingTabId })
})

function setRecordingState(recording, tabId) {
  isRecording = recording
  recordingTabId = tabId
  browser.storage.local.set({
    cntest_recording: recording,
    cntest_recording_tab_id: tabId
  })
}

function parseRequestBody(rb) {
  if (!rb) return ''
  if (rb.formData) {
    try {
      return JSON.stringify(rb.formData)
    } catch {
      return ''
    }
  }
  if (rb.raw && Array.isArray(rb.raw)) {
    try {
      const bytes = rb.raw.map(part => Array.from(new Uint8Array(part.bytes))).flat()
      return new TextDecoder().decode(new Uint8Array(bytes))
    } catch {
      return ''
    }
  }
  return ''
}

function headersArrayToObject(arr) {
  const obj = {}
  if (!Array.isArray(arr)) return obj
  arr.forEach(h => { obj[h.name] = h.value })
  return obj
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!isRecording) return
    pendingWebRequests.set(details.requestId, {
      id: details.requestId,
      method: details.method,
      url: details.url,
      name: extractName(details.url),
      timestamp: Date.now(),
      type: 'webrequest',
      requestBody: parseRequestBody(details.requestBody)
    })
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
)

browser.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (!isRecording) return
    const req = pendingWebRequests.get(details.requestId)
    if (req) {
      req.requestHeaders = headersArrayToObject(details.requestHeaders)
    }
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders']
)

browser.webRequest.onCompleted.addListener(
  (details) => {
    if (!isRecording) return
    const base = pendingWebRequests.get(details.requestId)
    if (!base) return
    pendingWebRequests.delete(details.requestId)

    const req = {
      ...base,
      status: String(details.statusCode || '-'),
      duration: `${Date.now() - base.timestamp}ms`,
      responseHeaders: headersArrayToObject(details.responseHeaders)
    }
    pushRecording(req)
    notifyRecordingTab({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: req })
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
)

browser.webRequest.onErrorOccurred.addListener(
  (details) => {
    if (!isRecording) return
    const base = pendingWebRequests.get(details.requestId)
    if (!base) return
    pendingWebRequests.delete(details.requestId)
    const req = {
      ...base,
      status: 'ERROR',
      duration: `${Date.now() - base.timestamp}ms`,
      responseHeaders: {}
    }
    pushRecording(req)
    notifyRecordingTab({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: req })
  },
  { urls: ['<all_urls>'] }
)

browser.runtime.onMessage.addListener((message, sender) => {
  if (!message || !message.source) return

  if (message.source === 'cnTest-webapp') {
    const { action } = message
    const tabId = sender.tab ? sender.tab.id : null

    if (action === 'START_RECORDING') {
      setRecordingState(true, tabId)
      console.log('[cntest-bg] recording started, tab:', recordingTabId)
    }

    if (action === 'STOP_RECORDING') {
      setRecordingState(false, null)
      console.log('[cntest-bg] recording stopped')
    }

    if (action === 'GET_RECORDINGS') {
      return Promise.resolve({ source: 'cnTest-extension', action: 'ALL_RECORDINGS', payload: recordings.slice(-2000) })
    }

    if (action === 'CLEAR_RECORDING') {
      recordings.length = 0
    }
    return
  }

  if (message.source === 'cntest-capture' && message.payload) {
    if (!isRecording) return
    const payload = message.payload
    console.log('[cntest-bg] capture received:', payload.method, payload.url)

    const idx = findRecentRecordingIndex(payload.method, payload.url, 2000)
    if (idx !== -1) {
      recordings[idx] = { ...recordings[idx], ...payload, id: recordings[idx].id, timestamp: recordings[idx].timestamp, merged: true }
      notifyRecordingTab({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: recordings[idx] })
    } else {
      const enriched = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, ...payload }
      pushRecording(enriched)
      notifyRecordingTab({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: enriched })
    }
  }
})

function pushRecording(req) {
  recordings.push(req)
  if (recordings.length > 2000) recordings.shift()
}

function findRecentRecordingIndex(method, url, withinMs) {
  const now = Date.now()
  for (let i = recordings.length - 1; i >= 0; i--) {
    const r = recordings[i]
    if (r.method === method && r.url === url && (now - r.timestamp) <= withinMs) {
      return i
    }
  }
  return -1
}

function notifyRecordingTab(payload) {
  if (recordingTabId) {
    browser.tabs.sendMessage(recordingTabId, payload).catch((err) => {
      console.warn('[cntest-bg] sendMessage failed:', err?.message || err)
    })
  } else {
    console.warn('[cntest-bg] no recordingTabId, cannot notify')
  }
}

function extractName(url) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] || u.pathname || url
  } catch {
    return url
  }
}
