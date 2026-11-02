<script setup lang="ts">
/**
 * Panel listing the whole stable: number, name, condition and color.
 */
import { computed, useId } from 'vue'
import type { Horse } from '@/domain/types'
import HorseSwatch from './HorseSwatch.vue'

const props = defineProps<{
  /** Horses of the stable, in id order. */
  horses: Horse[]
}>()

const headingId = useId()

const title = computed(() =>
  props.horses.length > 0 ? `Horse List (1-${props.horses.length})` : 'Horse List',
)
</script>

<template>
  <section class="panel">
    <h2 :id="headingId" class="panel-title">{{ title }}</h2>
    <div class="panel-body">
      <table v-if="horses.length > 0" :aria-labelledby="headingId">
        <thead>
          <tr>
            <th scope="col" class="num">#</th>
            <th scope="col">Name</th>
            <th scope="col" class="num">Condition</th>
            <th scope="col">Color</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="horse in horses" :key="horse.id">
            <td class="num">{{ horse.id }}</td>
            <td>{{ horse.name }}</td>
            <td class="num">{{ horse.condition }}</td>
            <td>
              <span class="color"><HorseSwatch :horse="horse" />{{ horse.color.name }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else class="empty">No horses yet.</p>
    </div>
  </section>
</template>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.panel-title {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 1rem;
}

.panel-body {
  min-height: 0;
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

th,
td {
  padding: 0.3125rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

thead th {
  position: sticky;
  top: 0;
  background: var(--color-surface-alt);
  font-weight: 600;
}

.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.color {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.empty {
  margin: 0;
  padding: 0.75rem;
  color: var(--color-muted);
}
</style>
