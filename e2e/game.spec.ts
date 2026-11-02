import { expect, test, type Page } from '@playwright/test'

const ROUND_COUNT = 6

const generateButton = (page: Page) => page.getByRole('button', { name: 'Generate Program' })
const toggleButton = (page: Page) => page.locator('[data-test="toggle"]')
const modal = (page: Page) => page.getByRole('dialog')
const resultsPanel = (page: Page) => page.getByRole('region', { name: 'Results' })

/** Generates a program at the given playback speed and starts the first round. */
async function startGame(page: Page, speed: '1x' | '2x' | '4x' = '4x') {
  await page.getByLabel(speed).check()
  await generateButton(page).click()
  await toggleButton(page).click()
}

/** Horse names of the round shown in the modal, in finishing order. */
async function modalPlacements(page: Page): Promise<string[]> {
  const rows = modal(page).locator('[data-test="latest-round"] tbody tr')
  return (await rows.allTextContents()).map((text) => text.replace(/^\s*\d+\s*\d+/, '').trim())
}

/** Waits for the result modal of the given 1-based round, with one collapsed section per earlier round. */
async function expectRoundModal(page: Page, round: number) {
  await expect(modal(page)).toBeVisible({ timeout: 15_000 })
  await expect(modal(page).getByRole('heading', { level: 2 })).toHaveText(
    new RegExp(`^Round ${round} - \\d+m finished$`),
  )
  await expect(modal(page).locator('details')).toHaveCount(round - 1)
}

/** Resolves after the browser has rendered the given number of animation frames. */
function waitForFrames(page: Page, count: number): Promise<void> {
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
function runnerPositions(page: Page): Promise<string[]> {
  return page
    .locator('.runner')
    .evaluateAll((runners) => runners.map((runner) => (runner as HTMLElement).style.transform))
}

test('runs the whole program round by round and lists every result', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/?seed=7')
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
  await expect(page.locator('.track-label')).toHaveText(
    'Program finished. Generate a new program to race again.',
  )
  await expect(toggleButton(page)).toBeDisabled()
  await expect(generateButton(page)).toBeEnabled()
})

test('pauses and resumes the race', async ({ page }) => {
  await page.goto('/?seed=7')
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

test('keeps the round modal open on Escape and works from the keyboard', async ({ page }) => {
  await page.goto('/?seed=7')
  await startGame(page)

  await expect(modal(page)).toBeVisible({ timeout: 15_000 })
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
  test.setTimeout(60_000)
  await page.goto('/?seed=7')
  await startGame(page, '4x')
  await expect(modal(page)).toBeVisible({ timeout: 15_000 })
  const fast = await modalPlacements(page)

  await page.goto('/?seed=7')
  await startGame(page, '1x')
  await expect(modal(page)).toBeVisible({ timeout: 30_000 })
  expect(await modalPlacements(page)).toEqual(fast)
  expect(fast).toHaveLength(10)
})

test.describe('seed in the URL', () => {
  test('writes a new seed to the URL and keeps other parameters', async ({ page }) => {
    await page.goto('/?lang=en')
    const url = new URL(page.url())
    expect(url.searchParams.get('seed')).toMatch(/^\d+$/)
    expect(url.searchParams.get('lang')).toBe('en')
  })

  test('replaces an invalid seed', async ({ page }) => {
    await page.goto('/?seed=not-a-number')
    expect(new URL(page.url()).searchParams.get('seed')).toMatch(/^\d+$/)
  })

  test('rebuilds the same stable on reload', async ({ page }) => {
    const stable = () =>
      page
        .getByRole('region', { name: /Horse List/ })
        .locator('tbody')
        .innerText()
    await page.goto('/')
    const first = await stable()
    await page.reload()
    expect(await stable()).toBe(first)
  })
})

test('races a smaller stable with every horse in each round', async ({ page }) => {
  await page.goto('/?seed=7')
  const count = page.getByLabel('Horses')
  await count.fill('5')
  await count.press('Enter')

  const horseList = page.getByRole('region', { name: /Horse List/ })
  await expect(horseList.getByRole('heading')).toHaveText('Horse List (1-5)')
  await expect(horseList.locator('tbody tr')).toHaveCount(5)

  await generateButton(page).click()
  const program = page.getByRole('region', { name: 'Program' })
  await expect(program.getByRole('table')).toHaveCount(ROUND_COUNT)
  for (const table of await program.getByRole('table').all()) {
    await expect(table.locator('tbody tr')).toHaveCount(5)
  }
  await expect(page.locator('.runner')).toHaveCount(5)
})
