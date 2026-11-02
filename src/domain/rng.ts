/**
 * Seeded pseudo-random number generation.
 *
 * Every random decision of the game goes through an `Rng` instance. Seeding
 * makes a whole game reproducible: the same seed always yields the same
 * horses, program and race outcomes, which keeps tests deterministic and
 * allows a race to be replayed from a shared `?seed=` URL.
 */

/** Source of uniformly distributed random floats. */
export interface Rng {
  /** Returns the next float in the `[0, 1)` interval. */
  next(): number
}

/**
 * Creates a Mulberry32 generator: a small, fast 32-bit generator with good
 * statistical quality for games and simulations (not for cryptography).
 *
 * @param seed Any integer; only the lowest 32 bits are used.
 */
export function createRng(seed: number): Rng {
  let state = seed >>> 0
  return {
    next() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    },
  }
}

/**
 * Returns a random integer between `min` and `max`, both inclusive.
 */
export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng.next() * (max - min + 1))
}

/**
 * Picks `count` distinct items in random order with a partial Fisher-Yates
 * shuffle. When `count` is at least the source length, every item is
 * returned in shuffled order. The source array is left untouched.
 */
export function sample<T>(rng: Rng, items: readonly T[], count: number): T[] {
  const pool = [...items]
  const size = Math.min(count, pool.length)
  for (let i = 0; i < size; i++) {
    const j = randomInt(rng, i, pool.length - 1)
    ;[pool[i], pool[j]] = [pool[j] as T, pool[i] as T]
  }
  return pool.slice(0, size)
}
