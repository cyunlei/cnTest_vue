import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8088'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

// 拦截API请求避免401跳转
await page.route('http://127.0.0.1:8080/**', async route => {
  const request = route.request()
  const url = request.url()
  if (url.includes('/projects') || url.includes('/testcases') || url.includes('/suites') || url.includes('/accounts')) {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ code: 0, data: { list: [], total: 0 } })
    })
  } else {
    await route.continue()
  }
})

async function screenshot(path, fullPage = false) {
  await page.screenshot({ path, fullPage })
  console.log(`[screenshot] ${path}`)
}

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
  }, FORCE_TOKEN)

  // 打开用例管理并自动弹出录制抽屉
  await page.goto(`${BASE_URL}/case-mgmt?record=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await screenshot('assets/ui-check-api-record-drawer.png')

  // 点击开始录制
  await page.locator('button:has-text("开始录制")').click()
  await page.waitForTimeout(300)

  // 触发一些请求
  await page.evaluate(() => {
    fetch('/mock-test-1')
    fetch('/mock-test-2', { method: 'POST', body: JSON.stringify({ a: 1 }) })
  })
  await page.waitForTimeout(800)

  await screenshot('assets/ui-check-api-record-capturing.png')

  console.log('[done]')
} catch (err) {
  console.error('[error]', err?.message || err)
} finally {
  await browser.close()
}
