console.log('[cntest-content] injected')
window.__cntestExtensionInstalled = true

const VALID_ACTIONS = ['START_RECORDING', 'STOP_RECORDING', 'GET_RECORDINGS', 'CLEAR_RECORDING']

window.addEventListener('message', (event) => {
  if (event.source !== window || !event.data || event.data.source !== 'cnTest-webapp') return
  const { action } = event.data
  console.log('[cntest-content] received from page:', action)

  // 确保页面能感知到扩展已就绪（Drawer 可能是后挂载的，会错过初始广播）
  window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_READY' }, '*')

  if (!VALID_ACTIONS.includes(action)) return

  const runtime =
    (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage)
      ? chrome.runtime
      : (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage)
        ? browser.runtime
        : null

  if (runtime) {
    console.log('[cntest-content] sending to background:', action)
    runtime.sendMessage(event.data)
  } else {
    console.warn('[cntest-content] no runtime found')
  }
})

function onExtensionMessage(message) {
  console.log('[cntest-content] received from background:', message)
  if (message && message.source === 'cnTest-extension') {
    window.postMessage(message, '*')
  }
}

const runtimeOnMessage =
  (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage)
    ? chrome.runtime.onMessage
    : (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage)
      ? browser.runtime.onMessage
      : null

if (runtimeOnMessage) {
  runtimeOnMessage.addListener(onExtensionMessage)
}

// 初始广播一次 EXTENSION_READY
window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_READY' }, '*')
