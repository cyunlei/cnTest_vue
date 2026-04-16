import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8089'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

// 拦截API请求避免401跳转
await page.route('http://127.0.0.1:8080/**', async route => {
  const request = route.request()
  const url = request.url()
  if (url.includes('/projects') || url.includes('/testcases') || url.includes('/suites') || url.includes('/accounts') || url.includes('/step')) {
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

  // 测试1：用例配置页面的"接口录制"按钮
  await page.goto(`${BASE_URL}/case-config/123?project_id=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)
  await screenshot('assets/ui-check-case-config-before.png')

  await page.locator('button:has-text("接口录制")').click()
  await page.waitForTimeout(800)
  await screenshot('assets/ui-check-case-config-record-open.png')

  // 关闭抽屉
  await page.locator('.api-record-close').click()
  await page.waitForTimeout(300)

  // 测试2：用例列表页面的"新增步骤"下拉中的"接口录制"
  await page.goto(`${BASE_URL}/case-mgmt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2500)

  // hover 或点击"新增步骤"下拉
  await page.locator('text=新增步骤').first().click()
  await page.waitForTimeout(400)
  await screenshot('assets/ui-check-case-mgmt-dropdown.png')

  await page.locator('text=接口录制').click()
  await page.waitForTimeout(800)
  await screenshot('assets/ui-check-case-mgmt-record-open.png')

  console.log('[done]')
} catch (err) {
  console.error('[error]', err?.message || err)
} finally {
  await browser.close()
}
