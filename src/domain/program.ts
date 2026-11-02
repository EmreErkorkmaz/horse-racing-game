import { GAME_CONFIG } from '@/config/game'
import { sample, type Rng } from './rng'
import type { Horse, Round } from './types'

/**
 * Generates the race program: one round per configured distance.
 *
 * Each round draws its own field of `horsesPerRound` distinct horses from the
 * stable, in random lane order. A stable smaller than a full field enters
 * every horse in every round.
 *
 * @param horses The whole stable.
 * @param rng Random source for the field draws.
 */
export function generateProgram(horses: readonly Horse[], rng: Rng): Round[] {
  const ids = horses.map((horse) => horse.id)
  return GAME_CONFIG.roundDistances.map((distance, index) => ({
    index,
    distance,
    horseIds: sample(rng, ids, GAME_CONFIG.horsesPerRound),
  }))
}
