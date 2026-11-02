/**
 * Component helper that turns round results into table-ready data.
 */
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Horse, Round, RoundResult } from '@/domain/types'
import type { RoundTableEntry } from '@/components/types'
import { useHorseLookup } from './useHorseLookup'

/** A finished round with its placements resolved to horses, in finishing order. */
export interface ResultTable {
  round: Round
  entries: RoundTableEntry[]
}

/**
 * Pairs each result with its round and resolves horse ids, keeping the order
 * of `results`. Results whose round or horses are unknown are skipped, and
 * placements are sorted by position even if they arrive unsorted.
 */
export function useResultTables(
  rounds: MaybeRefOrGetter<readonly Round[]>,
  results: MaybeRefOrGetter<readonly RoundResult[]>,
  horses: MaybeRefOrGetter<readonly Horse[]>,
) {
  const horseById = useHorseLookup(horses)

  return computed<ResultTable[]>(() => {
    const roundByIndex = new Map(toValue(rounds).map((round) => [round.index, round]))
    return toValue(results).flatMap((result) => {
      const round = roundByIndex.get(result.roundIndex)
      if (!round) return []
      const entries = result.placements
        .toSorted((a, b) => a.position - b.position)
        .flatMap(({ position, horseId }) => {
          const horse = horseById.value.get(horseId)
          return horse ? [{ position, horse }] : []
        })
      return [{ round, entries }]
    })
  })
}
