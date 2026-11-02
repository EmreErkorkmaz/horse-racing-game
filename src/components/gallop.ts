/**
 * Helpers for the gallop animation of the runners on the race track.
 */

/**
 * Fractional part of the golden ratio. Stepping by it spreads consecutive
 * values evenly around a cycle, so neighbouring horse numbers never share a
 * similar phase.
 */
const GOLDEN_RATIO_CONJUGATE = 0.618033988749895

/**
 * Where in the gallop cycle a horse starts, as a share of one stride (0 to 1).
 * Fixed per horse, so the field does not bob in unison and the same horse
 * always moves the same way.
 */
export function gallopPhase(horseId: number): number {
  return (horseId * GOLDEN_RATIO_CONJUGATE) % 1
}
