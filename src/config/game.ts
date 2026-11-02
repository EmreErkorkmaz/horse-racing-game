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
  /** Race engine tuning. Speeds are in meters per simulated second. */
  race: {
    /** Speed of a horse with the lowest condition, before random variation. */
    baseSpeed: 14,
    /** Extra speed of a horse with the highest condition; scales linearly with condition. */
    conditionBonus: 4,
    /**
     * Largest random change of a horse's pace for one round ("form of the
     * day"), applied in both directions. This is what makes upsets possible.
     */
    formRange: 1,
    /**
     * Largest random speed change per step, applied in both directions. It
     * averages out over a round and only keeps the movement lively.
     */
    speedJitter: 1.5,
    /** Simulated time covered by one engine step, in milliseconds. */
    stepMs: 100,
    /** Simulated milliseconds per real millisecond at 1x playback. */
    timeScale: 10,
  },
} as const

export type GameConfig = typeof GAME_CONFIG
export type SpeedMultiplier = GameConfig['speedMultipliers'][number]
