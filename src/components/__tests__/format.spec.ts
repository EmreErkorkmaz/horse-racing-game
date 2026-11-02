import { describe, expect, it } from 'vitest'
import { roundLabel, toFraction } from '../format'

describe('roundLabel', () => {
  it('uses a 1-based round number and the distance in meters', () => {
    expect(roundLabel({ index: 0, distance: 1200, horseIds: [] })).toBe('Round 1 - 1200m')
    expect(roundLabel({ index: 5, distance: 2200, horseIds: [] })).toBe('Round 6 - 2200m')
  })
})

describe('toFraction', () => {
  it('divides covered meters by the distance', () => {
    expect(toFraction(600, 1200)).toBe(0.5)
  })

  it('clamps to the 0..1 range', () => {
    expect(toFraction(-5, 1200)).toBe(0)
    expect(toFraction(1300, 1200)).toBe(1)
  })

  it('returns 0 for a non-positive distance', () => {
    expect(toFraction(100, 0)).toBe(0)
  })
})
