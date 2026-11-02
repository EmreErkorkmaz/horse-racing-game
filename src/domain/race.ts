import { GAME_CONFIG } from '@/config/game'
import type { Rng } from './rng'
import type { Horse, LaneProgress, Placement, Round } from './types'

/**
 * Snapshot of a round in progress.
 *
 * States are immutable: `stepRace` returns a new state and leaves the previous
 * one untouched, so any snapshot can be stored, compared or rendered safely.
 */
export interface RaceState {
  /** Race length in meters. */
  distance: number
  /** Simulated time since the start, in milliseconds. */
  elapsed: number
  /** One entry per runner, in lane order. */
  lanes: LaneProgress[]
  /** Pace of each runner for this round in m/s, keyed by horse id. */
  paces: ReadonlyMap<number, number>
}

/** Returns a value in the `[-range, range]` interval. */
function spread(rng: Rng, range: number): number {
  return (rng.next() * 2 - 1) * range
}

/**
 * Average speed of a horse in m/s before any random variation: the base speed
 * plus a share of the condition bonus that grows linearly with condition.
 */
export function basePace(condition: number): number {
  const { min, max } = GAME_CONFIG.conditionRange
  const { baseSpeed, conditionBonus } = GAME_CONFIG.race
  return baseSpeed + (conditionBonus * (condition - min)) / (max - min)
}

/**
 * Puts the horses of a round at the start line and draws each runner's form
 * of the day, which stays fixed for the whole round.
 *
 * @throws Error when the round enters a horse that is not in `horses`.
 */
export function createRace(round: Round, horses: readonly Horse[], rng: Rng): RaceState {
  const byId = new Map(horses.map((horse) => [horse.id, horse]))
  const paces = new Map<number, number>()
  for (const id of round.horseIds) {
    const horse = byId.get(id)
    if (!horse) throw new Error(`Horse ${id} is entered in round ${round.index} but missing`)
    paces.set(id, basePace(horse.condition) + spread(rng, GAME_CONFIG.race.formRange))
  }

  return {
    distance: round.distance,
    elapsed: 0,
    lanes: round.horseIds.map((horseId) => ({ horseId, covered: 0, finishTime: null })),
    paces,
  }
}

/**
 * Advances the race by one fixed step of `GAME_CONFIG.race.stepMs` simulated
 * milliseconds.
 *
 * Each running horse moves at its pace plus a small per-step variation. A
 * horse that crosses the line gets the exact crossing time within the step,
 * so two horses finishing in the same step are still told apart.
 */
export function stepRace(state: RaceState, rng: Rng): RaceState {
  const { stepMs, speedJitter } = GAME_CONFIG.race
  const lanes = state.lanes.map((lane) => {
    if (lane.finishTime !== null) return lane

    const pace = state.paces.get(lane.horseId) ?? 0
    const speed = Math.max(0, pace + spread(rng, speedJitter))
    const covered = lane.covered + (speed * stepMs) / 1000
    if (covered < state.distance) return { ...lane, covered }

    const remaining = state.distance - lane.covered
    const finishTime = state.elapsed + (remaining / speed) * 1000
    return { ...lane, covered: state.distance, finishTime }
  })

  return { ...state, elapsed: state.elapsed + stepMs, lanes }
}

/** Tells whether every runner has crossed the finish line. */
export function isRaceFinished(state: RaceState): boolean {
  return state.lanes.every((lane) => lane.finishTime !== null)
}

/**
 * Ranks the runners: finished horses by crossing time, then horses still
 * running by distance covered. Exact ties keep lane order.
 */
export function rankRace(state: RaceState): Placement[] {
  return [...state.lanes]
    .sort((a, b) => {
      if (a.finishTime !== null && b.finishTime !== null) return a.finishTime - b.finishTime
      if (a.finishTime !== null) return -1
      if (b.finishTime !== null) return 1
      return b.covered - a.covered
    })
    .map((lane, i) => ({ position: i + 1, horseId: lane.horseId }))
}
