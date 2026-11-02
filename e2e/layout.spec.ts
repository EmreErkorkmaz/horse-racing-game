import { expect, test, type Page } from '@playwright/test'
import { expectRoundModal, modal, resultsPanel, startGame } from './support/game'

/** Overrides the system font with a wide one, standing in for platforms whose system-ui renders wider. */
const WIDE_FONT_CSS = 'body { font-family: Verdana, "DejaVu Sans", sans-serif; }'

/** Horizontal overflow in pixels of the element matched by `selector`. */
function overflowOf(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((element) => element.scrollWidth - element.clientWidth)
}

for (const width of [1280, 1440, 1920]) {
  test(`shows every Horse List column without scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?seed=1')
    const panel = page.getByRole('region', { name: /Horse List/ })
    const panelBox = await panel.boundingBox()
    const tableBox = await panel.getByRole('table').boundingBox()
    expect(tableBox!.x + tableBox!.width).toBeLessThanOrEqual(panelBox!.x + panelBox!.width)
  })
}

for (const width of [375, 768, 1023, 1024, 1280, 1440]) {
  test(`does not scroll the page sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/?seed=1')
    expect(await overflowOf(page, 'html')).toBe(0)
  })
}

/*
 * From 1024px the panel columns grow to their tables' widest content. The
 * widest case is a timed result table rendered in a wide font, at the
 * narrowest width of each such layout.
 */
for (const width of [1023, 1024, 1440]) {
  test(`does not scroll the page sideways with timed results in a wide font at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/?seed=1')
    await page.addStyleTag({ content: WIDE_FONT_CSS })
    await startGame(page)
    await expectRoundModal(page, 1)
    await modal(page).getByRole('button', { name: 'Finish' }).click()
    await expect(resultsPanel(page).locator('tbody tr')).toHaveCount(10)
    expect(await overflowOf(page, 'html')).toBe(0)
  })
}

/*
 * System fonts differ between platforms (Linux runners render system-ui wider
 * than macOS), so the check also runs with a deliberately wide font.
 */
/** Both edges of the two-column tablet layout, the three-column laptop layout and four columns. */
const ONE_LINE_WIDTHS = [768, 1023, 1024, 1280, 1440]

const fonts = [
  { name: 'the system font', css: '/* no override */' },
  { name: 'a wide font', css: WIDE_FONT_CSS },
]

for (const width of ONE_LINE_WIDTHS) {
  for (const font of fonts) {
    test(`fits every horse name of the program on one line at ${width}px with ${font.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/?seed=1')
      await page.addStyleTag({ content: font.css })
      await page.getByRole('button', { name: 'Generate Program' }).click()
      const rows = page.getByRole('region', { name: 'Program' }).locator('tbody tr')
      const heights = await rows.evaluateAll((elements) =>
        elements.map((row) => Math.round(row.getBoundingClientRect().height)),
      )
      // A wrapped name makes its row taller than the others.
      expect(new Set(heights).size).toBe(1)
    })
  }
}

for (const width of ONE_LINE_WIDTHS) {
  for (const font of fonts) {
    test(`fits every result row, with its time, on one line at ${width}px with ${font.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/?seed=1')
      await page.addStyleTag({ content: font.css })
      await startGame(page)
      await expectRoundModal(page, 1)
      await modal(page).getByRole('button', { name: 'Finish' }).click()
      const rows = resultsPanel(page).locator('tbody tr')
      await expect(rows).toHaveCount(10)
      const heights = await rows.evaluateAll((elements) =>
        elements.map((row) => Math.round(row.getBoundingClientRect().height)),
      )
      expect(new Set(heights).size).toBe(1)
    })
  }
}
