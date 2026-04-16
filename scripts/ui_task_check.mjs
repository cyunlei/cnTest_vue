import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8085'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
  }, FORCE_TOKEN)

  // 截图1: 任务列表
  await page.goto(`${BASE_URL}/task-mgmt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'assets/ui-check-task-list.png', fullPage: true })
  console.log('task list screenshot saved')

  // 截图2: 任务详情
  await page.goto(`${BASE_URL}/task-mgmt/detail/495207`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'assets/ui-check-task-detail.png', fullPage: true })
  console.log('task detail screenshot saved')

  // 截图3: 任务监控
  await page.goto(`${BASE_URL}/task-mgmt`, { waitUntil: 'networkidle' })
  await page.locator('.tab-item').nth(1).click().catch(() => {})
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'assets/ui-check-task-monitor.png', fullPage: true })
  console.log('task monitor screenshot saved')

  // 截图4: 新增任务
  await page.goto(`${BASE_URL}/task-mgmt/create`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'assets/ui-check-task-create.png', fullPage: true })
  console.log('task create screenshot saved')
} catch (err) {
  console.error('error:', err?.message || err)
} finally {
  await browser.close()
}
