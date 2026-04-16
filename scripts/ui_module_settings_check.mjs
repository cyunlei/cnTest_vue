import { chromium } from 'playwright'

const BASE_URL = 'http://localhost:8085'
const FORCE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzc0NjkwMjAxLCJpYXQiOjE3NzQ2MDM4MDEsImp0aSI6ImM5ZmJhODJmMjM1MjQ1MjRiNmEzMWI5MDA2ZjA1MmFjIiwidXNlcl9pZCI6IjI4IiwidXNlcm5hbWUiOiJjblRlc3QiLCJwd2Rfc25pcHBldCI6InBia2RmMl9zaGEyNTYkMTIifQ.KZNEEDrJ8jdiCNL04OuPgBj8G-wsGOZdP1G3WM_J4d8'

const pages = [
  { path: '/module-settings/basic-info', file: 'module-basic-info' },
  { path: '/module-settings/member-mgmt', file: 'module-member-mgmt' },
  { path: '/module-settings/personal-config', file: 'module-personal-config' },
  { path: '/module-settings/tag-mgmt', file: 'module-tag-mgmt' },
  { path: '/module-settings/whitelist-mgmt', file: 'module-whitelist-mgmt' },
  { path: '/module-settings/variable-template', file: 'module-variable-template' },
  { path: '/module-settings/function-template', file: 'module-function-template' },
  { path: '/module-settings/framework-template', file: 'module-framework-template' },
  { path: '/module-settings/account-auth', file: 'module-account-auth' },
  { path: '/module-settings/file-mgmt', file: 'module-file-mgmt' },
  { path: '/module-settings/env-mgmt', file: 'module-env-mgmt' },
  { path: '/module-settings/recycle-bin', file: 'module-recycle-bin' },
  { path: '/module-settings/api-change', file: 'module-api-change' }
]

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } })
const page = await context.newPage()

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.evaluate((token) => {
    localStorage.setItem('token', token)
  }, FORCE_TOKEN)

  for (const p of pages) {
    await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    await page.screenshot({ path: `assets/ui-check-${p.file}.png`, fullPage: true })
    console.log(`screenshot: ${p.file}`)
  }
} catch (err) {
  console.error('error:', err?.message || err)
} finally {
  await browser.close()
}
