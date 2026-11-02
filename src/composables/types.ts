/**
 * View-model types produced by the table helpers and rendered by the components.
 */
import type { Horse } from '@/domain/types'

/** One row of a RoundTable: a horse and its lane number or finishing position. */
export interface RoundTableEntry {
  position: number
  horse: Horse
  /** Simulated finishing time in milliseconds; null in the program and for a horse still running. */
  finishTime: number | null
}
