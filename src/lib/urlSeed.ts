/**
 * Reading and writing the game seed in the page URL (`?seed=42`).
 *
 * The seed drives every random draw of a game, so a URL that carries it
 * replays the same game on reload or on another device.
 */

/** Name of the query parameter that holds the seed. */
export const SEED_PARAM = 'seed'

/** Largest seed the generator uses; it reads 32 bits. */
const MAX_SEED = 0xffffffff

/**
 * Parses a seed from a query parameter value.
 *
 * @returns The seed, or null unless the value is a whole number between 0 and 2^32 - 1.
 */
export function parseSeed(value: string | null): number | null {
  if (value === null || !/^\d+$/.test(value)) return null
  const seed = Number(value)
  return seed <= MAX_SEED ? seed : null
}

/**
 * Takes the seed from `url`, or draws a new one when it is missing or invalid.
 *
 * @param url Current page URL; it is not modified.
 * @param randomSeed Source of a new seed.
 * @returns The seed and a copy of `url` that carries it, ready for `history.replaceState`.
 */
export function resolveUrlSeed(url: URL, randomSeed: () => number): { seed: number; url: URL } {
  const result = new URL(url)
  const seed = parseSeed(result.searchParams.get(SEED_PARAM)) ?? randomSeed()
  result.searchParams.set(SEED_PARAM, String(seed))
  return { seed, url: result }
}
