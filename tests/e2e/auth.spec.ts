import { test, expect } from '@playwright/test'

test('portal login page loads', async ({ page }) => {
  await page.goto('/portal/login')
  await expect(page.getByText('SKF')).toBeVisible()
})

test('invalid PIN shows error', async ({ page }) => {
  await page.goto('/portal/login')
  // This will be expanded as auth is built
})
