import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HorseIcon from '../HorseIcon.vue'
import HorseIconSymbol, { HORSE_SYMBOL_ID } from '../HorseIconSymbol.vue'

describe('HorseIconSymbol', () => {
  it('defines the horse shape once as an svg symbol', () => {
    const w = mount(HorseIconSymbol)
    expect(w.findAll('symbol')).toHaveLength(1)
    expect(w.get('symbol').attributes('id')).toBe(HORSE_SYMBOL_ID)
    expect(w.get('svg').attributes('aria-hidden')).toBe('true')
  })
})

describe('HorseIcon', () => {
  it('references the shared symbol instead of repeating the shape', () => {
    const w = mount(HorseIcon, { props: { color: '#e53935' } })
    expect(w.get('use').attributes('href')).toBe(`#${HORSE_SYMBOL_ID}`)
    expect(w.find('path').exists()).toBe(false)
  })

  it('fills the shape with the given color', () => {
    const w = mount(HorseIcon, { props: { color: '#e53935' } })
    expect(w.get<SVGElement>('svg').element.style.color).toBe('rgb(229, 57, 53)')
  })

  it('is decorative', () => {
    const w = mount(HorseIcon, { props: { color: '#e53935' } })
    expect(w.get('svg').attributes('aria-hidden')).toBe('true')
    expect(w.get('svg').attributes('focusable')).toBe('false')
  })
})
