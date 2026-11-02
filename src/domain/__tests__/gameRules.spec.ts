import { describe, expect, it } from 'vitest'
import * as rules from '../gameRules'
import type { GameStatus } from '../types'

const statuses: GameStatus[] = ['idle', 'ready', 'running', 'paused', 'roundFinished', 'finished']

/**
 * Statuses in which each rule holds; it is false in every other status.
 * Typed by the module's exports, so a new rule without a row does not compile.
 */
const holdsIn: Record<keyof typeof rules, GameStatus[]> = {
  canChangeHorseCount: ['idle', 'ready', 'finished'],
  canGenerate: ['idle', 'ready', 'paused', 'finished'],
  canToggle: ['ready', 'running', 'paused'],
  isRaceRunning: ['running'],
  isAwaitingRoundChoice: ['roundFinished'],
  isProgramFinished: ['finished'],
}

describe('game rules', () => {
  it.each(statuses)('in %s', (status) => {
    const actual = Object.fromEntries(
      Object.entries(rules).map(([name, rule]) => [name, rule(status)]),
    )
    const expected = Object.fromEntries(
      Object.entries(holdsIn).map(([name, allowed]) => [name, allowed.includes(status)]),
    )
    expect(actual).toEqual(expected)
  })
})
