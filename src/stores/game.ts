import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { GAME_CONFIG, type SpeedMultiplier } from '@/config/game'
import { generateHorses } from '@/domain/horses'
import { generateProgram } from '@/domain/program'
import { createRace, isRaceFinished, rankRace, stepRace, type RaceState } from '@/domain/race'
import { createRng, type Rng } from '@/domain/rng'
import type { GameStatus, Horse, LaneProgress, Round, RoundResult } from '@/domain/types'

/**
 * Game state and the state machine that drives it.
 *
 * Transitions (any other action in a given status is ignored):
 *
 * | Action         | Allowed in                     | Leads to                    |
 * |----------------|--------------------------------|-----------------------------|
 * | `init`         | any                            | `idle`                      |
 * | `setHorseCount`| `idle`, `ready`, `finished`    | `idle` (program dropped)    |
 * | `generate`     | `idle`, `ready`, `paused`, `finished` | `ready`              |
 * | `toggle`       | `ready`, `running`, `paused`   | `running` / `paused`        |
 * | `tick`         | `running`                      | `roundFinished` at the line |
 * | `nextRound`    | `roundFinished`, not last round| `running`                   |
 * | `finish`       | `roundFinished`                | `finished`                  |
 *
 * Every random draw (stable, program, races) comes from one seeded `Rng`, so
 * the same seed and the same actions always replay the same game.
 *
 * The race snapshot changes on every engine step and lives in a `shallowRef`;
 * `horses`, `program` and `results` are replaced only when they actually
 * change, so components that render them do not update on every frame.
 */
export const useGameStore = defineStore('game', () => {
  const status = ref<GameStatus>('idle')
  const speed = ref<SpeedMultiplier>(1)
  const horses = shallowRef<Horse[]>([])
  const program = shallowRef<Round[]>([])
  const results = shallowRef<RoundResult[]>([])
  const currentRoundIndex = ref<number | null>(null)
  const race = shallowRef<RaceState | null>(null)

  let rng: Rng = createRng(0)
  /** Simulated milliseconds waiting to be consumed by engine steps. */
  let pendingMs = 0

  const horseCount = computed(() => horses.value.length)

  /** The round on the track: the active one, or the first one before the start. */
  const currentRound = computed<Round | null>(
    () => program.value[currentRoundIndex.value ?? 0] ?? null,
  )

  /** Live lane positions of the current round; empty before the start. */
  const progress = computed<LaneProgress[]>(() => race.value?.lanes ?? [])

  const lastResult = computed<RoundResult | null>(
    () => results.value[results.value.length - 1] ?? null,
  )

  const isLastRound = computed(
    () => currentRoundIndex.value === program.value.length - 1 && program.value.length > 0,
  )

  function resetProgram(): void {
    program.value = []
    results.value = []
    currentRoundIndex.value = null
    race.value = null
    pendingMs = 0
  }

  function startRound(index: number): void {
    const round = program.value[index]
    if (!round) return
    currentRoundIndex.value = index
    race.value = createRace(round, horses.value, rng)
    pendingMs = 0
    status.value = 'running'
  }

  /** Starts a new game: a fresh stable of the default size, no program. */
  function init(seed: number): void {
    rng = createRng(seed)
    resetProgram()
    horses.value = generateHorses(GAME_CONFIG.defaultHorseCount, rng)
    status.value = 'idle'
  }

  /** Replaces the stable with `count` new horses and drops the program. */
  function setHorseCount(count: number): void {
    if (status.value !== 'idle' && status.value !== 'ready' && status.value !== 'finished') return
    resetProgram()
    horses.value = generateHorses(count, rng)
    status.value = 'idle'
  }

  /** Draws a new program for the current stable; any race in progress is dropped. */
  function generate(): void {
    if (status.value === 'running' || status.value === 'roundFinished') return
    resetProgram()
    program.value = generateProgram(horses.value, rng)
    status.value = 'ready'
  }

  /** Start, pause or resume, depending on the current status. */
  function toggle(): void {
    if (status.value === 'ready') startRound(0)
    else if (status.value === 'running') status.value = 'paused'
    else if (status.value === 'paused') status.value = 'running'
  }

  function setSpeed(multiplier: SpeedMultiplier): void {
    speed.value = multiplier
  }

  /**
   * Advances the race by `realMs` milliseconds of wall-clock time.
   *
   * The time is scaled by `timeScale` and the speed multiplier, then consumed
   * in fixed engine steps; a remainder shorter than one step carries over to
   * the next call. When the round ends, its result is recorded and the game
   * waits for `nextRound` or `finish`.
   */
  function tick(realMs: number): void {
    if (status.value !== 'running' || !race.value) return
    const { stepMs, timeScale } = GAME_CONFIG.race
    pendingMs += realMs * timeScale * speed.value

    let state = race.value
    while (pendingMs >= stepMs && !isRaceFinished(state)) {
      state = stepRace(state, rng)
      pendingMs -= stepMs
    }
    race.value = state

    if (isRaceFinished(state)) {
      results.value = [
        ...results.value,
        { roundIndex: currentRoundIndex.value ?? 0, placements: rankRace(state) },
      ]
      pendingMs = 0
      status.value = 'roundFinished'
    }
  }

  /** Starts the following round of the program. */
  function nextRound(): void {
    if (status.value !== 'roundFinished' || isLastRound.value) return
    startRound((currentRoundIndex.value ?? 0) + 1)
  }

  /** Ends the program after the current round; remaining rounds are not run. */
  function finish(): void {
    if (status.value !== 'roundFinished') return
    status.value = 'finished'
  }

  return {
    status,
    speed,
    horses,
    program,
    results,
    currentRoundIndex,
    horseCount,
    currentRound,
    progress,
    lastResult,
    isLastRound,
    init,
    setHorseCount,
    generate,
    toggle,
    setSpeed,
    tick,
    nextRound,
    finish,
  }
})
