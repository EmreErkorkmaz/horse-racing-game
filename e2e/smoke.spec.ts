import { expect, test } from '@playwright/test'

test('loads the application', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Horse Racing' })).toBeVisible()
})
