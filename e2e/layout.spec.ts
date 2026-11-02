import { expect, test, type Page } from '@playwright/test'

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

for (const width of [375, 768, 1280, 1440]) {
  test(`does not scroll the page sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/?seed=1')
    expect(await overflowOf(page, 'html')).toBe(0)
  })
}

/*
 * System fonts differ between platforms (Linux runners render system-ui wider
 * than macOS), so the check also runs with a deliberately wide font.
 */
const fonts = [
  { name: 'the system font', css: '/* no override */' },
  { name: 'a wide font', css: 'body { font-family: Verdana, "DejaVu Sans", sans-serif; }' },
]

for (const width of [1280, 1440]) {
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
