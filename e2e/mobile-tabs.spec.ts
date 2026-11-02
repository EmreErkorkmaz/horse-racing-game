import { expect, test, type Page } from '@playwright/test'
import {
  expectRoundModal,
  generateButton,
  horseListPanel,
  modal,
  programPanel,
  resultsPanel,
  SEEDED_URL,
  startGame,
} from './support/game'

/*
 * Phones show one side panel at a time behind tabs, so the page does not stack
 * the stable, the program and the results. Wider screens keep every panel.
 */

const PHONE = { width: 375, height: 740 }

const tabList = (page: Page) => page.getByRole('tablist', { name: 'Panels' })
const tab = (page: import('@playwright/test').Page, name: string) =>
  tabList(page).getByRole('tab', { name })

test('switches the phone panel with the game and on request', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await page.goto(SEEDED_URL)
  await expect(tabList(page)).toBeVisible()
  await expect(page.getByRole('region', { name: 'Race track' })).toBeVisible()

  await expect(tab(page, 'Horses')).toHaveAttribute('aria-selected', 'true')
  await expect(horseListPanel(page)).toBeVisible()
  await expect(programPanel(page)).toBeHidden()
  await expect(resultsPanel(page)).toBeHidden()

  await generateButton(page).click()
  await expect(tab(page, 'Program')).toHaveAttribute('aria-selected', 'true')
  await expect(programPanel(page)).toBeVisible()
  await expect(horseListPanel(page)).toBeHidden()

  await page.getByLabel('4x').check()
  await page.locator('[data-test="toggle"]').click()
  await expectRoundModal(page, 1)
  await modal(page).getByRole('button', { name: 'Next round' }).click()
  await expect(tab(page, 'Results')).toHaveAttribute('aria-selected', 'true')
  await expect(resultsPanel(page)).toBeVisible()
  await expect(programPanel(page)).toBeHidden()

  await tab(page, 'Horses').click()
  await expect(horseListPanel(page)).toBeVisible()
  await expect(resultsPanel(page)).toBeHidden()
})

for (const viewport of [
  { width: 768, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`shows every panel without tabs at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto(SEEDED_URL)
    await startGame(page)
    await expect(tabList(page)).toBeHidden()
    for (const panel of [horseListPanel, programPanel, resultsPanel]) {
      await expect(panel(page)).toBeVisible()
    }
  })
}

test('stops the page from bouncing past its ends', async ({ page }) => {
  await page.goto(SEEDED_URL)
  const overscroll = await page.evaluate(
    () => getComputedStyle(document.documentElement).overscrollBehaviorY,
  )
  expect(overscroll).toBe('none')
})
