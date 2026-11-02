import { describe, expect, it } from 'vitest'
import {
  isAwaitingRoundChoice,
  canChangeHorseCount,
  canGenerate,
  canToggle,
  isRaceRunning,
} from '../gameRules'
import type { GameStatus } from '../types'

/** Expected answer of every rule in every status; one row per status. */
const table: [
  GameStatus,
  { horseCount: boolean; generate: boolean; toggle: boolean; running: boolean; choice: boolean },
][] = [
  ['idle', { horseCount: true, generate: true, toggle: false, running: false, choice: false }],
  ['ready', { horseCount: true, generate: true, toggle: true, running: false, choice: false }],
  ['running', { horseCount: false, generate: false, toggle: true, running: true, choice: false }],
  ['paused', { horseCount: false, generate: true, toggle: true, running: false, choice: false }],
  [
    'roundFinished',
    { horseCount: false, generate: false, toggle: false, running: false, choice: true },
  ],
  ['finished', { horseCount: true, generate: true, toggle: false, running: false, choice: false }],
]

describe('game rules', () => {
  it.each(table)('in %s', (status, expected) => {
    expect({
      horseCount: canChangeHorseCount(status),
      generate: canGenerate(status),
      toggle: canToggle(status),
      running: isRaceRunning(status),
      choice: isAwaitingRoundChoice(status),
    }).toEqual(expected)
  })
})
