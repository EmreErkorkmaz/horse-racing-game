import { describe, expect, it } from 'vitest'
import * as rules from '../gameRules'
import type { GameStatus } from '../types'

/** Expected answer of every rule in every status; one row per status. */
const table: [GameStatus, Record<keyof typeof rules, boolean>][] = [
  [
    'idle',
    {
      canChangeHorseCount: true,
      canGenerate: true,
      canToggle: false,
      isRaceRunning: false,
      isAwaitingRoundChoice: false,
    },
  ],
  [
    'ready',
    {
      canChangeHorseCount: true,
      canGenerate: true,
      canToggle: true,
      isRaceRunning: false,
      isAwaitingRoundChoice: false,
    },
  ],
  [
    'running',
    {
      canChangeHorseCount: false,
      canGenerate: false,
      canToggle: true,
      isRaceRunning: true,
      isAwaitingRoundChoice: false,
    },
  ],
  [
    'paused',
    {
      canChangeHorseCount: false,
      canGenerate: true,
      canToggle: true,
      isRaceRunning: false,
      isAwaitingRoundChoice: false,
    },
  ],
  [
    'roundFinished',
    {
      canChangeHorseCount: false,
      canGenerate: false,
      canToggle: false,
      isRaceRunning: false,
      isAwaitingRoundChoice: true,
    },
  ],
  [
    'finished',
    {
      canChangeHorseCount: true,
      canGenerate: true,
      canToggle: false,
      isRaceRunning: false,
      isAwaitingRoundChoice: false,
    },
  ],
]

describe('game rules', () => {
  it.each(table)('in %s', (status, expected) => {
    const actual = Object.fromEntries(
      Object.entries(rules).map(([name, rule]) => [name, rule(status)]),
    )
    expect(actual).toEqual(expected)
  })
})
