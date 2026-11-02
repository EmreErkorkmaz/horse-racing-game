/**
 * Formatting helpers shared by the presentational components.
 */
import type { Round } from '@/domain/types'

/**
 * Human-readable round title, e.g. `Round 1 - 1200m`.
 * The round number is 1-based while `Round.index` is zero-based.
 */
export function roundLabel(round: Round): string {
  return `Round ${round.index + 1} - ${round.distance}m`
}

/**
 * Share of the distance covered, clamped to `0..1`.
 * A non-positive distance yields `0` so that callers never divide by zero.
 */
export function toFraction(covered: number, distance: number): number {
  if (distance <= 0) return 0
  return Math.min(1, Math.max(0, covered / distance))
}
