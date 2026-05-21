import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'skf_cookie_consent',
      JSON.stringify({ analytics: false, marketing: false, timestamp: new Date().toISOString() })
    )
  })
})

test('shows WhatsApp action to public visitors', async ({ page }) => {
  await page.route('**/api/auth/portal/session', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    })
  })

  await page.goto('/')

  const whatsappAction = page.getByLabel('Chat with us on WhatsApp')
  await expect(whatsappAction).toBeVisible({ timeout: 7000 })
  await expect(whatsappAction).toHaveAttribute('href', /https:\/\/wa\.me\//)
})

test('shows portal action to authenticated athletes', async ({ page }) => {
  await page.route('**/api/auth/portal/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        skfId: 'SKF26MP001',
        name: 'Test Student',
        branch: 'mp-sports-club',
        belt: 'white',
        role: 'student',
        isBlackBeltCandidate: false,
      }),
    })
  })

  await page.goto('/')

  const portalAction = page.getByLabel('Open athlete portal')
  await expect(portalAction).toBeVisible()
  await expect(portalAction).toHaveAttribute('href', /\/portal\/dashboard$/)
  await expect(page.getByLabel('Chat with us on WhatsApp')).toHaveCount(0)
})
