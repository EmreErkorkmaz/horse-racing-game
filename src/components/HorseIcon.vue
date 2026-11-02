<script setup lang="ts">
/**
 * One horse drawn from the shared HorseIconSymbol sprite.
 * The symbol paints with `currentColor`, so the CSS `color` sets the coat.
 */
import { HORSE_SYMBOL_ID } from './HorseIconSymbol.vue'

defineProps<{
  /** Coat color, any CSS color (usually the horse's hex color). */
  color: string
}>()
</script>

<template>
  <svg
    class="horse-icon"
    viewBox="0 0 64 40"
    aria-hidden="true"
    focusable="false"
    :style="{ color }"
  >
    <use :href="`#${HORSE_SYMBOL_ID}`" />
  </svg>
</template>

<style scoped>
.horse-icon {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
