<script setup lang="ts">
/**
 * Table for a single round: a `Round N - XXXXm` caption followed by
 * Position / Name rows, optionally with each finishing time. Shared by the Program (lane order) and Results
 * (finishing order) panels.
 */
import type { Round } from '@/domain/types'
import type { RoundTableEntry } from '@/composables/types'
import { formatRaceTime, roundLabel } from './format'
import HorseSwatch from './HorseSwatch.vue'

withDefaults(
  defineProps<{
    /** Round described by the table. */
    round: Round
    /** Rows in display order. */
    entries: RoundTableEntry[]
    /** Marks the round that is on the track. */
    current?: boolean
    /** Adds a Time column with each entry's finishing time. */
    showTime?: boolean
  }>(),
  { current: false, showTime: false },
)
</script>

<template>
  <table
    class="round-table"
    :class="{ 'is-current': current }"
    :aria-current="current ? 'step' : undefined"
  >
    <caption>
      {{
        roundLabel(round)
      }}
    </caption>
    <thead>
      <tr>
        <th scope="col" class="position">Position</th>
        <th scope="col">Name</th>
        <th v-if="showTime" scope="col" class="time">Time</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="entry in entries" :key="entry.horse.id">
        <td class="position">{{ entry.position }}</td>
        <td>
          <span class="name"><HorseSwatch :horse="entry.horse" />{{ entry.horse.name }}</span>
        </td>
        <td v-if="showTime" class="time">
          {{ entry.finishTime == null ? '' : formatRaceTime(entry.finishTime) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.round-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

caption {
  padding: 0.375rem 0.75rem;
  background: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
  font-weight: 700;
  text-align: left;
}

.is-current caption {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent);
}

.is-current tbody {
  background: var(--color-highlight);
}

th,
td {
  padding: 0.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

th {
  font-weight: 600;
  color: var(--color-muted);
}

.time {
  text-align: right;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.position {
  width: 4.5rem;
  font-variant-numeric: tabular-nums;
}

.name {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
</style>
