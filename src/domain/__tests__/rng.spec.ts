import { describe, expect, it } from 'vitest'
import { createRng, randomInt, sample, type Rng } from '../rng'

/** Builds an Rng that replays the given values in order, then repeats the last one. */
function sequenceRng(values: number[]): Rng {
  let i = 0
  return { next: () => values[Math.min(i++, values.length - 1)] ?? 0 }
}

function take(rng: Rng, count: number): number[] {
  return Array.from({ length: count }, () => rng.next())
}

describe('createRng', () => {
  it('produces the same sequence for the same seed', () => {
    expect(take(createRng(42), 10)).toEqual(take(createRng(42), 10))
  })

  it('produces different sequences for different seeds', () => {
    expect(take(createRng(1), 10)).not.toEqual(take(createRng(2), 10))
  })

  it('returns floats in the [0, 1) interval', () => {
    for (const value of take(createRng(7), 1000)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(1)
    }
  })
})

describe('randomInt', () => {
  it('maps the lowest random value to min and the highest to max', () => {
    const rng = sequenceRng([0, 0.9999999])
    expect(randomInt(rng, 1, 100)).toBe(1)
    expect(randomInt(rng, 1, 100)).toBe(100)
  })

  it('stays within the inclusive range', () => {
    const rng = createRng(3)
    for (let i = 0; i < 1000; i++) {
      const value = randomInt(rng, 5, 8)
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(5)
      expect(value).toBeLessThanOrEqual(8)
    }
  })
})

describe('sample', () => {
  const items = Array.from({ length: 20 }, (_, i) => i + 1)

  it('picks the requested number of distinct items from the source', () => {
    const picked = sample(createRng(5), items, 10)
    expect(picked).toHaveLength(10)
    expect(new Set(picked).size).toBe(10)
    for (const item of picked) expect(items).toContain(item)
  })

  it('is deterministic for the same seed', () => {
    expect(sample(createRng(9), items, 10)).toEqual(sample(createRng(9), items, 10))
  })

  it('returns every item when the count reaches the source length', () => {
    expect(sample(createRng(1), items, 25).sort((a, b) => a - b)).toEqual(items)
  })

  it('does not mutate the source array', () => {
    const source = [...items]
    sample(createRng(1), source, 10)
    expect(source).toEqual(items)
  })
})
