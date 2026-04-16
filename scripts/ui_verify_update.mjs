import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8087'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

// 拦截API请求，避免401跳转
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

async function screenshot(path, fullPage = true) {
  const url = page.url()
  console.log(`[url] ${url}`)
  await page.screenshot({ path, fullPage })
  console.log(`[screenshot] ${path}`)
}

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
  }, FORCE_TOKEN)
  await page.waitForTimeout(500)

  // 1. 环境管理
  await page.goto(`${BASE_URL}/module-settings/env-mgmt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await screenshot('assets/ui-check-env-mgmt.png')

  // 2. 回收站
  await page.goto(`${BASE_URL}/module-settings/recycle-bin`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await screenshot('assets/ui-check-recycle-bin.png')

  // 3. 用例管理
  await page.goto(`${BASE_URL}/case-mgmt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(3000)
  await screenshot('assets/ui-check-case-mgmt-updated.png')

} catch (err) {
  console.error('[error]', err?.message || err)
} finally {
  await browser.close()
}
