import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgramPanel from '../ProgramPanel.vue'
import RoundTable from '@/shared/RoundTable.vue'
import { horses, rounds } from '@/shared/__tests__/fixtures'

describe('ProgramPanel', () => {
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

  it('shows an empty state before a program exists', () => {
    const w = mount(ProgramPanel, { props: { rounds: [], horses, currentRoundIndex: null } })
    expect(w.findComponent(RoundTable).exists()).toBe(false)
    expect(w.text()).toContain('Generate a program')
  })
})
