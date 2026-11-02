<script setup lang="ts">
/**
 * A single lane of the race track with its runner.
 *
 * The runner moves with `transform: translateX(...)` only, so a frame
 * update touches one style property and stays on the compositor.
 * The runner box is as wide as the lane minus one horse, which makes
 * `translateX(100%)` place the horse's nose exactly on the finish line.
 * Each runner starts its gallop at its own phase and casts a ground shadow
 * that squashes as the horse lifts.
 */
import type { Horse } from '@/domain/types'
import { gallopPhase } from './gallop'
import HorseIcon from './HorseIcon.vue'

defineProps<{
  /** 1-based lane number. */
  lane: number
  /** Horse running in this lane. */
  horse: Horse
  /** Share of the distance covered, between 0 and 1. */
  fraction: number
  /** True once the horse has crossed the finish line. */
  finished: boolean
}>()
</script>

<template>
  <li class="lane" :aria-label="`Lane ${lane}: #${horse.id} ${horse.name}`">
    <span class="lane-number" aria-hidden="true">{{ lane }}</span>
    <div class="lane-track">
      <div
        class="runner"
        data-test="runner"
        :class="{ 'is-finished': finished }"
        :style="{
          transform: `translateX(${fraction * 100}%)`,
          '--gallop-phase': gallopPhase(horse.id),
        }"
      >
        <span class="horse">
          <span class="runner-shadow" data-test="runner-shadow" aria-hidden="true" />
          <HorseIcon :color="horse.color.hex" />
          <span class="runner-number" aria-hidden="true">{{ horse.id }}</span>
        </span>
      </div>
    </div>
  </li>
</template>

<style scoped>
.lane {
  display: grid;
  grid-template-columns: var(--lane-number-width) 1fr;
  min-height: var(--lane-height);
  border-bottom: 1px dashed var(--color-lane-line);
}

.lane:nth-child(even) {
  background: var(--color-track-alt);
}

.lane:last-child {
  border-bottom: 0;
}

.lane-number {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-header-bg);
  color: var(--color-header-text);
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.lane-track {
  position: relative;
  margin-right: var(--finish-gap);
}

.runner {
  /*
   * One stride at 1x lasts 280 ms and shortens with the playback speed set on
   * the track. Switching speed mid-race makes the bob jump phase once, which
   * is accepted to keep the animation free of script.
   */
  --stride-duration: calc(280ms / var(--speed, 1));

  position: absolute;
  inset: 0 auto 0 0;
  width: calc(100% - var(--horse-width));
  pointer-events: none;
  will-change: transform;
  /* Own stacking context, so the shadow's negative z-index stays inside the runner. */
  isolation: isolate;
}

.horse {
  position: relative;
  display: block;
  width: var(--horse-width);
  height: 100%;
  padding-block: 0.25rem;
}

.runner-number {
  position: absolute;
  top: 50%;
  left: 40%;
  transform: translate(-50%, -60%);
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1;
  color: var(--color-on-silk);
  text-shadow: var(--shadow-on-silk);
}

/* Ground shadow under the hooves; z-index -1 paints it behind the horse, within the runner. */
.runner-shadow {
  position: absolute;
  z-index: -1;
  left: 10%;
  right: 20%;
  bottom: 0.15rem;
  height: 0.3rem;
  border-radius: 50%;
  background: rgb(0 0 0 / 0.3);
}

/*
 * Gallop while the race clock runs: the horse bobs and its shadow squashes in
 * step, both starting at the runner's own phase. Transform and opacity only,
 * so it stays on the compositor.
 */
.is-running .runner:not(.is-finished) .horse-icon,
.is-running .runner:not(.is-finished) .runner-shadow {
  animation-duration: var(--stride-duration);
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-delay: calc(var(--gallop-phase) * var(--stride-duration) * -1);
}

.is-running .runner:not(.is-finished) .horse-icon {
  animation-name: gallop;
}

.is-running .runner:not(.is-finished) .runner-shadow {
  animation-name: gallop-shadow;
}

@keyframes gallop {
  from {
    transform: translateY(0) rotate(0deg);
  }
  to {
    transform: translateY(-8%) rotate(-3deg);
  }
}

@keyframes gallop-shadow {
  from {
    transform: scaleX(1);
    opacity: 1;
  }
  to {
    transform: scaleX(0.8);
    opacity: 0.65;
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-running .runner:not(.is-finished) .horse-icon,
  .is-running .runner:not(.is-finished) .runner-shadow {
    animation: none;
  }
}
</style>
