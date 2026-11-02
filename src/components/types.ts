/**
 * View-model types used only by the presentational components.
 */
import type { Horse } from '@/domain/types'

/** One row of a RoundTable: a horse and its lane number or finishing position. */
export interface RoundTableEntry {
  position: number
  horse: Horse
}
