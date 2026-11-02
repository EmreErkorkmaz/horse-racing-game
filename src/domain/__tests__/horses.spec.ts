import { describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '@/config/game'
import { HORSE_COLORS, HORSE_NAMES } from '@/config/stable'
import { generateHorses } from '../horses'
import { createRng } from '../rng'

describe('stable data', () => {
  it('provides enough unique names and colors for the largest stable', () => {
    expect(new Set(HORSE_NAMES).size).toBeGreaterThanOrEqual(GAME_CONFIG.maxHorseCount)
    expect(new Set(HORSE_COLORS.map((c) => c.hex)).size).toBeGreaterThanOrEqual(
      GAME_CONFIG.maxHorseCount,
    )
    expect(new Set(HORSE_COLORS.map((c) => c.name)).size).toBe(HORSE_COLORS.length)
  })
})

describe('generateHorses', () => {
  it('creates the requested number of horses with 1-based sequential ids', () => {
    const horses = generateHorses(GAME_CONFIG.defaultHorseCount, createRng(1))
    expect(horses.map((h) => h.id)).toEqual(
      Array.from({ length: GAME_CONFIG.defaultHorseCount }, (_, i) => i + 1),
    )
  })

  it('gives every horse a unique name and a unique color', () => {
    const horses = generateHorses(GAME_CONFIG.maxHorseCount, createRng(1))
    expect(new Set(horses.map((h) => h.name)).size).toBe(horses.length)
    expect(new Set(horses.map((h) => h.color.hex)).size).toBe(horses.length)
  })

  it('assigns an integer condition within the configured range', () => {
    const { min, max } = GAME_CONFIG.conditionRange
    for (const horse of generateHorses(GAME_CONFIG.maxHorseCount, createRng(2))) {
      expect(Number.isInteger(horse.condition)).toBe(true)
      expect(horse.condition).toBeGreaterThanOrEqual(min)
      expect(horse.condition).toBeLessThanOrEqual(max)
    }
  })

  it('is deterministic for the same seed', () => {
    expect(generateHorses(20, createRng(42))).toEqual(generateHorses(20, createRng(42)))
  })

  it('accepts the configured minimum and maximum counts', () => {
    expect(generateHorses(GAME_CONFIG.minHorseCount, createRng(1))).toHaveLength(
      GAME_CONFIG.minHorseCount,
    )
    expect(generateHorses(GAME_CONFIG.maxHorseCount, createRng(1))).toHaveLength(
      GAME_CONFIG.maxHorseCount,
    )
  })

  it.each([GAME_CONFIG.minHorseCount - 1, GAME_CONFIG.maxHorseCount + 1, 2.5])(
    'rejects an invalid count of %s',
    (count) => {
      expect(() => generateHorses(count, createRng(1))).toThrow(RangeError)
    },
  )
})
