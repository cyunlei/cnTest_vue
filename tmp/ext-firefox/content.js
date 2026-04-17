console.log('[cntest-content] injected')
window.__cntestExtensionInstalled = true

const VALID_ACTIONS = ['START_RECORDING', 'STOP_RECORDING', 'GET_RECORDINGS', 'CLEAR_RECORDING']
let isRecording = false
let isContextValid = true
let hooksInstalled = false

// BroadcastChannel 用于跨标签页同步录制状态和请求数据
let bc = null
try {
  bc = new BroadcastChannel('cntest-recorder')
  bc.onmessage = (event) => {
    const data = event.data
    if (!data || !data.type) return
    if (data.type === 'CONTROL') {
      if (data.action === 'START_RECORDING') {
        isRecording = true
        console.log('[cntest-content] bc: start recording')
      }
      if (data.action === 'STOP_RECORDING') {
        isRecording = false
        console.log('[cntest-content] bc: stop recording')
      }
    }
    if (data.type === 'CAPTURE' && data.payload) {
      // 只要当前页面有 Vue 应用监听 message，就转发给它
      window.postMessage({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: data.payload }, '*')
    }
  }
} catch (e) {
  console.warn('[cntest-content] BroadcastChannel not supported', e)
}

// 保存原始函数引用，用于恢复
let __originalFetch = null
let __originalXHR = null
let __originalOpen = null
let __originalSend = null
let __originalSetHeader = null

function getRuntime() {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return chrome.runtime
    }
  } catch {
    // context invalidated
  }
  try {
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) {
      return browser.runtime
    }
  } catch {
    // context invalidated
  }
  return null
}

function notifyContextInvalidated() {
  if (!isContextValid) return
  isContextValid = false
  console.warn('[cntest-content] extension context invalidated')
  restoreHooks()
  window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_INVALIDATED' }, '*')
}

function safeSendMessage(message) {
  const runtime = getRuntime()
  if (!runtime) {
    notifyContextInvalidated()
    return
  }
  try {
    runtime.sendMessage(message)
  } catch (err) {
    if (err && err.message && err.message.includes('Extension context invalidated')) {
      notifyContextInvalidated()
    } else {
      console.warn('[cntest-content] sendMessage error:', err)
    }
  }
}

function restoreHooks() {
  if (!hooksInstalled) return
  if (__originalFetch && window.fetch !== __originalFetch) {
    window.fetch = __originalFetch
  }
  if (__originalXHR && __originalOpen && __originalSend && __originalSetHeader) {
    if (window.XMLHttpRequest === __originalXHR || window.XMLHttpRequest.prototype.open !== __originalOpen) {
      __originalXHR.prototype.open = __originalOpen
      __originalXHR.prototype.send = __originalSend
      __originalXHR.prototype.setRequestHeader = __originalSetHeader
    }
  }
  hooksInstalled = false
  console.log('[cntest-content] hooks restored')
}

// ===== 与页面 Vue 应用通信 =====
window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'cnTest-webapp') return
  const { action } = event.data
  console.log('[cntest-content] received from page:', action)

  if (!isContextValid) {
    window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_INVALIDATED' }, '*')
    return
  }

  // 回复就绪状态
  window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_READY' }, '*')

  if (!VALID_ACTIONS.includes(action)) return

  if (action === 'START_RECORDING') {
    isRecording = true
    if (bc) bc.postMessage({ type: 'CONTROL', action: 'START_RECORDING' })
  }
  if (action === 'STOP_RECORDING') {
    isRecording = false
    if (bc) bc.postMessage({ type: 'CONTROL', action: 'STOP_RECORDING' })
  }

  safeSendMessage(event.data)
})

function onExtensionMessage(message) {
  if (message && message.source === 'cnTest-extension') {
    window.postMessage(message, '*')
  }
}

const runtime = getRuntime()
if (runtime && runtime.onMessage) {
  try {
    runtime.onMessage.addListener(onExtensionMessage)
  } catch (err) {
    console.warn('[cntest-content] addListener error:', err)
  }
}

window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_READY' }, '*')

// ===== 请求拦截与完整数据捕获 =====
const MAX_BODY_SIZE = 256 * 1024

function truncateBody(body) {
  if (!body) return body
  if (typeof body === 'string') {
    return body.length > MAX_BODY_SIZE ? body.slice(0, MAX_BODY_SIZE) + '\n... (truncated)' : body
  }
  return body
}

function parseHeaders(headerStr) {
  const result = {}
  if (!headerStr) return result
  headerStr.split('\r\n').forEach((line) => {
    const parts = line.split(': ')
    if (parts.length >= 2) {
      result[parts[0]] = parts.slice(1).join(': ')
    }
  })
  return result
}

function objectFromHeaders(headers) {
  const result = {}
  if (!headers) return result
  if (headers instanceof Headers) {
    headers.forEach((v, k) => { result[k] = v })
    return result
  }
  if (typeof headers === 'object') return headers
  return result
}

function bodyToString(body) {
  if (!body) return ''
  if (typeof body === 'string') return body
  if (body instanceof URLSearchParams) return body.toString()
  if (typeof body === 'object') {
    try {
      return JSON.stringify(body)
    } catch {
      return String(body)
    }
  }
  return String(body)
}

function inferType(url) {
  try {
    const u = new URL(url)
    const pathname = u.pathname.toLowerCase()
    const search = u.search.toLowerCase()
    const full = pathname + search

    if (u.protocol === 'ws:' || u.protocol === 'wss:') return 'ws'

    const ext = pathname.includes('.') ? pathname.split('.').pop() || '' : ''

    const img = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'avif']
    if (img.includes(ext)) return 'img'

    const media = ['mp4', 'mp3', 'webm', 'wav', 'ogg', 'm4a', 'flac', 'mov', 'mkv']
    if (media.includes(ext)) return 'media'

    const font = ['woff', 'woff2', 'ttf', 'otf', 'eot']
    if (font.includes(ext)) return 'font'

    if (ext === 'wasm') return 'wasm'

    if (ext === 'json' && full.includes('manifest')) return 'manifest'

    if (ext === 'css') return 'other'

    const doc = ['html', 'htm', 'php', 'jsp', 'asp', 'aspx']
    if (pathname === '/' || doc.includes(ext)) return 'doc'

    if (ext === 'json' || pathname.includes('/api/') || pathname.includes('/rest/') || pathname.includes('/graphql') || pathname.includes('/rpc/')) return 'fetch'

    return 'other'
  } catch {
    return 'other'
  }
}

function sendCaptured(req) {
  console.log('[cntest-content] sendCaptured:', req.url, 'isRecording:', isRecording)
  if (!isContextValid) return
  // 1) 通过 BroadcastChannel 广播给所有标签页（包括录制页）
  if (bc) {
    bc.postMessage({ type: 'CAPTURE', payload: req })
  }
  // 2) 同时发送给 background 做备份/持久化
  safeSendMessage({ source: 'cntest-capture', payload: req })
}

// ---- Install hooks ----
__originalFetch = window.fetch
__originalXHR = window.XMLHttpRequest
__originalOpen = __originalXHR.prototype.open
__originalSend = __originalXHR.prototype.send
__originalSetHeader = __originalXHR.prototype.setRequestHeader
hooksInstalled = true

window.fetch = async function (input, init) {
  const startTime = performance.now()
  const url = typeof input === 'string' ? input : input.url
  const method = (init && init.method) || 'GET'
  const reqHeaders = objectFromHeaders(init && init.headers)
  const reqBody = truncateBody(bodyToString((init && init.body) || null))

  try {
    const response = await __originalFetch.apply(this, arguments)
    const duration = Math.round(performance.now() - startTime)

    const cloned = response.clone()
    let respBody = ''
    const contentType = cloned.headers.get('content-type') || ''
    try {
      if (contentType.includes('application/json')) {
        const json = await cloned.json()
        respBody = truncateBody(JSON.stringify(json))
      } else if (contentType.includes('text/') || contentType.includes('application/javascript') || contentType.includes('application/xml')) {
        const text = await cloned.text()
        respBody = truncateBody(text)
      } else {
        respBody = '(binary content ignored)'
      }
    } catch {
      respBody = ''
    }

    const respHeaders = {}
    cloned.headers.forEach((v, k) => { respHeaders[k] = v })

    const payload = {
      method,
      url,
      name: inferName(url),
      status: String(response.status || '-'),
      duration: `${duration}ms`,
      timestamp: Date.now(),
      type: 'fetch',
      resourceType: inferType(url),
      requestHeaders: reqHeaders,
      requestBody: reqBody,
      responseHeaders: respHeaders,
      responseBody: respBody
    }
    sendCaptured(payload)
    return response
  } catch (err) {
    const duration = Math.round(performance.now() - startTime)
    sendCaptured({
      method,
      url,
      name: inferName(url),
      status: 'ERROR',
      duration: `${duration}ms`,
      timestamp: Date.now(),
      type: 'fetch',
      resourceType: inferType(url),
      requestHeaders: reqHeaders,
      requestBody: reqBody,
      responseHeaders: {},
      responseBody: String(err && err.message) || 'Network Error'
    })
    throw err
  }
}

__originalXHR.prototype.open = function (method, url) {
  this.__cntestMethod = method
  this.__cntestUrl = url
  return __originalOpen.apply(this, arguments)
}

__originalXHR.prototype.setRequestHeader = function (header, value) {
  if (!this.__cntestReqHeaders) this.__cntestReqHeaders = {}
  this.__cntestReqHeaders[header] = value
  return __originalSetHeader.apply(this, arguments)
}

__originalXHR.prototype.send = function (body) {
  const startTime = performance.now()
  const method = this.__cntestMethod || 'GET'
  const url = this.__cntestUrl || ''
  const reqHeaders = this.__cntestReqHeaders || {}
  const reqBody = truncateBody(bodyToString(body))

  const onLoad = () => {
    const duration = Math.round(performance.now() - startTime)
    const respHeaders = parseHeaders(this.getAllResponseHeaders())
    let respBody = ''
    try {
      const ct = (respHeaders['content-type'] || '').toLowerCase()
      if (ct.includes('image/') || ct.includes('video/') || ct.includes('audio/') || ct.includes('application/octet-stream')) {
        respBody = '(binary content ignored)'
      } else {
        respBody = truncateBody(String(this.responseText || ''))
      }
    } catch {
      respBody = ''
    }
    sendCaptured({
      method,
      url,
      name: inferName(url),
      status: String(this.status || '-'),
      duration: `${duration}ms`,
      timestamp: Date.now(),
      type: 'xhr',
      resourceType: inferType(url),
      requestHeaders: reqHeaders,
      requestBody: reqBody,
      responseHeaders: respHeaders,
      responseBody: respBody
    })
  }

  const onError = () => {
    const duration = Math.round(performance.now() - startTime)
    sendCaptured({
      method,
      url,
      name: inferName(url),
      status: 'ERROR',
      duration: `${duration}ms`,
      timestamp: Date.now(),
      type: 'xhr',
      resourceType: inferType(url),
      requestHeaders: reqHeaders,
      requestBody: reqBody,
      responseHeaders: {},
      responseBody: 'Network Error'
    })
  }

  this.addEventListener('load', onLoad)
  this.addEventListener('error', onError)
  this.addEventListener('abort', onError)
  return __originalSend.apply(this, arguments)
}

function inferName(url) {
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    return parts[parts.length - 1] || u.pathname || url
  } catch {
    return url
  }
}
