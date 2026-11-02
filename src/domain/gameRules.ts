import type { GameStatus } from './types'

/**
 * Which user actions each game status allows.
 *
 * The store uses these rules to ignore actions that are not allowed, and the
 * header uses the same rules to disable the matching controls, so both always
 * agree.
 *
 * | Status          | Horse count | Generate | Start/Pause |
 * |-----------------|-------------|----------|-------------|
 * | `idle`          | yes         | yes      | no          |
 * | `ready`         | yes         | yes      | yes         |
 * | `running`       | no          | no       | yes         |
 * | `paused`        | no          | yes      | yes         |
 * | `roundFinished` | no          | no       | no          |
 * | `finished`      | yes         | yes      | no          |
 */

/** The stable can be replaced: no round is on the track. */
export function canChangeHorseCount(status: GameStatus): boolean {
  return status === 'idle' || status === 'ready' || status === 'finished'
}

/** A new program can be drawn: horses are not moving and no round result awaits a choice. */
export function canGenerate(status: GameStatus): boolean {
  return status !== 'running' && status !== 'roundFinished'
}

/** Start, pause or resume is possible. */
export function canToggle(status: GameStatus): boolean {
  return status === 'ready' || status === 'running' || status === 'paused'
}

/** The race clock is running. */
export function isRaceRunning(status: GameStatus): boolean {
  return status === 'running'
}

/** A round has ended and the game waits for the next round or the finish. */
export function isAwaitingRoundChoice(status: GameStatus): boolean {
  return status === 'roundFinished'
}

/** The program is over, either after its last round or ended early. */
export function isProgramFinished(status: GameStatus): boolean {
  return status === 'finished'
}
