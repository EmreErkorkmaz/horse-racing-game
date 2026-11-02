import { describe, expect, expectTypeOf, it } from 'vitest'
import { ref } from 'vue'
import type { Horse, Round } from '@/domain/types'
import type { RoundTableData, RoundTableEntry } from '@/shared/types'
import { horses, rounds } from '@/shared/__tests__/fixtures'
import { useProgramTables } from '../useProgramTables'

/** Lane number and horse id of each row, which is what the program table shows. */
const rows = (entries: RoundTableEntry[] | undefined) =>
  entries?.map((entry) => [entry.position, entry.horse.id])

describe('useProgramTables', () => {
  it('returns the shared round table shape', () => {
    expectTypeOf(useProgramTables(rounds, horses).value).toEqualTypeOf<RoundTableData[]>()
  })

  it('builds one table per round in program order', () => {
    const tables = useProgramTables(rounds, horses)
    expect(tables.value.map((table) => table.round)).toEqual(rounds)
  })

  it('lists the runners in lane order with 1-based lane numbers', () => {
    const tables = useProgramTables(rounds, horses)
    expect(rows(tables.value[0]?.entries)).toEqual([
      [1, 3],
      [2, 1],
      [3, 4],
    ])
  })

  it('gives every entry a null finishing time, since the rounds have not run yet', () => {
    const tables = useProgramTables(rounds, horses)
    const times = tables.value.flatMap((table) => table.entries.map((entry) => entry.finishTime))
    expect(times.every((time) => time === null)).toBe(true)
  })

  it('skips horses missing from the stable and keeps the numbers consecutive', () => {
    const tables = useProgramTables(
      rounds,
      horses.filter((horse) => horse.id !== 1),
    )
    expect(rows(tables.value[0]?.entries)).toEqual([
      [1, 3],
      [2, 4],
    ])
  })

  it('follows changes to the rounds and the horses', () => {
    const program = ref<Round[]>([])
    const stable = ref<Horse[]>(horses)
    const tables = useProgramTables(program, () => stable.value)
    expect(tables.value).toEqual([])

    program.value = rounds
    expect(tables.value).toHaveLength(rounds.length)

    stable.value = horses.filter((horse) => horse.id !== 4)
    expect(rows(tables.value[1]?.entries)).toEqual([
      [1, 2],
      [2, 1],
      [3, 3],
    ])
  })
})
