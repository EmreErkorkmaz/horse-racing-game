import { describe, expect, it } from 'vitest'
import { gallopPhase } from '../gallop'

const ids = Array.from({ length: 20 }, (_, i) => i + 1)

/** Distance between two phases on the gallop cycle, where 0 and 1 meet. */
const cycleDistance = (a: number, b: number) => Math.min(Math.abs(a - b), 1 - Math.abs(a - b))

describe('gallopPhase', () => {
  it('returns a share of the gallop cycle between 0 (inclusive) and 1 (exclusive)', () => {
    for (const id of ids) {
      expect(gallopPhase(id)).toBeGreaterThanOrEqual(0)
      expect(gallopPhase(id)).toBeLessThan(1)
    }
  })

  it('always gives the same horse the same phase', () => {
    expect(gallopPhase(7)).toBe(gallopPhase(7))
  })

  it('gives every horse of the largest stable its own phase', () => {
    expect(new Set(ids.map(gallopPhase)).size).toBe(ids.length)
  })

  it('keeps consecutive horse numbers well apart on the cycle', () => {
    for (const id of ids.slice(1)) {
      expect(cycleDistance(gallopPhase(id), gallopPhase(id - 1))).toBeGreaterThanOrEqual(0.2)
    }
  })
})
