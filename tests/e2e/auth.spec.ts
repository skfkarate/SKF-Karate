import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/api/auth/portal/session', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    })
  })

  await page.addInitScript(() => {
    localStorage.setItem(
      'skf_cookie_consent',
      JSON.stringify({ analytics: false, marketing: false, timestamp: new Date().toISOString() })
    )
  })
})

test('portal login page loads', async ({ page }) => {
  await page.goto('/portal/login')
  await expect(page.getByText('SKF Karate')).toBeVisible()
  await expect(page.getByLabel('Registration ID')).toBeVisible()
  await expect(page.getByLabel('Date of Birth')).toBeVisible()
})

test('invalid DOB login shows error', async ({ page }) => {
  await page.route('**/api/auth/portal', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback()
      return
    }

    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Invalid SKF ID or date of birth' }),
    })
  })

  await page.goto('/portal/login')
  await page.getByLabel('Registration ID').fill('SKF-0000-0000')
  await page.getByLabel('Date of Birth').fill('01-01-2000')
  await page.getByRole('button', { name: /access portal/i }).click()
  await expect(page.locator('.dojo-login__error')).toBeVisible()
})
