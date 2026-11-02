import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HorseSwatch from '../HorseSwatch.vue'
import { horses } from './fixtures'

describe('HorseSwatch', () => {
  it('shows the horse number on a dot filled with the horse color', () => {
    const w = mount(HorseSwatch, { props: { horse: horses[1]! } })
    expect(w.text()).toBe('2')
    // jsdom normalizes hex colors to rgb().
    expect(w.get<HTMLElement>('.swatch').element.style.backgroundColor).toBe('rgb(30, 136, 229)')
  })

  it('is hidden from assistive technology because the row already names the horse', () => {
    const w = mount(HorseSwatch, { props: { horse: horses[0]! } })
    expect(w.get('.swatch').attributes('aria-hidden')).toBe('true')
  })
})
