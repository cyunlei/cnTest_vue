import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8087'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

async function screenshot(page, name) {
  await page.screenshot({ path: `assets/${name}`, fullPage: false })
  console.log(`[screenshot] assets/${name}`)
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })

await context.route('http://127.0.0.1:8080/**', async route => {
  const url = route.request().url()
  if (url.includes('/projects') || url.includes('/testcases') || url.includes('/suites') || url.includes('/accounts') || url.includes('/step')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { list: [], total: 0 } }) })
  } else route.continue()
})

const page = await context.newPage()

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => { localStorage.setItem('token', token) }, FORCE_TOKEN)

  await page.goto(`${BASE_URL}/case-config/123?project_id=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)

  // 注入模拟扩展脚本，与 ApiRecordDrawer.vue 的协议一致
  await page.addInitScript(() => {
    window.__cntestMockExtension = {
      recording: false,
      sendRecordedRequest(req) {
        window.postMessage({ source: 'cnTest-extension', action: 'RECORDED_REQUEST', payload: req }, '*')
      }
    }
    window.addEventListener('message', (event) => {
      if (event.source !== window || !event.data || event.data.source !== 'cnTest-webapp') return
      const { action } = event.data
      if (action === 'START_RECORDING') {
        window.__cntestMockExtension.recording = true
      } else if (action === 'STOP_RECORDING') {
        window.__cntestMockExtension.recording = false
      } else if (action === 'GET_RECORDINGS') {
        // 模拟立即返回空列表（Vue 组件在 onMounted 时会调用）
        window.postMessage({ source: 'cnTest-extension', action: 'ALL_RECORDINGS', payload: [] }, '*')
      } else if (action === 'CLEAR_RECORDING') {
        // no-op in mock
      }
    })
    // 立即发送 EXTENSION_READY
    window.postMessage({ source: 'cnTest-extension', action: 'EXTENSION_READY' }, '*')
  })

  // 重新加载页面以让 init script 生效
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)

  // 打开录制抽屉
  await page.locator('button:has-text("接口录制")').click()
  await page.waitForTimeout(800)

  // 点击开始录制
  await page.locator('button:has-text("开始录制")').click()
  await page.waitForTimeout(500)

  // page1 本地请求 - 由于扩展已就绪，Vue 不会再安装 fetch hook
  // 所以 page1 的 fetch 不会自动被捕获，需要手动模拟扩展发送消息
  await page.evaluate(() => { fetch('/page-a-1') })
  await page.waitForTimeout(300)
  await page.evaluate(() => {
    window.__cntestMockExtension.sendRecordedRequest({
      id: 'sim-1', method: 'GET', url: `${location.origin}/page-a-1`, name: 'page-a-1', event: '', status: '200', duration: '12ms', timestamp: Date.now()
    })
  })
  await page.waitForTimeout(300)

  // 打开 page2
  const page2 = await context.newPage()
  await page2.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle' })
  await page2.waitForTimeout(800)

  // page2 触发请求
  await page2.evaluate(() => {
    fetch('/page-b-1')
    fetch('/page-b-2', { method: 'POST', body: JSON.stringify({ test: 1 }) })
  })
  await page2.waitForTimeout(600)

  // 模拟 background 将 page2 的请求转发给 page1 的 Vue 应用
  await page.evaluate(() => {
    window.__cntestMockExtension.sendRecordedRequest({
      id: 'sim-2', method: 'GET', url: `${location.origin}/page-b-1`, name: 'page-b-1', event: '', status: '200', duration: '8ms', timestamp: Date.now()
    })
    window.__cntestMockExtension.sendRecordedRequest({
      id: 'sim-3', method: 'POST', url: `${location.origin}/page-b-2`, name: 'page-b-2', event: '', status: '201', duration: '15ms', timestamp: Date.now()
    })
  })
  await page.waitForTimeout(500)

  await page.bringToFront()
  await page.waitForTimeout(800)
  await screenshot(page, 'ui-check-ext-cross-tab-sim.png')

  // 验证列表中是否有 3 条记录（通过文本匹配）
  const pageText = await page.locator('.api-record-list').innerText()
  const hasA = pageText.includes('page-a-1')
  const hasB1 = pageText.includes('page-b-1')
  const hasB2 = pageText.includes('page-b-2')
  console.log('[verify] page-a-1:', hasA)
  console.log('[verify] page-b-1:', hasB1)
  console.log('[verify] page-b-2:', hasB2)
  console.log('[verify] all passed:', hasA && hasB1 && hasB2)

  console.log('[done]')
} catch (err) {
  console.error('[error]', err?.message || err)
} finally {
  await browser.close()
}
