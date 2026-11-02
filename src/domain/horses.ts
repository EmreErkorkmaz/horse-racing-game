import { GAME_CONFIG } from '@/config/game'
import { HORSE_COLORS, HORSE_NAMES } from '@/config/stable'
import { randomInt, type Rng } from './rng'
import type { Horse } from './types'

/**
 * Generates a stable of horses.
 *
 * Horse `n` receives the `n`-th name and color of the stable data, which
 * guarantees uniqueness; only the condition score is random.
 *
 * @param count Number of horses, an integer between `minHorseCount` and `maxHorseCount`.
 * @param rng Random source for the condition scores.
 * @throws RangeError when `count` is not an integer within the configured bounds.
 */
export function generateHorses(count: number, rng: Rng): Horse[] {
  const { minHorseCount, maxHorseCount, conditionRange } = GAME_CONFIG
  if (!Number.isInteger(count) || count < minHorseCount || count > maxHorseCount) {
    throw new RangeError(
      `Horse count must be an integer between ${minHorseCount} and ${maxHorseCount}, got ${count}`,
    )
  }

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: HORSE_NAMES[i] as string,
    color: HORSE_COLORS[i] as Horse['color'],
    condition: randomInt(rng, conditionRange.min, conditionRange.max),
  }))
}
