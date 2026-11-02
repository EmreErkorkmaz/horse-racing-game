/**
 * Game rules and tuning values.
 *
 * Every rule from the specification lives here so that a rule change
 * (more rounds, other distances, a bigger stable) is a one-line edit.
 */
export const GAME_CONFIG = {
  /** Number of horses generated when the page loads. */
  defaultHorseCount: 20,
  /** Lowest horse count the user can select. */
  minHorseCount: 2,
  /** Highest horse count the user can select. */
  maxHorseCount: 20,
  /** Lowest and highest possible condition score of a horse. */
  conditionRange: { min: 1, max: 100 },
  /** Maximum number of horses running in a single round. */
  horsesPerRound: 10,
  /** Distance of each round in meters. The array length defines the round count. */
  roundDistances: [1200, 1400, 1600, 1800, 2000, 2200],
  /** Playback speed multipliers offered to the user. */
  speedMultipliers: [1, 2, 4],
} as const

export type GameConfig = typeof GAME_CONFIG
export type SpeedMultiplier = GameConfig['speedMultipliers'][number]
