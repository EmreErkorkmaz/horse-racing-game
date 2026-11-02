import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { GAME_CONFIG } from '@/config/game'
import { useGameStore } from '../game'

const ROUND_COUNT = GAME_CONFIG.roundDistances.length

/** Real milliseconds that comfortably cover the longest round at 1x. */
const LONG_TICK = 60_000

type GameStore = ReturnType<typeof useGameStore>

function readyStore(seed = 42): GameStore {
  const store = useGameStore()
  store.init(seed)
  store.generate()
  return store
}

/** Starts a ready game and runs its first round to the end. */
function finishFirstRound(store: GameStore): void {
  store.toggle()
  store.tick(LONG_TICK)
}

const covered = (store: GameStore) => store.progress.map((lane) => lane.covered)

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('init', () => {
  it('creates the default stable and waits for a program', () => {
    const store = useGameStore()
    store.init(42)
    expect(store.status).toBe('idle')
    expect(store.horses).toHaveLength(GAME_CONFIG.defaultHorseCount)
    expect(store.horseCount).toBe(GAME_CONFIG.defaultHorseCount)
    expect(store.program).toEqual([])
    expect(store.results).toEqual([])
    expect(store.currentRound).toBeNull()
    expect(store.progress).toEqual([])
  })

  it('creates the same stable for the same seed', () => {
    const first = useGameStore()
    first.init(7)
    const horses = first.horses
    setActivePinia(createPinia())
    const second = useGameStore()
    second.init(7)
    expect(second.horses).toEqual(horses)
  })
})

describe('setHorseCount', () => {
  it('rebuilds the stable and drops the program', () => {
    const store = readyStore()
    store.setHorseCount(5)
    expect(store.horses).toHaveLength(5)
    expect(store.horseCount).toBe(5)
    expect(store.program).toEqual([])
    expect(store.status).toBe('idle')
  })

  it('is ignored while a round is on the track', () => {
    const store = readyStore()
    store.toggle()
    store.setHorseCount(5)
    expect(store.horses).toHaveLength(GAME_CONFIG.defaultHorseCount)
    store.toggle()
    store.setHorseCount(5)
    expect(store.horses).toHaveLength(GAME_CONFIG.defaultHorseCount)
  })
})

describe('generate', () => {
  it('builds a program and shows its first round at the start line', () => {
    const store = readyStore()
    expect(store.status).toBe('ready')
    expect(store.program.map((r) => r.distance)).toEqual([...GAME_CONFIG.roundDistances])
    expect(store.currentRound).toEqual(store.program[0])
    expect(store.results).toEqual([])
    expect(store.progress).toEqual([])
  })

  it('keeps the stable', () => {
    const store = useGameStore()
    store.init(42)
    const horses = store.horses
    store.generate()
    expect(store.horses).toBe(horses)
  })

  it('cancels a paused race and clears previous results', () => {
    const store = readyStore()
    finishFirstRound(store)
    store.nextRound()
    store.toggle()
    store.generate()
    expect(store.status).toBe('ready')
    expect(store.results).toEqual([])
    expect(store.progress).toEqual([])
  })

  it('is ignored while a round is running or awaiting the next step', () => {
    const store = readyStore()
    const program = store.program
    store.toggle()
    store.generate()
    expect(store.program).toBe(program)
    store.tick(LONG_TICK)
    store.generate()
    expect(store.status).toBe('roundFinished')
    expect(store.program).toBe(program)
  })
})

describe('toggle', () => {
  it('starts the first round from the start line', () => {
    const store = readyStore()
    store.toggle()
    expect(store.status).toBe('running')
    expect(store.currentRoundIndex).toBe(0)
    expect(store.progress.map((lane) => lane.horseId)).toEqual(store.program[0]?.horseIds)
    expect(covered(store).every((meters) => meters === 0)).toBe(true)
  })

  it('pauses and resumes the race', () => {
    const store = readyStore()
    store.toggle()
    store.toggle()
    expect(store.status).toBe('paused')
    store.toggle()
    expect(store.status).toBe('running')
  })

  it('does nothing without a program', () => {
    const store = useGameStore()
    store.init(42)
    store.toggle()
    expect(store.status).toBe('idle')
  })

  it('does nothing after the program has finished', () => {
    const store = readyStore()
    finishFirstRound(store)
    store.finish()
    store.toggle()
    expect(store.status).toBe('finished')
  })
})

describe('tick', () => {
  it('moves the horses only while running', () => {
    const store = readyStore()
    store.toggle()
    store.tick(100)
    const moved = covered(store)
    expect(moved.every((meters) => meters > 0)).toBe(true)
    store.toggle()
    store.tick(100)
    expect(covered(store)).toEqual(moved)
  })

  it('accumulates short frames until a full engine step is due', () => {
    const { stepMs, timeScale } = GAME_CONFIG.race
    const halfStep = stepMs / timeScale / 2
    const store = readyStore()
    store.toggle()
    store.tick(halfStep)
    expect(covered(store).every((meters) => meters === 0)).toBe(true)
    store.tick(halfStep)
    expect(covered(store).every((meters) => meters > 0)).toBe(true)
  })

  it('plays the same race faster with a higher speed multiplier', () => {
    const fast = readyStore()
    fast.setSpeed(2)
    fast.toggle()
    fast.tick(100)

    setActivePinia(createPinia())
    const normal = readyStore()
    normal.toggle()
    normal.tick(200)

    expect(covered(fast)).toEqual(covered(normal))
  })

  it('records the result and waits for a choice when the round ends', () => {
    const store = readyStore()
    finishFirstRound(store)
    expect(store.status).toBe('roundFinished')
    expect(store.results).toHaveLength(1)
    expect(store.results[0]?.roundIndex).toBe(0)
    expect(store.results[0]?.placements.map((p) => p.position)).toEqual(
      Array.from({ length: GAME_CONFIG.horsesPerRound }, (_, i) => i + 1),
    )
    expect(store.lastResult).toEqual(store.results[0])
    expect(store.progress.every((lane) => lane.finishTime !== null)).toBe(true)
  })
})

describe('nextRound', () => {
  it('starts the following round and keeps earlier results', () => {
    const store = readyStore()
    finishFirstRound(store)
    store.nextRound()
    expect(store.status).toBe('running')
    expect(store.currentRoundIndex).toBe(1)
    expect(store.currentRound).toEqual(store.program[1])
    expect(store.results).toHaveLength(1)
  })

  it('is not available after the last round', () => {
    const store = readyStore()
    store.toggle()
    for (let i = 0; i < ROUND_COUNT - 1; i++) {
      store.tick(LONG_TICK)
      expect(store.isLastRound).toBe(false)
      store.nextRound()
    }
    store.tick(LONG_TICK)
    expect(store.isLastRound).toBe(true)
    store.nextRound()
    expect(store.status).toBe('roundFinished')
    expect(store.results).toHaveLength(ROUND_COUNT)
  })
})

describe('finish', () => {
  it('ends the program early and keeps only the rounds that were run', () => {
    const store = readyStore()
    finishFirstRound(store)
    store.finish()
    expect(store.status).toBe('finished')
    expect(store.results).toHaveLength(1)
  })

  it('is ignored while a round is running', () => {
    const store = readyStore()
    store.toggle()
    store.finish()
    expect(store.status).toBe('running')
  })
})

describe('determinism', () => {
  it('replays the same game for the same seed and actions', () => {
    const play = () => {
      const store = readyStore(99)
      finishFirstRound(store)
      store.nextRound()
      store.tick(LONG_TICK)
      return store.results
    }
    const first = play()
    setActivePinia(createPinia())
    expect(play()).toEqual(first)
  })
})

describe('status flags', () => {
  it('report a running race and a pending round choice', () => {
    const store = readyStore()
    expect([store.isRaceRunning, store.isAwaitingRoundChoice]).toEqual([false, false])
    store.toggle()
    expect([store.isRaceRunning, store.isAwaitingRoundChoice]).toEqual([true, false])
    store.tick(LONG_TICK)
    expect([store.isRaceRunning, store.isAwaitingRoundChoice]).toEqual([false, true])
  })
})
