console.log('[cntest-bg] service worker started')

// 从 storage 恢复录制状态（MV3 service worker 可能被随时终止重启）
let isRecording = false
let recordingTabId = null
chrome.storage.local.get(['cntest_recording', 'cntest_recording_tab_id'], (res) => {
  isRecording = !!res.cntest_recording
  recordingTabId = res.cntest_recording_tab_id || null
  console.log('[cntest-bg] restored state:', { isRecording, recordingTabId })
})

function setRecordingState(recording, tabId) {
  isRecording = recording
  recordingTabId = tabId
  chrome.storage.local.set({
    cntest_recording: recording,
    cntest_recording_tab_id: tabId
  })
}

// MV3 Service Worker 中监听器必须在顶层注册，否则 Worker 终止重启后会丢失
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (!isRecording) return
    const req = {
      id: details.requestId,
      method: details.method,
      url: details.url,
      name: extractName(details.url),
      event: '',
      status: '-',
      duration: '-',
      timestamp: Date.now()
    }
    console.log('[cntest-bg] captured:', req.method, req.url)
    notifyRecordingTab(req)
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
)

chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (!isRecording) return
    console.log('[cntest-bg] completed:', details.statusCode, details.url)
    const req = {
      id: details.requestId,
      method: details.method,
      url: details.url,
      name: extractName(details.url),
      event: '',
      status: String(details.statusCode || '-'),
      duration: '-',
      timestamp: Date.now()
    }
    notifyRecordingTab(req)
  },
  { urls: ['<all_urls>'] }
)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[cntest-bg] onMessage:', message, 'from tab', sender.tab?.id)
  if (!message || message.source !== 'cnTest-webapp') return
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
    sendResponse({ source: 'cnTest-extension', action: 'ALL_RECORDINGS', payload: [] })
    return true
  }

  if (action === 'CLEAR_RECORDING') {
    // no-op
  }
})

function notifyRecordingTab(req) {
  const payload = { source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: req }
  if (recordingTabId) {
    console.log('[cntest-bg] notify tab', recordingTabId, payload)
    chrome.tabs.sendMessage(recordingTabId, payload).catch((err) => {
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
