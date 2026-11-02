/**
 * Component helper that turns the race program into table-ready data.
 */
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Horse, Round } from '@/domain/types'
import type { RoundTableEntry } from './types'
import { useHorseLookup } from './useHorseLookup'

/** A scheduled round with its runners resolved to horses, in lane order. */
export interface ProgramTable {
  round: Round
  entries: RoundTableEntry[]
}

/**
 * Builds one table per round, in program order. Each entry's position is its
 * 1-based lane number; horses missing from the stable are skipped and the
 * remaining lanes stay numbered consecutively.
 */
export function useProgramTables(
  rounds: MaybeRefOrGetter<readonly Round[]>,
  horses: MaybeRefOrGetter<readonly Horse[]>,
) {
  const horseById = useHorseLookup(horses)

  return computed<ProgramTable[]>(() =>
    toValue(rounds).map((round) => {
      const entries: RoundTableEntry[] = []
      for (const id of round.horseIds) {
        const horse = horseById.value.get(id)
        if (horse) entries.push({ position: entries.length + 1, horse })
      }
      return { round, entries }
    }),
  )
}
