import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8090'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

await page.route('http://127.0.0.1:8080/**', async route => {
  const url = route.request().url()
  if (url.includes('/projects') || url.includes('/testcases') || url.includes('/suites') || url.includes('/accounts') || url.includes('/step')) {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ code: 0, data: { list: [], total: 0 } }) })
  } else route.continue()
})

await page.goto(BASE_URL, { waitUntil: 'networkidle' })
await page.evaluate((token) => { localStorage.setItem('token', token) }, FORCE_TOKEN)

await page.goto(`${BASE_URL}/case-config/123?project_id=1`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.locator('button:has-text("接口录制")').click()
await page.waitForTimeout(800)
await page.screenshot({ path: 'assets/ui-check-api-record-left.png', fullPage: false })
console.log('[done]')
await browser.close()
