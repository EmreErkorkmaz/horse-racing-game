/**
 * View-model types produced by the table helpers and rendered by the components.
 */
import type { Horse, Round } from '@/domain/types'

/** One row of a RoundTable: a horse and its lane number or finishing position. */
export interface RoundTableEntry {
  position: number
  horse: Horse
  /** Simulated finishing time in milliseconds; null in the program and for a horse still running. */
  finishTime: number | null
}

/**
 * A round with its rows resolved to horses. The order of `entries` is set by
 * the helper that builds it: lane order for the program, finishing order for
 * results.
 */
export interface RoundTableData {
  round: Round
  entries: RoundTableEntry[]
}
