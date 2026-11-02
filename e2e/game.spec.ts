import { expect, test } from '@playwright/test'
import { GAME_CONFIG } from '../src/config/game'
import {
  expectRoundModal,
  generateButton,
  horseCountInput,
  horseListPanel,
  modal,
  modalRows,
  MULTI_ROUND_TEST_TIMEOUT,
  programPanel,
  resultsPanel,
  ROUND_COUNT,
  ROUND_TIMEOUT_1X,
  ROUND_TIMEOUT_4X,
  runnerPositions,
  runners,
  SEEDED_URL,
  startGame,
  toggleButton,
  trackLabel,
  waitForFrames,
} from './support/game'

test('runs the whole program round by round and lists every result', async ({ page }) => {
  test.setTimeout(MULTI_ROUND_TEST_TIMEOUT)
  await page.goto(SEEDED_URL)
  await startGame(page)

  for (let round = 1; round < ROUND_COUNT; round++) {
    await expectRoundModal(page, round)
    await modal(page).getByRole('button', { name: 'Next round' }).click()
  }

  await expectRoundModal(page, ROUND_COUNT)
  await expect(modal(page).getByRole('button')).toHaveText(['Finish'])
  await modal(page).getByRole('button', { name: 'Finish' }).click()

  await expect(modal(page)).toBeHidden()
  await expect(resultsPanel(page).getByRole('table')).toHaveCount(ROUND_COUNT)
  await expect(trackLabel(page)).toHaveText(
    'Program finished. Generate a new program to race again.',
  )
  await expect(toggleButton(page)).toBeDisabled()
  await expect(generateButton(page)).toBeEnabled()
})

test('pauses and resumes the race', async ({ page }) => {
  await page.goto(SEEDED_URL)
  await startGame(page, '1x')
  await expect(toggleButton(page)).toHaveText('Pause')
  await expect(generateButton(page)).toBeDisabled()

  const start = await runnerPositions(page)
  await expect.poll(() => runnerPositions(page)).not.toEqual(start)
  await toggleButton(page).click()
  await expect(toggleButton(page)).toHaveText('Resume')
  const paused = await runnerPositions(page)
  await waitForFrames(page, 20)
  expect(await runnerPositions(page)).toEqual(paused)

  await toggleButton(page).click()
  await expect(toggleButton(page)).toHaveText('Pause')
  await expect.poll(() => runnerPositions(page)).not.toEqual(paused)
})

test('speeds up the gallop together with the playback speed', async ({ page }) => {
  await page.goto(SEEDED_URL)
  const track = page.getByRole('region', { name: 'Race track' }).locator('.track')
  const speedVariable = () =>
    track.evaluate((element) => (element as HTMLElement).style.getPropertyValue('--speed'))
  expect(await speedVariable()).toBe('1')
  await page.getByLabel('4x').check()
  await expect.poll(speedVariable).toBe('4')
})

test('keeps the round modal open on Escape and works from the keyboard', async ({ page }) => {
  await page.goto(SEEDED_URL)
  await startGame(page)

  await expect(modal(page)).toBeVisible({ timeout: ROUND_TIMEOUT_4X })
  const nextRound = modal(page).getByRole('button', { name: 'Next round' })
  await expect(nextRound).toBeFocused()

  await page.keyboard.press('Escape')
  await page.keyboard.press('Escape')
  await expect(modal(page)).toBeVisible()

  await page.keyboard.press('Enter')
  await expect(modal(page)).toBeHidden()
  await expect(toggleButton(page)).toHaveText('Pause')
})

test('replays the same race for the same seed at any speed', async ({ page }) => {
  test.setTimeout(MULTI_ROUND_TEST_TIMEOUT)
  await page.goto(SEEDED_URL)
  await startGame(page, '4x')
  await expect(modal(page)).toBeVisible({ timeout: ROUND_TIMEOUT_4X })
  const fast = await modalRows(page)

  await page.goto(SEEDED_URL)
  await startGame(page, '1x')
  await expect(modal(page)).toBeVisible({ timeout: ROUND_TIMEOUT_1X })
  expect(await modalRows(page)).toEqual(fast)
  expect(fast).toHaveLength(GAME_CONFIG.horsesPerRound)
})

test.describe('seed in the URL', () => {
  test('writes a new seed to the URL and keeps other parameters', async ({ page }) => {
    await page.goto('/?lang=en')
    const url = new URL(page.url())
    expect(url.searchParams.get('seed')).toMatch(/^\d+$/)
    expect(url.searchParams.get('lang')).toBe('en')
  })

  test('rebuilds the same stable on reload', async ({ page }) => {
    const stable = () => horseListPanel(page).locator('tbody').innerText()
    await page.goto('/')
    const first = await stable()
    await page.reload()
    expect(await stable()).toBe(first)
  })
})

test('races a smaller stable with every horse in each round', async ({ page }) => {
  const SMALL_STABLE = 5
  await page.goto(SEEDED_URL)
  const count = horseCountInput(page)
  await count.fill(String(SMALL_STABLE))
  await count.press('Enter')

  await expect(horseListPanel(page).getByRole('heading')).toHaveText(
    `Horse List (1-${SMALL_STABLE})`,
  )
  await expect(horseListPanel(page).locator('tbody tr')).toHaveCount(SMALL_STABLE)

  await generateButton(page).click()
  await expect(programPanel(page).getByRole('table')).toHaveCount(ROUND_COUNT)
  for (const table of await programPanel(page).getByRole('table').all()) {
    await expect(table.locator('tbody tr')).toHaveCount(SMALL_STABLE)
  }
  await expect(runners(page)).toHaveCount(SMALL_STABLE)
})
