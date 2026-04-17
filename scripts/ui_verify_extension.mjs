import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EXTENSION_PATH = path.resolve(__dirname, '..', 'browser-extension')
const BASE_URL = 'http://localhost:8087'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

async function screenshot(page, name) {
  await page.screenshot({ path: `assets/${name}`, fullPage: false })
  console.log(`[screenshot] assets/${name}`)
}

const browser = await chromium.launch({
  headless: true,
  args: [
    `--disable-extensions-except=${EXTENSION_PATH}`,
    `--load-extension=${EXTENSION_PATH}`,
    '--disable-web-security'
  ]
})

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

  await page.locator('button:has-text("接口录制")').click()
  await page.waitForTimeout(800)
  await screenshot(page, 'ui-check-ext-drawer-left.png')

  await page.locator('button:has-text("开始录制")').click()
  await page.waitForTimeout(500)

  await page.evaluate(() => { fetch('/page-a-1') })
  await page.waitForTimeout(600)

  const page2 = await context.newPage()
  await page2.goto(`${BASE_URL}/home`, { waitUntil: 'networkidle' })
  await page2.waitForTimeout(500)
  await page2.evaluate(() => {
    fetch('/page-b-1')
    fetch('/page-b-2', { method: 'POST', body: JSON.stringify({ test: 1 }) })
  })
  await page2.waitForTimeout(800)

  await page.bringToFront()
  await page.waitForTimeout(500)
  await screenshot(page, 'ui-check-ext-cross-tab.png')

  console.log('[done]')
} catch (err) {
  console.error('[error]', err?.message || err)
} finally {
  await browser.close()
}
