import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import HorseList from '../HorseList.vue'
import { horses } from './fixtures'

describe('HorseList', () => {
  it('titles the panel with the horse range', () => {
    const w = mount(HorseList, { props: { horses } })
    expect(w.get('h2').text()).toBe('Horse List (1-4)')
  })

  it('labels the panel section with its title', () => {
    const w = mount(HorseList, { props: { horses } })
    const id = w.get('h2').attributes('id')
    expect(w.get('section').attributes('aria-labelledby')).toBe(id)
  })

  it('renders one row per horse with number, name, condition and color name', () => {
    const w = mount(HorseList, { props: { horses } })
    const rows = w.findAll('tbody tr')
    expect(rows).toHaveLength(4)
    const cells = rows[3]!.findAll('td')
    expect(cells.slice(0, 3).map((td) => td.text())).toEqual(['4', 'Linus Torvalds', '99'])
    expect(cells[3]!.find('.swatch').exists()).toBe(true)
    expect(cells[3]!.text()).toMatch(/Yellow$/)
  })

  it('has column headers', () => {
    const w = mount(HorseList, { props: { horses } })
    expect(w.findAll('thead th').map((th) => th.text())).toEqual([
      '#',
      'Name',
      'Condition',
      'Color',
    ])
  })

  it('shows an empty state without horses', () => {
    const w = mount(HorseList, { props: { horses: [] } })
    expect(w.get('h2').text()).toBe('Horse List')
    expect(w.find('table').exists()).toBe(false)
    expect(w.text()).toContain('No horses')
  })
})
