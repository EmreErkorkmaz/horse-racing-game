import { describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '@/config/game'
import { generateHorses } from '../horses'
import { generateProgram } from '../program'
import { createRng } from '../rng'

const stable = (count: number) => generateHorses(count, createRng(1))

describe('generateProgram', () => {
  it('schedules one round per configured distance, in order', () => {
    const program = generateProgram(stable(20), createRng(1))
    expect(program.map((r) => r.index)).toEqual(GAME_CONFIG.roundDistances.map((_, i) => i))
    expect(program.map((r) => r.distance)).toEqual([...GAME_CONFIG.roundDistances])
  })

  it('enters the configured number of distinct horses from the stable in each round', () => {
    const horses = stable(20)
    const ids = horses.map((h) => h.id)
    for (const round of generateProgram(horses, createRng(2))) {
      expect(round.horseIds).toHaveLength(GAME_CONFIG.horsesPerRound)
      expect(new Set(round.horseIds).size).toBe(GAME_CONFIG.horsesPerRound)
      for (const id of round.horseIds) expect(ids).toContain(id)
    }
  })

  it('draws a fresh field for every round', () => {
    const fields = generateProgram(stable(20), createRng(3)).map((r) => r.horseIds.join())
    expect(new Set(fields).size).toBeGreaterThan(1)
  })

  it('enters every horse when the stable is smaller than a full field', () => {
    for (const round of generateProgram(stable(4), createRng(4))) {
      expect([...round.horseIds].sort((a, b) => a - b)).toEqual([1, 2, 3, 4])
    }
  })

  it('is deterministic for the same seed', () => {
    expect(generateProgram(stable(20), createRng(42))).toEqual(
      generateProgram(stable(20), createRng(42)),
    )
  })
})
