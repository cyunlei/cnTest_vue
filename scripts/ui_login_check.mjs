import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8085'
const USERNAME = 'cnTest'
const PASSWORD = 'aB15110264121!'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

function logStep(msg) {
  console.log(`[ui-check] ${msg}`)
}

async function tryClick(page, selectors) {
  for (const s of selectors) {
    const loc = page.locator(s).first()
    if (await loc.count()) {
      await loc.click({ timeout: 3000 }).catch(() => {})
      return true
    }
  }
  return false
}

async function tryFill(page, selectors, value) {
  for (const s of selectors) {
    const loc = page.locator(s).first()
    if (await loc.count()) {
      await loc.fill(value, { timeout: 3000 }).catch(() => {})
      return true
    }
  }
  return false
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()
page.on('response', async (resp) => {
  const url = resp.url()
  if (url.includes('/accounts') || url.includes('/auth') || url.includes('/login')) {
    let bodyText = ''
    try {
      bodyText = await resp.text()
    } catch (e) {
      void e
    }
    logStep(`api ${resp.status()} ${url} body=${bodyText.slice(0, 300)}`)
  }
})
page.on('request', (req) => {
  const url = req.url()
  if (url.includes('/accounts')) {
    logStep(`request ${req.method()} ${url}`)
  }
})
page.on('requestfailed', (req) => {
  const url = req.url()
  if (url.includes('/accounts')) {
    logStep(`requestfailed ${req.method()} ${url} err=${req.failure()?.errorText || ''}`)
  }
})

try {
  logStep('open root page and inject token')
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
  }, FORCE_TOKEN)
  await page.goto(`${BASE_URL}/case-mgmt`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await page.screenshot({ path: 'assets/ui-check-case-mgmt-token.png', fullPage: true })

  logStep(`case-mgmt url=${page.url()}`)
  const clickableTexts = await page.locator('a,button,.el-button,span').evaluateAll((els) =>
    els
      .map((el) => (el.textContent || '').trim())
      .filter((t) => t && t.length <= 16)
      .slice(0, 80)
  )
  logStep(`clickable sample=${JSON.stringify(clickableTexts)}`)

  // 先尝试点击第一条用例名称进入详情（一般是可点击链接）
  await page.locator('table tbody tr td a').first().click({ timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(1800)
  await page.screenshot({ path: 'assets/ui-check-case-config.png', fullPage: true })
  logStep(`after click case url=${page.url()}`)

  await tryClick(page, [
    'text=步骤配置',
    'text=用例配置',
    'text=测试步骤',
    'text=HTTP',
    'text=新增步骤',
    'button:has-text("HTTP")',
    '.el-button:has-text("HTTP")'
  ])
  await page.locator('button:has-text("HTTP")').first().click({ timeout: 3000 }).catch(() => {})
  await page.locator('.el-button:has-text("HTTP")').first().click({ timeout: 3000 }).catch(() => {})
  await page.waitForTimeout(1200)
  await page.screenshot({ path: 'assets/ui-check-after-open-drawer.png', fullPage: true })
  const drawerCount = await page.locator('.http-step-drawer,.el-drawer').count()
  logStep(`drawer count=${drawerCount}`)

  await tryClick(page, [
    'text=测试一下',
    'button:has-text("测试一下")',
    '.el-button:has-text("测试一下")'
  ])
  await page.waitForTimeout(1500)
  await page.locator('.http-step-drawer .el-drawer__body').evaluate((el) => {
    el.scrollTop = el.scrollHeight
  }).catch(() => {})
  await page.waitForTimeout(800)

  await page.screenshot({ path: 'assets/ui-check-http-drawer.png', fullPage: true })
  await page.locator('.response-container').first().screenshot({ path: 'assets/ui-check-response-container.png' }).catch(() => {})

  const items = page.locator('.execution-result-item')
  const count = await items.count()
  logStep(`execution-result-item count=${count}`)
  if (count > 0) {
    const firstText = (await items.first().innerText()).trim()
    const firstClass = await items.first().getAttribute('class')
    logStep(`first item text=${firstText}`)
    logStep(`first item class=${firstClass}`)
  }
} catch (err) {
  console.error('[ui-check] error:', err?.message || err)
} finally {
  await browser.close()
}
