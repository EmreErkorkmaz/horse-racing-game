<script setup lang="ts">
/**
 * Panel listing the result of every finished round in finishing order.
 *
 * A polite live region announces each new result in one sentence
 * (round and winner) instead of reading the whole table aloud.
 */
import { computed, useId } from 'vue'
import type { Horse, Round, RoundResult } from '@/domain/types'
import { roundLabel } from './format'
import { useResultTables } from './useResultTables'
import RoundTable from './RoundTable.vue'

const props = defineProps<{
  /** Rounds of the program, used for the distance in each caption. */
  rounds: Round[]
  /** Results of the finished rounds, in the order they finished. */
  results: RoundResult[]
  /** Stable used to resolve horse ids. */
  horses: Horse[]
}>()

const headingId = useId()
const tables = useResultTables(
  () => props.rounds,
  () => props.results,
  () => props.horses,
)

const announcement = computed(() => {
  const latest = tables.value.at(-1)
  const winner = latest?.entries[0]
  if (!latest || !winner) return ''
  return `${roundLabel(latest.round)} finished. Winner: ${winner.horse.name}.`
})
</script>

<template>
  <section class="panel" :aria-labelledby="headingId">
    <h2 :id="headingId" class="panel-title">Results</h2>
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
    <div class="panel-body">
      <template v-if="tables.length > 0">
        <RoundTable
          v-for="table in tables"
          :key="table.round.index"
          :round="table.round"
          :entries="table.entries"
        />
      </template>
      <p v-else class="empty">Results appear here as each round finishes.</p>
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
  font-size: 1rem;
}

.panel-body {
  min-height: 0;
  overflow: auto;
}

.empty {
  margin: 0;
  padding: 0.75rem;
  border-top: 1px solid var(--color-border);
  color: var(--color-muted);
}
</style>
