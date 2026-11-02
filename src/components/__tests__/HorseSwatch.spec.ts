import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HorseSwatch from '../HorseSwatch.vue'
import { horses } from './fixtures'

describe('HorseSwatch', () => {
  it('shows the horse number on a dot filled with the horse color', () => {
    const w = mount(HorseSwatch, { props: { horse: horses[1]! } })
    expect(w.text()).toBe('2')
    expect(w.get('.swatch').attributes('style')).toContain('background-color: #1e88e5')
  })

  it('is hidden from assistive technology because the row already names the horse', () => {
    const w = mount(HorseSwatch, { props: { horse: horses[0]! } })
    expect(w.get('.swatch').attributes('aria-hidden')).toBe('true')
  })
})
