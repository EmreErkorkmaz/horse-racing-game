import { describe, expect, it } from 'vitest'
import { formatFinishTime, formatRaceTime, roundLabel, toFraction } from '../format'

describe('roundLabel', () => {
  it('uses a 1-based round number and the distance in meters', () => {
    expect(roundLabel({ index: 0, distance: 1200, horseIds: [] })).toBe('Round 1 - 1200m')
    expect(roundLabel({ index: 5, distance: 2200, horseIds: [] })).toBe('Round 6 - 2200m')
  })
})

describe('formatRaceTime', () => {
  it('shows minutes, seconds and hundredths', () => {
    expect(formatRaceTime(70530)).toBe('1:10.53')
    expect(formatRaceTime(58210)).toBe('0:58.21')
    expect(formatRaceTime(60000)).toBe('1:00.00')
  })

  it('carries rounding over into the next second and minute', () => {
    expect(formatRaceTime(59996)).toBe('1:00.00')
    expect(formatRaceTime(9996)).toBe('0:10.00')
  })
})

describe('formatFinishTime', () => {
  it('formats a finishing time like formatRaceTime', () => {
    expect(formatFinishTime(70530)).toBe(formatRaceTime(70530))
  })

  it('returns an empty string when there is no time', () => {
    expect(formatFinishTime(null)).toBe('')
    expect(formatFinishTime(undefined)).toBe('')
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
