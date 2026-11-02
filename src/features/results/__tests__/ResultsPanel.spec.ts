import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResultsPanel from '../ResultsPanel.vue'
import RoundTable from '@/shared/RoundTable.vue'
import { horses, results, rounds } from '@/shared/__tests__/fixtures'

describe('ResultsPanel', () => {
  it('renders a RoundTable only for finished rounds, ordered by position', () => {
    const w = mount(ResultsPanel, { props: { rounds, results, horses } })
    const tables = w.findAllComponents(RoundTable)
    expect(tables).toHaveLength(1)
    expect(tables[0]!.props('round')).toEqual(rounds[0])
    expect(tables[0]!.props('entries')).toEqual([
      { position: 1, horse: horses[3], finishTime: 71250 },
      { position: 2, horse: horses[2], finishTime: 72480 },
      { position: 3, horse: horses[0], finishTime: 74010 },
    ])
  })

  it('keeps its tables to Position and Name, without times', () => {
    const w = mount(ResultsPanel, { props: { rounds, results, horses } })
    expect(w.getComponent(RoundTable).props('showTime')).toBe(false)
  })

  it('leaves result announcements to the round result modal', () => {
    const w = mount(ResultsPanel, { props: { rounds, results, horses } })
    expect(w.find('[aria-live]').exists()).toBe(false)
  })

  it('shows a hint before any result', () => {
    const w = mount(ResultsPanel, { props: { rounds, results: [], horses } })
    expect(w.text()).toContain('Results appear here')
  })

  it('adds a table when a new result arrives', async () => {
    const w = mount(ResultsPanel, { props: { rounds, results, horses } })
    await w.setProps({
      results: [
        ...results,
        { roundIndex: 1, placements: [{ position: 1, horseId: 2, finishTime: 82340 }] },
      ],
    })
    expect(w.findAllComponents(RoundTable)).toHaveLength(2)
  })
})
