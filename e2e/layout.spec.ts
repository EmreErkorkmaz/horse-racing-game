import { expect, test, type Page } from '@playwright/test'

/** Horizontal overflow in pixels of the element matched by `selector`. */
function overflowOf(page: Page, selector: string): Promise<number> {
  return page.locator(selector).evaluate((element) => element.scrollWidth - element.clientWidth)
}

for (const width of [1280, 1440, 1920]) {
  test(`shows every Horse List column without scrolling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/?seed=1')
    expect(await overflowOf(page, '.area-horses .panel-body')).toBe(0)
  })
}

for (const width of [375, 768, 1280, 1440]) {
  test(`does not scroll the page sideways at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/?seed=1')
    expect(await overflowOf(page, 'html')).toBe(0)
  })
}
