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

/**
 * Race time as `m:ss.cc` (minutes, seconds, hundredths), e.g. `1:10.53`.
 * Rounds to the nearest hundredth, carrying over into seconds and minutes.
 *
 * @param ms Simulated race time in milliseconds.
 */
export function formatRaceTime(ms: number): string {
  const hundredths = Math.round(ms / 10)
  const minutes = Math.floor(hundredths / 6000)
  const seconds = Math.floor((hundredths % 6000) / 100)
  const fraction = hundredths % 100
  return `${minutes}:${String(seconds).padStart(2, '0')}.${String(fraction).padStart(2, '0')}`
}
