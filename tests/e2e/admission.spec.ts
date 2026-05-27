import path from 'node:path'

import { expect, test } from '@playwright/test'

const uploadImage = path.join(process.cwd(), 'public/scanner-to-pay.jpeg')

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'skf_cookie_consent',
      JSON.stringify({ analytics: false, marketing: false, timestamp: new Date().toISOString() })
    )
  })

  await page.route('**/api/auth/portal/session', async (route) => {
    await route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Unauthorized' }),
    })
  })
})

test('parent can complete MP admission with promo, photo, payment proof, and consents', async ({ page }) => {
  await page.route('**/api/admissions/quote?**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          branchSlug: 'mp-sports-club',
          branchName: 'MP Sports Club',
          quotedMonthlyFee: 2500,
          quotedAdmissionFee: 1500,
          quotedDressFee: 0,
          quotedJoiningTotal: 1500,
          promoCode: 'EARLYBIRDMP',
          promoSnapshot: {
            code: 'EARLYBIRDMP',
            original: { admissionFee: 2500, dressFee: 0, monthlyFee: 2500 },
            joiningTotalBeforeDiscount: 2500,
            joiningTotalAfterDiscount: 1500,
          },
          notes: 'Admission payment covers admission only.',
        },
      }),
    })
  })

  let submittedBody = ''
  await page.route('**/api/admissions', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback()
      return
    }

    submittedBody = route.request().postData() || ''
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          applicationId: '22222222-2222-4222-8222-222222222222',
          branchName: 'MP Sports Club',
          status: 'pending',
          quotedMonthlyFee: 2500,
          quotedAdmissionFee: 1500,
          quotedDressFee: 0,
          quotedJoiningTotal: 1500,
          promoSnapshot: {},
        },
      }),
    })
  })

  await page.goto('/admission/mp-sports-club')
  await page.getByRole('button', { name: /begin admission/i }).click()

  await page.locator('input[type="file"]').setInputFiles(uploadImage)
  await page.locator('#studentName').fill('Aarav Kumar')
  await page.locator('#studentDob').fill('15012014')
  await page.locator('#schoolClass').fill('Grade 6')
  await page.locator('#expectedJoinDate').fill('27052026')
  await page.getByRole('button', { name: /continue/i }).click()

  await page.locator('#guardianName').fill('Ravi Kumar')
  await page.locator('#guardianRelationship').selectOption('Father')
  await page.locator('#guardianPhone').fill('9876543210')
  await page.locator('#guardianEmail').fill('ravi@example.com')
  await page.locator('#emergencyName').fill('Meena Kumar')
  await page.locator('#emergencyRelationship').fill('Mother')
  await page.locator('#emergencyPhone').fill('9876543211')
  await page.getByRole('button', { name: /continue/i }).click()

  await page.locator('input[name="hasPreviousTraining"]').check()
  await page.locator('#martialArtsStyle').fill('Karate')
  await page.locator('#currentBelt').fill('Yellow')
  await page.locator('#previousDojo').fill('Old Dojo')
  await page.locator('#trainingDuration').fill('1 year')
  await page.getByRole('button', { name: /continue/i }).click()

  await expect(page.getByText('Admission Fee')).toBeVisible()
  await expect(page.getByText('₹2,500').first()).toBeVisible()
  await page.locator('#promoCode').fill('EARLYBIRDMP')
  await expect(page.getByText('Checking promo code...')).toBeVisible()
  await expect(page.getByText('EARLYBIRDMP Promo')).toBeVisible()
  await expect(page.getByText('-₹1,000')).toBeVisible()
  await expect(page.getByText('₹1,500').first()).toBeVisible()
  await expect(page.getByText(/Monthly Fee/i)).toHaveCount(0)

  await page.getByRole('button', { name: /continue/i }).click()
  await expect(page.getByText('Upload the payment screenshot before continuing.')).toBeVisible()

  await page.locator('input[type="file"]').setInputFiles(uploadImage)
  await page.getByRole('button', { name: /continue/i }).click()

  await page.locator('input[name="accuracyConsent"]').check()
  await page.locator('input[name="participationConsent"]').check()
  await page.locator('input[name="dataConsent"]').check()
  await page.getByRole('button', { name: /submit application/i }).click()

  await expect(page.getByText('Admission Submitted')).toBeVisible()
  expect(submittedBody).toContain('name="studentPhoto"')
  expect(submittedBody).toContain('name="paymentProof"')
  expect(submittedBody).toContain('name="promoCode"')
  expect(submittedBody).toContain('EARLYBIRDMP')
  expect(submittedBody).toContain('name="accuracyConsent"')
  expect(submittedBody).toContain('name="participationConsent"')
  expect(submittedBody).toContain('name="dataConsent"')
})
