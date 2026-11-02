import { expect, test, type Locator, type Page } from '@playwright/test'
import {
  expectRoundModal,
  modal,
  programPanel,
  resultsPanel,
  SEEDED_URL,
  startGame,
} from './support/game'

/*
 * Program and Results scroll together: side by side they share one scroller
 * and stay aligned round by round; in the one-column phone layout the page
 * scrolls instead of either panel.
 */

const FINISHED_ROUNDS = 2

const roundsScroll = (page: Page) => page.locator('[data-test="rounds-scroll"]')

/** Runs the given number of rounds and ends the program, so both panels have tables. */
async function finishRounds(page: Page, count: number) {
  await startGame(page)
  for (let round = 1; round < count; round++) {
    await expectRoundModal(page, round)
    await modal(page).getByRole('button', { name: 'Next round' }).click()
  }
  await expectRoundModal(page, count)
  await modal(page).getByRole('button', { name: 'Finish' }).click()
  await expect(modal(page)).toBeHidden()
}

/**
 * Largest vertical overflow among the scrollable elements in `region` (itself
 * included), so 0 means nothing in it scrolls on its own.
 */
function innerOverflow(region: Locator): Promise<number> {
  return region.evaluate((root) =>
    Math.max(
      0,
      ...[root, ...root.querySelectorAll('*')]
        .filter((element) => ['auto', 'scroll'].includes(getComputedStyle(element).overflowY))
        .map((element) => element.scrollHeight - element.clientHeight),
    ),
  )
}

/** Top edge of the table captioned with the given round title inside `region`. */
async function captionTop(region: Locator, title: string): Promise<number> {
  const box = await region.getByRole('table', { name: title }).boundingBox()
  return box!.y
}

/* 768px is the first side-by-side breakpoint, 1440px the four-column layout. */
for (const viewport of [
  { width: 768, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`scrolls the program and the results as one, aligned by round, at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.goto(SEEDED_URL)
    await finishRounds(page, FINISHED_ROUNDS)

    expect(await innerOverflow(programPanel(page))).toBe(0)
    expect(await innerOverflow(resultsPanel(page))).toBe(0)

    const scroller = roundsScroll(page)
    expect(await scroller.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(0)

    const programBefore = (await programPanel(page).boundingBox())!.y
    const resultsBefore = (await resultsPanel(page).boundingBox())!.y
    await scroller.evaluate((el) => el.scrollBy(0, 200))
    const programShift = programBefore - (await programPanel(page).boundingBox())!.y
    const resultsShift = resultsBefore - (await resultsPanel(page).boundingBox())!.y
    expect(programShift).toBeGreaterThan(0)
    expect(resultsShift).toBeCloseTo(programShift, 0)

    for (const title of ['Round 1 - 1200m', 'Round 2 - 1400m']) {
      const programTop = await captionTop(programPanel(page), title)
      expect(await captionTop(resultsPanel(page), title)).toBeCloseTo(programTop, 0)
    }
  })
}

test('lets the page scroll instead of either panel on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(SEEDED_URL)
  await finishRounds(page, FINISHED_ROUNDS)
  expect(await innerOverflow(roundsScroll(page))).toBe(0)
})
