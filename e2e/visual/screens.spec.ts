import { expect, test, type Page } from '@playwright/test'
import {
  expectRoundModal,
  generateButton,
  MULTI_ROUND_TEST_TIMEOUT,
  playToFinish,
  SEEDED_URL,
  startGame,
} from '../support/game'

/*
 * Visual baselines of the main screens, one per state and viewport.
 *
 * Every state is reached from a fixed seed, so the stable, the program and the
 * finishing order are identical on every run. Mid-race screens are left out on
 * purpose: runner positions depend on how many animation frames the browser
 * happens to render, so such a screenshot would differ from run to run.
 *
 * Baselines are rendered on Linux in the Playwright Docker image; run them with
 * `npm run test:visual` (and `-- --update-snapshots` after an intended change).
 */

interface ScreenState {
  /** Name used in the screenshot file. */
  name: string
  /** Brings a freshly loaded seeded page into the state. */
  reach: (page: Page) => Promise<void>
  /** Captures the whole page; the modal state captures the viewport the dialog covers. */
  fullPage: boolean
}

const states: ScreenState[] = [
  { name: 'initial', reach: async () => {}, fullPage: true },
  {
    name: 'program',
    reach: async (page) => {
      await generateButton(page).click()
    },
    fullPage: true,
  },
  {
    name: 'round-1-modal',
    reach: async (page) => {
      await startGame(page)
      await expectRoundModal(page, 1)
    },
    fullPage: false,
  },
  {
    name: 'finished',
    reach: async (page) => {
      await startGame(page)
      await playToFinish(page)
    },
    fullPage: true,
  },
]

/** Phone, the stacked desktop layout (below 1440px) and the four-column layout. */
const viewports = [
  { width: 375, height: 812 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
]

for (const viewport of viewports) {
  for (const state of states) {
    test(`${state.name} at ${viewport.width}px`, async ({ page }) => {
      test.setTimeout(MULTI_ROUND_TEST_TIMEOUT)
      await page.setViewportSize(viewport)
      await page.goto(SEEDED_URL)
      await state.reach(page)
      await expect(page).toHaveScreenshot(`${state.name}-${viewport.width}.png`, {
        fullPage: state.fullPage,
        animations: 'disabled',
      })
    })
  }
}
