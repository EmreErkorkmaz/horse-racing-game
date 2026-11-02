import { computed, ref, shallowRef } from 'vue'
import { defineStore } from 'pinia'
import { GAME_CONFIG, type SpeedMultiplier } from '@/config/game'
import * as rules from '@/domain/gameRules'
import { generateHorses } from '@/domain/horses'
import { generateProgram } from '@/domain/program'
import { createRace, isRaceFinished, rankRace, stepRace, type RaceState } from '@/domain/race'
import { createRng, type Rng } from '@/domain/rng'
import type { GameStatus, Horse, LaneProgress, Round, RoundResult } from '@/domain/types'

/**
 * Game state and the state machine that drives it.
 *
 * Which statuses allow an action is defined in `domain/gameRules.ts`; an
 * action called in any other status is ignored. Where each action leads:
 *
 * | Action          | Leads to                                                    |
 * |-----------------|-------------------------------------------------------------|
 * | `init`          | `idle`                                                      |
 * | `setHorseCount` | `idle` (program dropped)                                    |
 * | `generate`      | `ready`                                                     |
 * | `toggle`        | `running` from `ready` or `paused`; `paused` from `running` |
 * | `tick`          | `roundFinished` once every horse has crossed the line       |
 * | `nextRound`     | `running` (not available after the last round)              |
 * | `finish`        | `finished`                                                  |
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

  /** The race clock is running. */
  const isRaceRunning = computed(() => rules.isRaceRunning(status.value))

  /** A round has ended and the next round or the finish must be chosen. */
  const isAwaitingRoundChoice = computed(() => rules.isAwaitingRoundChoice(status.value))

  /** The program is over; only a new program or a new stable can follow. */
  const isProgramFinished = computed(() => rules.isProgramFinished(status.value))

  /** The round on the track: the active one, or the first one before the start. */
  const currentRound = computed<Round | null>(
    () => program.value[currentRoundIndex.value ?? 0] ?? null,
  )

  /** Live lane positions of the current round; empty before the start. */
  const progress = computed<LaneProgress[]>(() => race.value?.lanes ?? [])

  const lastResult = computed<RoundResult | null>(() => results.value.at(-1) ?? null)

  const isLastRound = computed(
    () => program.value.length > 0 && currentRoundIndex.value === program.value.length - 1,
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
    if (!rules.canChangeHorseCount(status.value)) return
    resetProgram()
    horses.value = generateHorses(count, rng)
    status.value = 'idle'
  }

  /** Draws a new program for the current stable; any race in progress is dropped. */
  function generate(): void {
    if (!rules.canGenerate(status.value)) return
    resetProgram()
    program.value = generateProgram(horses.value, rng)
    status.value = 'ready'
  }

  /** Start, pause or resume, depending on the current status. */
  function toggle(): void {
    if (!rules.canToggle(status.value)) return
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
    const roundIndex = currentRoundIndex.value
    if (!isRaceRunning.value || !race.value || roundIndex === null) return
    const { stepMs, timeScale } = GAME_CONFIG.race
    pendingMs += realMs * timeScale * speed.value

    let state = race.value
    while (pendingMs >= stepMs && !isRaceFinished(state)) {
      state = stepRace(state, rng)
      pendingMs -= stepMs
    }
    race.value = state

    if (isRaceFinished(state)) {
      results.value = [...results.value, { roundIndex, placements: rankRace(state) }]
      pendingMs = 0
      status.value = 'roundFinished'
    }
  }

  /** Starts the following round of the program. */
  function nextRound(): void {
    const roundIndex = currentRoundIndex.value
    if (!isAwaitingRoundChoice.value || isLastRound.value || roundIndex === null) return
    startRound(roundIndex + 1)
  }

  /** Ends the program after the current round; remaining rounds are not run. */
  function finish(): void {
    if (!isAwaitingRoundChoice.value) return
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
    isRaceRunning,
    isAwaitingRoundChoice,
    isProgramFinished,
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
