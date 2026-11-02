import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GameLayout from '../GameLayout.vue'

const slots = {
  header: '<div id="h">header</div>',
  stable: '<div id="l">stable</div>',
  track: '<div id="t">track</div>',
  program: '<div id="p">program</div>',
  results: '<div id="r">results</div>',
}

describe('GameLayout', () => {
  it('places every slot into its own grid area', () => {
    const w = mount(GameLayout, { slots })
    expect(w.find('.area-header #h').exists()).toBe(true)
    expect(w.find('.area-stable #l').exists()).toBe(true)
    expect(w.find('.area-track #t').exists()).toBe(true)
    expect(w.find('.area-program #p').exists()).toBe(true)
    expect(w.find('.area-results #r').exists()).toBe(true)
  })

  it('renders the header outside and the panels inside the main landmark', () => {
    const w = mount(GameLayout, { slots })
    expect(w.get('main').find('#h').exists()).toBe(false)
    expect(w.get('main').find('#t').exists()).toBe(true)
  })

  it('keeps the track before the side panels in DOM order for keyboard and screen readers', () => {
    const w = mount(GameLayout, { slots })
    const order = w.findAll('main > *').map((el) => el.classes().find((c) => c.startsWith('area-')))
    expect(order).toEqual(['area-track', 'area-stable', 'area-rounds'])
  })

  it('puts the program and the results into one shared scroll area, program first', () => {
    const w = mount(GameLayout, { slots })
    const rounds = w.get('[data-test="rounds-scroll"]')
    expect(rounds.classes()).toContain('area-rounds')
    const order = rounds
      .findAll(':scope > *')
      .map((el) => el.classes().find((c) => c.startsWith('area-')))
    expect(order).toEqual(['area-program', 'area-results'])
  })
})
