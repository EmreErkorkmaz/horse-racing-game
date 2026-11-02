/**
 * Shared constants, locators and actions for the end-to-end and visual specs.
 *
 * Locators use roles and accessible names first; data-test hooks only where no
 * role fits. The start button uses one because its label changes between
 * Start, Pause and Resume.
 */
import { expect, type Page } from '@playwright/test'
import { GAME_CONFIG } from '../../src/config/game'

export const ROUND_COUNT = GAME_CONFIG.roundDistances.length

/** Seed shared by the specs, so every run races the same stable and program. */
export const SEED = 7
/** App URL that loads the shared seed. */
export const SEEDED_URL = `/?seed=${SEED}`

/*
 * Waits allow at least three times the unloaded duration. A busy machine (a slow CI
 * runner, the emulated visual container running alongside) delivers fewer
 * animation frames, and the frame cap then slows the race in wall-clock time.
 */
/** Longest wait for one round to finish at 4x playback (about 3.5 s unloaded). */
export const ROUND_TIMEOUT_4X = 15_000
/** Longest wait for one round to finish at 1x playback (about 14 s unloaded). */
export const ROUND_TIMEOUT_1X = 45_000
/** Test budget for flows that run several rounds (about 21 s unloaded for six rounds at 4x). */
export const MULTI_ROUND_TEST_TIMEOUT = 120_000

export const generateButton = (page: Page) => page.getByRole('button', { name: 'Generate Program' })
export const toggleButton = (page: Page) => page.locator('[data-test="toggle"]')
export const modal = (page: Page) => page.getByRole('dialog')
export const horseListPanel = (page: Page) => page.getByRole('region', { name: /Horse List/ })
export const programPanel = (page: Page) => page.getByRole('region', { name: 'Program' })
export const resultsPanel = (page: Page) => page.getByRole('region', { name: 'Results' })
export const trackLabel = (page: Page) =>
  page.getByRole('region', { name: 'Race track' }).getByRole('heading', { level: 2 })
export const runners = (page: Page) => page.locator('[data-test="runner"]')
/** The horse count field; a role is needed because the phone panel tab is also named Horses. */
export const horseCountInput = (page: Page) => page.getByRole('spinbutton', { name: 'Horses' })

/** Generates a program at the given playback speed and starts the first round. */
export async function startGame(page: Page, speed: '1x' | '2x' | '4x' = '4x') {
  await page.getByLabel(speed).check()
  await generateButton(page).click()
  await toggleButton(page).click()
}

/** Text of each row of the round shown in the modal (position, horse number and name), in finishing order. */
export function modalRows(page: Page): Promise<string[]> {
  return modal(page).locator('[data-test="latest-round"] tbody tr').allInnerTexts()
}

/** Waits for the result modal of the given 1-based round, with one collapsed section per earlier round. */
export async function expectRoundModal(page: Page, round: number) {
  await expect(modal(page)).toBeVisible({ timeout: ROUND_TIMEOUT_4X })
  await expect(modal(page).getByRole('heading', { level: 2 })).toHaveText(
    new RegExp(`^Round ${round} - \\d+m finished$`),
  )
  await expect(modal(page).locator('details')).toHaveCount(round - 1)
}

/** Runs a started game through every round and ends it with Finish on the last modal. */
export async function playToFinish(page: Page) {
  for (let round = 1; round < ROUND_COUNT; round++) {
    await expectRoundModal(page, round)
    await modal(page).getByRole('button', { name: 'Next round' }).click()
  }
  await expectRoundModal(page, ROUND_COUNT)
  await modal(page).getByRole('button', { name: 'Finish' }).click()
  await expect(modal(page)).toBeHidden()
}

/** Resolves after the browser has rendered the given number of animation frames. */
export function waitForFrames(page: Page, count: number): Promise<void> {
  return page.evaluate(
    (frames) =>
      new Promise<void>((resolve) => {
        const next = (left: number) =>
          left === 0 ? resolve() : requestAnimationFrame(() => next(left - 1))
        next(frames)
      }),
    count,
  )
}

/** Inline transforms of the runners, which encode their positions on the track. */
export function runnerPositions(page: Page): Promise<string[]> {
  return runners(page).evaluateAll((elements) =>
    elements.map((runner) => (runner as HTMLElement).style.transform),
  )
}
