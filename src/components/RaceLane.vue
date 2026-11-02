<script setup lang="ts">
/**
 * A single lane of the race track with its runner.
 *
 * The runner moves with `transform: translateX(...)` only, so a frame
 * update touches one style property and stays on the compositor.
 * The runner box is as wide as the lane minus one horse, which makes
 * `translateX(100%)` place the horse's nose exactly on the finish line.
 */
import type { Horse } from '@/domain/types'
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
        :style="{ transform: `translateX(${fraction * 100}%)` }"
      >
        <span class="horse">
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
  position: absolute;
  inset: 0 auto 0 0;
  width: calc(100% - var(--horse-width));
  pointer-events: none;
  will-change: transform;
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
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 2px #000;
}

/* Gallop bob while the race clock runs; transform-only, so it stays on the compositor. */
.is-running .runner:not(.is-finished) .horse-icon {
  animation: gallop 0.28s ease-in-out infinite alternate;
}

@keyframes gallop {
  from {
    transform: translateY(0) rotate(0deg);
  }
  to {
    transform: translateY(-8%) rotate(-3deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .is-running .runner:not(.is-finished) .horse-icon {
    animation: none;
  }
}
</style>
