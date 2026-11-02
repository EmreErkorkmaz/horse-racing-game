import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'
import { defaultPanel, usePanelTab } from '../usePanelTab'

describe('defaultPanel', () => {
  it('shows the stable before a program exists', () => {
    expect(defaultPanel(0, 0)).toBe('stable')
  })

  it('shows the program once one is drawn', () => {
    expect(defaultPanel(6, 0)).toBe('program')
  })

  it('shows the results once a round has finished', () => {
    expect(defaultPanel(6, 1)).toBe('results')
  })
})

describe('usePanelTab', () => {
  it('follows the game: program on Generate, results on the first finished round', async () => {
    const programs = ref(0)
    const results = ref(0)
    const panel = usePanelTab(programs, () => results.value)
    expect(panel.value).toBe('stable')

    programs.value = 6
    await nextTick()
    expect(panel.value).toBe('program')

    results.value = 1
    await nextTick()
    expect(panel.value).toBe('results')
  })

  it('keeps a tab the player picked until the game moves on', async () => {
    const programs = ref(6)
    const results = ref(1)
    const panel = usePanelTab(programs, results)

    panel.value = 'stable'
    await nextTick()
    expect(panel.value).toBe('stable')

    results.value = 2
    await nextTick()
    expect(panel.value).toBe('results')
  })

  it('returns to the stable when the program is dropped', async () => {
    const programs = ref(6)
    const results = ref(0)
    const panel = usePanelTab(programs, results)
    programs.value = 0
    await nextTick()
    expect(panel.value).toBe('stable')
  })
})
