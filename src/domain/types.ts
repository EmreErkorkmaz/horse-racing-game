/**
 * Domain model of the horse racing game.
 *
 * These types are framework-agnostic: the domain layer, the store and the
 * presentational components all share them, and none of them depends on Vue.
 */

/** A display color with a human-readable name. */
export interface HorseColor {
  name: string
  hex: string
}

export interface Horse {
  /** Stable identifier, also shown as the horse number (1-based). */
  id: number
  name: string
  /** Unique within a generated stable. */
  color: HorseColor
  /** Fitness score between 1 and 100. Higher scores mean a faster average pace. */
  condition: number
}

/** One scheduled race of the program. */
export interface Round {
  /** Zero-based position in the program. */
  index: number
  /** Race length in meters. */
  distance: number
  /** Participating horses, in lane order (lane 1 first). */
  horseIds: number[]
}

/** Live state of a single horse during a round. */
export interface LaneProgress {
  horseId: number
  /** Meters covered so far, capped at the round distance. */
  covered: number
  /** Elapsed race time in milliseconds when the horse crossed the line, or null while running. */
  finishTime: number | null
}

/** Final placement of a horse in a finished round. */
export interface Placement {
  /** 1-based finishing position. */
  position: number
  horseId: number
}

/** Outcome of a finished round. */
export interface RoundResult {
  roundIndex: number
  placements: Placement[]
}

/**
 * Lifecycle of the game.
 *
 * - `idle`: horses exist, no program yet.
 * - `ready`: a program exists, no round has started.
 * - `running`: a round is in progress.
 * - `paused`: a round is in progress but the clock is stopped.
 * - `roundFinished`: a round has just ended; the game waits for the choice
 *   between the next round and finishing the program.
 * - `finished`: the program is over, either after its last round or ended early.
 */
export type GameStatus = 'idle' | 'ready' | 'running' | 'paused' | 'roundFinished' | 'finished'
