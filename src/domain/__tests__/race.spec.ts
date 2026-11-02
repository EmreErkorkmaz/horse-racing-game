import { describe, expect, it } from 'vitest'
import { GAME_CONFIG } from '@/config/game'
import { basePace, createRace, isRaceFinished, rankRace, stepRace, type RaceState } from '../race'
import { createRng, type Rng } from '../rng'
import type { Horse, Round } from '../types'

const { baseSpeed, conditionBonus, formRange, speedJitter, stepMs } = GAME_CONFIG.race

/** Rng that always returns the midpoint, which cancels every random variation. */
const steadyRng: Rng = { next: () => 0.5 }
const lowestRng: Rng = { next: () => 0 }

function horse(id: number, condition: number): Horse {
  return { id, name: `Horse ${id}`, color: { name: `C${id}`, hex: '#000000' }, condition }
}

function round(distance: number, horseIds: number[]): Round {
  return { index: 0, distance, horseIds }
}

/** Meters covered in one step at the given speed in m/s. */
const perStep = (speed: number) => (speed * stepMs) / 1000

function steps(state: RaceState, count: number, rng: Rng): RaceState {
  let current = state
  for (let i = 0; i < count; i++) current = stepRace(current, rng)
  return current
}

function runToFinish(state: RaceState, rng: Rng): RaceState {
  let current = state
  for (let i = 0; i < 100_000 && !isRaceFinished(current); i++) current = stepRace(current, rng)
  return current
}

describe('basePace', () => {
  it('is the base speed at the lowest condition and adds the full bonus at the highest', () => {
    const { min, max } = GAME_CONFIG.conditionRange
    expect(basePace(min)).toBeCloseTo(baseSpeed)
    expect(basePace(max)).toBeCloseTo(baseSpeed + conditionBonus)
  })
})

describe('createRace', () => {
  it('places every entered horse at the start line in lane order', () => {
    const horses = [horse(1, 50), horse(2, 50), horse(3, 50)]
    const state = createRace(round(1200, [3, 1, 2]), horses, steadyRng)
    expect(state.distance).toBe(1200)
    expect(state.elapsed).toBe(0)
    expect(state.lanes).toEqual([
      { horseId: 3, covered: 0, finishTime: null },
      { horseId: 1, covered: 0, finishTime: null },
      { horseId: 2, covered: 0, finishTime: null },
    ])
  })

  it('draws a form of the day that shifts the pace by at most the form range', () => {
    const state = createRace(round(1200, [1]), [horse(1, 1)], lowestRng)
    expect(stepRace(state, steadyRng).lanes[0]?.covered).toBeCloseTo(perStep(baseSpeed - formRange))
  })

  it('rejects a round that enters a horse missing from the stable', () => {
    expect(() => createRace(round(1200, [1, 9]), [horse(1, 50)], steadyRng)).toThrow(/9/)
  })
})

describe('stepRace', () => {
  it('advances the clock by one step and moves each horse at its pace', () => {
    const start = createRace(round(1200, [1, 2]), [horse(1, 1), horse(2, 100)], steadyRng)
    const next = stepRace(start, steadyRng)
    expect(next.elapsed).toBe(stepMs)
    expect(next.lanes[0]?.covered).toBeCloseTo(perStep(baseSpeed))
    expect(next.lanes[1]?.covered).toBeCloseTo(perStep(baseSpeed + conditionBonus))
  })

  it('varies the speed of each step by at most the configured jitter', () => {
    const start = createRace(round(1200, [1]), [horse(1, 1)], steadyRng)
    expect(stepRace(start, lowestRng).lanes[0]?.covered).toBeCloseTo(
      perStep(baseSpeed - speedJitter),
    )
  })

  it('does not mutate the previous state', () => {
    const start = createRace(round(1200, [1]), [horse(1, 50)], steadyRng)
    stepRace(start, steadyRng)
    expect(start.elapsed).toBe(0)
    expect(start.lanes[0]?.covered).toBe(0)
  })

  it('records the exact crossing time within the step and caps the distance', () => {
    // 18 m/s covers 1.8 m per 100 ms step: 9 m after 500 ms, then the last
    // meter takes 1 / 18 s, so the line is crossed at about 555.6 ms.
    const state = steps(createRace(round(10, [1]), [horse(1, 100)], steadyRng), 6, steadyRng)
    expect(state.lanes[0]?.covered).toBe(10)
    expect(state.lanes[0]?.finishTime).toBeCloseTo(500 + 1000 / 18)
  })

  it('leaves finished horses untouched', () => {
    const horses = [horse(1, 100), horse(2, 1)]
    const state = steps(createRace(round(10, [1, 2]), horses, steadyRng), 6, steadyRng)
    expect(stepRace(state, steadyRng).lanes[0]).toEqual(state.lanes[0])
  })

  it('is deterministic for the same seed', () => {
    const horses = [horse(1, 30), horse(2, 60), horse(3, 90)]
    const run = (seed: number) => {
      const rng = createRng(seed)
      return runToFinish(createRace(round(1200, [1, 2, 3]), horses, rng), rng)
    }
    expect(run(7)).toEqual(run(7))
  })
})

describe('isRaceFinished', () => {
  it('turns true only once every horse has crossed the line', () => {
    const horses = [horse(1, 100), horse(2, 1)]
    const state = steps(createRace(round(10, [1, 2]), horses, steadyRng), 6, steadyRng)
    expect(isRaceFinished(state)).toBe(false)
    expect(isRaceFinished(runToFinish(state, steadyRng))).toBe(true)
  })
})

describe('rankRace', () => {
  const horses = [horse(1, 1), horse(2, 100), horse(3, 50)]

  it('orders horses by finishing time with 1-based positions', () => {
    const state = runToFinish(createRace(round(1200, [1, 2, 3]), horses, steadyRng), steadyRng)
    expect(rankRace(state)).toEqual([
      { position: 1, horseId: 2 },
      { position: 2, horseId: 3 },
      { position: 3, horseId: 1 },
    ])
  })

  it('ranks horses still running behind finished ones, by distance covered', () => {
    const state = steps(createRace(round(10, [1, 2, 3]), horses, steadyRng), 6, steadyRng)
    expect(rankRace(state).map((p) => p.horseId)).toEqual([2, 3, 1])
  })

  it('lets the fitter horse win most races without making it unbeatable', () => {
    let fitterWins = 0
    for (let seed = 0; seed < 200; seed++) {
      const rng = createRng(seed)
      const state = createRace(round(1200, [1, 2]), [horse(1, 60), horse(2, 70)], rng)
      if (rankRace(runToFinish(state, rng))[0]?.horseId === 2) fitterWins++
    }
    expect(fitterWins).toBeGreaterThan(110)
    expect(fitterWins).toBeLessThan(190)
  })
})
