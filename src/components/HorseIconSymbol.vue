<script lang="ts">
/** Element id of the shared horse `<symbol>`; HorseIcon references it with `<use>`. */
export const HORSE_SYMBOL_ID = 'horse-shape'
</script>

<script setup lang="ts">
/**
 * Hidden SVG sprite that defines the horse silhouette once per page.
 * Render it a single time (RaceTrack does); every HorseIcon reuses it,
 * so the path data is not repeated for each runner.
 */
</script>

<template>
  <svg class="sprite" aria-hidden="true" width="0" height="0">
    <symbol :id="HORSE_SYMBOL_ID" viewBox="0 0 64 40">
      <path
        d="M2 12 L12 15 Q17 12 24 13 L36 13 L42 6 L45 1 L47 5 L56 9 Q60 11 57 14 L50 13 L44 18
           L45 22 L53 29 L51 32 L42 25 L40 37 L37 37 L37 26 Q28 28 20 26 L13 32 L4 35 L4 32
           L11 28 L12 23 L5 22 Z"
        fill="currentColor"
        stroke="rgb(0 0 0 / 0.55)"
        stroke-width="1.25"
        stroke-linejoin="round"
      />
    </symbol>
  </svg>
</template>

<style scoped>
.sprite {
  position: absolute;
  overflow: hidden;
}
</style>
