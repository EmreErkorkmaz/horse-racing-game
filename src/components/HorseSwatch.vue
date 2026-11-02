<script setup lang="ts">
/**
 * Color dot that carries the horse number, so a horse can be told apart
 * without relying on color alone. Decorative: the surrounding row names the horse.
 */
import type { Horse } from '@/domain/types'

defineProps<{
  /** Horse whose color and number are shown. */
  horse: Horse
}>()
</script>

<template>
  <span class="swatch" aria-hidden="true" :style="{ backgroundColor: horse.color.hex }">{{
    horse.id
  }}</span>
</template>

<style scoped>
.swatch {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px var(--color-horse-outline);
  font-size: 0.6875rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  /* A white number with a dark halo stays readable on light and dark fills. */
  color: #fff;
  text-shadow:
    0 0 2px #000,
    0 0 2px #000;
}
</style>
