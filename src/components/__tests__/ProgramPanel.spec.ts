import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgramPanel from '../ProgramPanel.vue'
import RoundTable from '../RoundTable.vue'
import { horses, rounds } from './fixtures'

describe('ProgramPanel', () => {
  it('has a Program heading', () => {
    const w = mount(ProgramPanel, { props: { rounds, horses, currentRoundIndex: null } })
    expect(w.get('h2').text()).toBe('Program')
  })

  it('renders one RoundTable per round with horses in lane order', () => {
    const w = mount(ProgramPanel, { props: { rounds, horses, currentRoundIndex: null } })
    const tables = w.findAllComponents(RoundTable)
    expect(tables).toHaveLength(2)
    expect(tables[0]!.props('round')).toEqual(rounds[0])
    expect(tables[0]!.props('entries')).toEqual([
      { position: 1, horse: horses[2], finishTime: null },
      { position: 2, horse: horses[0], finishTime: null },
      { position: 3, horse: horses[3], finishTime: null },
    ])
  })

  it('highlights only the current round', () => {
    const w = mount(ProgramPanel, { props: { rounds, horses, currentRoundIndex: 1 } })
    expect(w.findAllComponents(RoundTable).map((t) => t.props('current'))).toEqual([false, true])
  })

  it('skips horse ids that are not in the stable', () => {
    const broken = [{ index: 0, distance: 1200, horseIds: [1, 99] }]
    const w = mount(ProgramPanel, { props: { rounds: broken, horses, currentRoundIndex: null } })
    expect(w.getComponent(RoundTable).props('entries')).toEqual([
      { position: 1, horse: horses[0], finishTime: null },
    ])
  })

  it('shows an empty state before a program exists', () => {
    const w = mount(ProgramPanel, { props: { rounds: [], horses, currentRoundIndex: null } })
    expect(w.findComponent(RoundTable).exists()).toBe(false)
    expect(w.text()).toContain('Generate a program')
  })
})
