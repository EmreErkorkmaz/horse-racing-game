<script setup lang="ts">
/**
 * Race track of the active round: one lane per runner, a finish line and
 * a label (the round, a start hint before a program exists, or a race-again
 * hint once the program is finished).
 *
 * `progress` changes every animation frame. Each lane receives a plain
 * number (`fraction`), so a frame only re-renders the lanes whose horse
 * actually moved, and inside a lane only the runner transform changes.
 */
import { computed, toRef } from 'vue'
import type { Horse, LaneProgress, Round } from '@/domain/types'
import { roundLabel, toFraction } from './format'
import { useHorseLookup } from './useHorseLookup'
import HorseIconSymbol from './HorseIconSymbol.vue'
import RaceLane from './RaceLane.vue'

const props = withDefaults(
  defineProps<{
    /** Round on the track, or null before a program exists. */
    round: Round | null
    /** Stable used to resolve horse ids. */
    horses: Horse[]
    /** Live progress of the runners; missing entries start at the gate. */
    progress: LaneProgress[]
    /** True while the race clock runs; drives the gallop animation only. */
    running?: boolean
    /** True once the program is over; the label then tells how to race again. */
    finished?: boolean
  }>(),
  { running: false, finished: false },
)

const horseById = useHorseLookup(toRef(props, 'horses'))

const label = computed(() => {
  if (props.finished) return 'Program finished. Generate a new program to race again.'
  if (props.round) return roundLabel(props.round)
  return 'Generate a program and press Start to begin the race.'
})

const lanes = computed(() => {
  const round = props.round
  if (!round) return []
  const progressById = new Map(props.progress.map((p) => [p.horseId, p]))
  return round.horseIds.flatMap((id, i) => {
    const horse = horseById.value.get(id)
    if (!horse) return []
    const runner = progressById.get(id)
    return [
      {
        number: i + 1,
        horse,
        fraction: runner ? toFraction(runner.covered, round.distance) : 0,
        finished: runner?.finishTime != null,
      },
    ]
  })
})
</script>

<template>
  <section class="race-track" aria-label="Race track">
    <HorseIconSymbol />
    <div class="track" :class="{ 'is-running': running }">
      <ol v-if="lanes.length > 0" class="lanes">
        <RaceLane
          v-for="lane in lanes"
          :key="lane.horse.id"
          :lane="lane.number"
          :horse="lane.horse"
          :fraction="lane.fraction"
          :finished="lane.finished"
        />
      </ol>
      <div v-else class="track-empty" />
      <div class="finish-line" aria-hidden="true"><span>Finish</span></div>
    </div>
    <h2 class="track-label">
      {{ label }}
    </h2>
  </section>
</template>

<style scoped>
.race-track {
  --lane-number-width: 2rem;
  --lane-height: 2.75rem;
  --horse-width: 3.5rem;
  --finish-gap: 1.5rem;

  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.track {
  position: relative;
  overflow: hidden;
  border: 2px solid var(--color-header-bg);
  border-radius: var(--radius);
  background: var(--color-track);
}

.lanes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.track-empty {
  min-height: calc(var(--lane-height) * 4);
}

.finish-line {
  position: absolute;
  top: 0;
  bottom: 0;
  right: calc(var(--finish-gap) - 4px);
  width: 4px;
  background: repeating-linear-gradient(to bottom, #fff 0 6px, var(--color-finish) 6px 12px);
}

.finish-line span {
  position: absolute;
  top: 50%;
  left: 0.75rem;
  transform: translate(-50%, -50%) rotate(90deg);
  color: var(--color-header-text);
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  white-space: nowrap;
}

.track-label {
  margin: 0;
  font-size: 1rem;
  text-align: center;
  color: var(--color-accent);
}

@media (max-width: 480px) {
  .race-track {
    --lane-height: 2.25rem;
    --horse-width: 2.75rem;
  }
}
</style>
