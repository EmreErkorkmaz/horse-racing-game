import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GameLayout from '../GameLayout.vue'

type PanelKey = 'stable' | 'program' | 'results'

const slots = {
  header: '<div id="h">header</div>',
  stable: '<div id="l">stable</div>',
  track: '<div id="t">track</div>',
  program: '<div id="p">program</div>',
  results: '<div id="r">results</div>',
}

function mountLayout(activePanel: PanelKey = 'stable') {
  return mount(GameLayout, { slots, props: { activePanel }, attachTo: document.body })
}

describe('GameLayout', () => {
  it('places every slot into its own grid area', () => {
    const w = mountLayout()
    expect(w.find('.area-header #h').exists()).toBe(true)
    expect(w.find('.area-stable #l').exists()).toBe(true)
    expect(w.find('.area-track #t').exists()).toBe(true)
    expect(w.find('.area-program #p').exists()).toBe(true)
    expect(w.find('.area-results #r').exists()).toBe(true)
  })

  it('renders the header outside and the panels inside the main landmark', () => {
    const w = mountLayout()
    expect(w.get('main').find('#h').exists()).toBe(false)
    expect(w.get('main').find('#t').exists()).toBe(true)
  })

  it('keeps the track before the side panels in DOM order for keyboard and screen readers', () => {
    const w = mountLayout()
    const order = w
      .findAll('main > *')
      .map((el) =>
        el.attributes('role') === 'tablist'
          ? 'tablist'
          : el.classes().find((c) => c.startsWith('area-')),
      )
    expect(order).toEqual(['area-track', 'tablist', 'area-stable', 'area-rounds'])
  })

  it('puts the program and the results into one shared scroll area, program first', () => {
    const w = mountLayout()
    const rounds = w.get('[data-test="rounds-scroll"]')
    expect(rounds.classes()).toContain('area-rounds')
    const order = rounds
      .findAll(':scope > *')
      .map((el) => el.classes().find((c) => c.startsWith('area-')))
    expect(order).toEqual(['area-program', 'area-results'])
  })

  describe('panel tabs', () => {
    const tabs = (w: ReturnType<typeof mountLayout>) => w.findAll('[role="tab"]')
    const panelOf = (key: PanelKey) => `.area-${key}`

    it('offers one named tab list with Horses, Program and Results', () => {
      const w = mountLayout()
      const list = w.get('[role="tablist"]')
      expect(list.attributes('aria-label')).toBe('Panels')
      expect(tabs(w).map((tab) => tab.text())).toEqual(['Horses', 'Program', 'Results'])
    })

    it.each(['stable', 'program', 'results'] as const)(
      'selects only the %s tab and marks only its panel active',
      (active) => {
        const w = mountLayout(active)
        const keys: PanelKey[] = ['stable', 'program', 'results']
        expect(tabs(w).map((tab) => tab.attributes('aria-selected'))).toEqual(
          keys.map((key) => String(key === active)),
        )
        // Roving tab stop: only the selected tab is reached with Tab.
        expect(tabs(w).map((tab) => tab.attributes('tabindex'))).toEqual(
          keys.map((key) => (key === active ? '0' : '-1')),
        )
        expect(keys.map((key) => w.get(panelOf(key)).attributes('data-active'))).toEqual(
          keys.map((key) => String(key === active)),
        )
      },
    )

    it('links every tab and its panel both ways', () => {
      const w = mountLayout()
      const keys: PanelKey[] = ['stable', 'program', 'results']
      expect(tabs(w)).toHaveLength(keys.length)
      tabs(w).forEach((tab, i) => {
        const panel = w.get(panelOf(keys[i]!))
        expect(panel.attributes('role')).toBe('tabpanel')
        expect(tab.attributes('aria-controls')).toBe(panel.attributes('id'))
        expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
      })
    })

    it('asks for the clicked panel', async () => {
      const w = mountLayout()
      await tabs(w)[2]!.trigger('click')
      expect(w.emitted('update:activePanel')).toEqual([['results']])
    })

    it('moves between tabs with the arrow keys, wrapping at both ends', async () => {
      const w = mountLayout('stable')
      await tabs(w)[0]!.trigger('keydown', { key: 'ArrowLeft' })
      await w.setProps({ activePanel: 'results' })
      await tabs(w)[2]!.trigger('keydown', { key: 'ArrowRight' })
      await w.setProps({ activePanel: 'stable' })
      await tabs(w)[0]!.trigger('keydown', { key: 'ArrowRight' })
      expect(w.emitted('update:activePanel')).toEqual([['results'], ['stable'], ['program']])
    })
  })
})
