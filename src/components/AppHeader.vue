<script setup lang="ts">
/**
 * Top bar of the game: title, horse count, playback speed and the two
 * main actions (generate a program, start/pause the race).
 *
 * Stateless: every value comes in through props and every user intent
 * leaves as an event, so the parent stays the single owner of the state.
 * `horseCount` and `speed` follow the `v-model:<name>` convention.
 */
import { computed, useId } from 'vue'
import { GAME_CONFIG, type SpeedMultiplier } from '@/config/game'
import type { GameStatus } from '@/domain/types'

const props = defineProps<{
  /** Current lifecycle state; drives labels and disabled states. */
  status: GameStatus
  /** Number of horses in the stable. */
  horseCount: number
  /** Current playback speed multiplier. */
  speed: SpeedMultiplier
}>()

const emit = defineEmits<{
  /** New horse count, already clamped to the configured range. */
  'update:horseCount': [value: number]
  /** New playback speed multiplier. */
  'update:speed': [value: SpeedMultiplier]
  /** Request a new program (resets rounds and results). */
  generate: []
  /** Request to start, pause or resume the race. */
  toggle: []
}>()

const countId = useId()

/** A round is on the track, either moving or stopped. */
const raceInProgress = computed(() => props.status === 'running' || props.status === 'paused')

const toggleDisabled = computed(() => props.status === 'idle' || props.status === 'finished')

const toggleLabel = computed(() => {
  if (props.status === 'running') return 'Pause'
  if (props.status === 'paused') return 'Resume'
  return 'Start'
})

function onCountChange(event: Event) {
  const input = event.target as HTMLInputElement
  const parsed = Number.parseInt(input.value, 10)
  if (Number.isNaN(parsed)) {
    input.value = String(props.horseCount)
    return
  }
  const clamped = Math.min(GAME_CONFIG.maxHorseCount, Math.max(GAME_CONFIG.minHorseCount, parsed))
  // The prop may not change (e.g. 99 clamped to the current 20), so the field is synced here.
  input.value = String(clamped)
  emit('update:horseCount', clamped)
}
</script>

<template>
  <header class="app-header">
    <h1 class="title">Horse Racing</h1>

    <div class="controls">
      <div class="field">
        <label :for="countId">Horses</label>
        <input
          :id="countId"
          data-test="horse-count"
          type="number"
          inputmode="numeric"
          :min="GAME_CONFIG.minHorseCount"
          :max="GAME_CONFIG.maxHorseCount"
          :value="horseCount"
          :disabled="raceInProgress"
          @change="onCountChange"
        />
      </div>

      <fieldset class="speed">
        <legend>Speed</legend>
        <label
          v-for="multiplier in GAME_CONFIG.speedMultipliers"
          :key="multiplier"
          class="speed-option"
        >
          <input
            type="radio"
            name="speed"
            :value="multiplier"
            :checked="multiplier === speed"
            @change="emit('update:speed', multiplier)"
          />
          <span>{{ multiplier }}x</span>
        </label>
      </fieldset>

      <button
        type="button"
        class="button"
        data-test="generate"
        :disabled="status === 'running'"
        @click="emit('generate')"
      >
        Generate Program
      </button>
      <button
        type="button"
        class="button button-primary"
        data-test="toggle"
        :disabled="toggleDisabled"
        @click="emit('toggle')"
      >
        {{ toggleLabel }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem 1.5rem;
  padding: 0.75rem 1rem;
  background: var(--color-header-bg);
  color: var(--color-header-text);
}

.title {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: 0.02em;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.field input {
  width: 4.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
}

.field input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.speed {
  display: flex;
  align-items: center;
  gap: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.speed legend {
  float: left;
  margin-right: 0.5rem;
  padding: 0;
}

.speed-option {
  position: relative;
}

/* The native radio stays in the accessibility tree and keeps keyboard behavior. */
.speed-option input {
  position: absolute;
  inset: 0;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.speed-option span {
  display: block;
  min-width: 2.5rem;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  text-align: center;
}

.speed-option:first-of-type span {
  border-radius: var(--radius) 0 0 var(--radius);
}

.speed-option:last-of-type span {
  border-radius: 0 var(--radius) var(--radius) 0;
}

.speed-option + .speed-option span {
  border-left: 0;
}

.speed-option input:checked + span {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
}

.speed-option input:focus-visible + span {
  outline: var(--focus-ring);
  outline-offset: 2px;
}

.button {
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}

.button-primary {
  min-width: 7rem;
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
