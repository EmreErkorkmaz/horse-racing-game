import { describe, expect, expectTypeOf, it } from 'vitest'
import { ref } from 'vue'
import type { RoundResult } from '@/domain/types'
import type { RoundTableData } from '@/composables/types'
import { horses, results, rounds } from '@/components/__tests__/fixtures'
import { useResultTables } from '../useResultTables'

/** Finishing position, horse id and time of each row. */
const rows = (table: RoundTableData | undefined) =>
  table?.entries.map((entry) => [entry.position, entry.horse.id, entry.finishTime])

describe('useResultTables', () => {
  it('returns the shared round table shape', () => {
    expectTypeOf(useResultTables(rounds, results, horses).value).toEqualTypeOf<RoundTableData[]>()
  })

  it('pairs each result with its round, in finishing order with times', () => {
    const tables = useResultTables(rounds, results, horses)
    expect(tables.value.map((table) => table.round)).toEqual([rounds[0]])
    expect(rows(tables.value[0])).toEqual([
      [1, 4, 71250],
      [2, 3, 72480],
      [3, 1, 74010],
    ])
  })

  it('sorts placements by position even if they arrive unsorted', () => {
    const unsorted: RoundResult[] = [
      {
        roundIndex: 0,
        placements: [
          { position: 2, horseId: 1, finishTime: 75000 },
          { position: 1, horseId: 3, finishTime: 74000 },
        ],
      },
    ]
    expect(rows(useResultTables(rounds, unsorted, horses).value[0])).toEqual([
      [1, 3, 74000],
      [2, 1, 75000],
    ])
  })

  it('skips results of unknown rounds and placements of unknown horses', () => {
    const stray: RoundResult[] = [
      { roundIndex: 9, placements: [{ position: 1, horseId: 1, finishTime: 70000 }] },
      {
        roundIndex: 0,
        placements: [
          { position: 1, horseId: 99, finishTime: 70000 },
          { position: 2, horseId: 1, finishTime: 71000 },
        ],
      },
    ]
    const tables = useResultTables(rounds, stray, horses)
    expect(tables.value).toHaveLength(1)
    expect(rows(tables.value[0])).toEqual([[2, 1, 71000]])
  })

  it('follows new results as rounds finish', () => {
    const finished = ref<RoundResult[]>([])
    const tables = useResultTables(rounds, finished, horses)
    expect(tables.value).toEqual([])
    finished.value = results
    expect(tables.value).toHaveLength(1)
  })
})
