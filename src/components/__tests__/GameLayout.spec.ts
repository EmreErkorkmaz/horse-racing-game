import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import GameLayout from '../GameLayout.vue'

const slots = {
  header: '<div id="h">header</div>',
  horses: '<div id="l">horses</div>',
  track: '<div id="t">track</div>',
  program: '<div id="p">program</div>',
  results: '<div id="r">results</div>',
}

describe('GameLayout', () => {
  it('places every slot into its own grid area', () => {
    const w = mount(GameLayout, { slots })
    expect(w.get('.area-header #h').exists()).toBe(true)
    expect(w.get('.area-horses #l').exists()).toBe(true)
    expect(w.get('.area-track #t').exists()).toBe(true)
    expect(w.get('.area-program #p').exists()).toBe(true)
    expect(w.get('.area-results #r').exists()).toBe(true)
  })

  it('renders the header outside and the panels inside the main landmark', () => {
    const w = mount(GameLayout, { slots })
    expect(w.get('main').find('#h').exists()).toBe(false)
    expect(w.get('main').find('#t').exists()).toBe(true)
  })

  it('keeps the track before the side panels in DOM order for keyboard and screen readers', () => {
    const w = mount(GameLayout, { slots })
    const order = w.findAll('main > *').map((el) => el.classes().find((c) => c.startsWith('area-')))
    expect(order).toEqual(['area-track', 'area-horses', 'area-program', 'area-results'])
  })
})
