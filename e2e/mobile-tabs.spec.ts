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
 * Phones show one side panel at a time behind tabs. The page scrolls past the
 * header and the track until the active panel fills the screen; long panels
 * scroll inside. Wider screens keep every panel.
 */

const PHONE = { width: 375, height: 740 }

const tabList = (page: Page) => page.getByRole('tablist', { name: 'Panels' })
const tab = (page: Page, name: string) => tabList(page).getByRole('tab', { name })

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

test('lets the phone page scroll until the active panel fills the screen', async ({ page }) => {
  await page.setViewportSize(PHONE)
  await page.goto(SEEDED_URL)
  await generateButton(page).click()
  await expect(programPanel(page)).toBeVisible()

  const { scrollable, pageHeight, visiblePanel } = await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight)
    const program = [...document.querySelectorAll('section[aria-labelledby]')].find(
      (section) =>
        document.getElementById(section.getAttribute('aria-labelledby')!)?.textContent ===
        'Program',
    )!
    const box = program.getBoundingClientRect()
    return {
      scrollable: document.documentElement.scrollHeight > window.innerHeight,
      pageHeight: document.documentElement.scrollHeight,
      visiblePanel: Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0),
    }
  })

  // The page scrolls past the header and the track...
  expect(scrollable).toBe(true)
  // ...until the panel takes most of the screen, while six rounds still scroll inside it.
  expect(visiblePanel).toBeGreaterThanOrEqual(PHONE.height * 0.7)
  expect(pageHeight).toBeLessThanOrEqual(PHONE.height * 2)
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
