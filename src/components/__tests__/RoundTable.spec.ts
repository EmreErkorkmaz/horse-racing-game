import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RoundTable from '../RoundTable.vue'
import { horses, rounds } from './fixtures'

const entries = [
  { position: 1, horse: horses[2]! },
  { position: 2, horse: horses[0]! },
]

const timedEntries = [
  { position: 1, horse: horses[2]!, finishTime: 70530 },
  { position: 2, horse: horses[0]!, finishTime: null },
]

describe('RoundTable', () => {
  it('captions the table with the round label', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries } })
    expect(w.get('caption').text()).toBe('Round 1 - 1200m')
  })

  it('renders Position / Name rows in the given order', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries } })
    expect(w.findAll('thead th').map((th) => th.text())).toEqual(['Position', 'Name'])
    const rows = w.findAll('tbody tr').map((tr) => tr.findAll('td').map((td) => td.text()))
    expect(rows).toEqual([
      ['1', '3Alan Turing'],
      ['2', '1Ada Lovelace'],
    ])
  })

  it('shows the color swatch with the horse number next to the name', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries } })
    const swatch = w.get('tbody tr .swatch')
    expect(swatch.text()).toBe('3')
  })

  it('is not marked as current by default', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries } })
    expect(w.get('table').attributes('aria-current')).toBeUndefined()
    expect(w.get('table').classes()).not.toContain('is-current')
  })

  it('adds a Time column with each finishing time when asked to', () => {
    const w = mount(RoundTable, {
      props: { round: rounds[0]!, entries: timedEntries, showTime: true },
    })
    expect(w.findAll('thead th').map((th) => th.text())).toEqual(['Position', 'Name', 'Time'])
    const times = w.findAll('tbody tr').map((tr) => tr.findAll('td')[2]?.text())
    expect(times).toEqual(['1:10.53', ''])
  })

  it('leaves the time cell empty for an entry without a time', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries, showTime: true } })
    expect(w.findAll('tbody tr').map((tr) => tr.findAll('td')[2]?.text())).toEqual(['', ''])
  })

  it('shows no Time column by default, even when entries carry times', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries: timedEntries } })
    expect(w.findAll('thead th').map((th) => th.text())).toEqual(['Position', 'Name'])
    expect(w.findAll('tbody tr')[0]!.findAll('td')).toHaveLength(2)
  })

  it('marks the current round', () => {
    const w = mount(RoundTable, { props: { round: rounds[0]!, entries, current: true } })
    expect(w.get('table').attributes('aria-current')).toBe('step')
    expect(w.get('table').classes()).toContain('is-current')
  })
})
