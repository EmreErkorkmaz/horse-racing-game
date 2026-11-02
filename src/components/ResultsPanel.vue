<script setup lang="ts">
/**
 * Panel listing the result of every finished round in finishing order.
 *
 * A polite live region announces each new result in one sentence
 * (round and winner) instead of reading the whole table aloud.
 */
import { computed, toRef, useId } from 'vue'
import type { Horse, Round, RoundResult } from '@/domain/types'
import type { RoundTableEntry } from './types'
import { roundLabel } from './format'
import { useHorseLookup } from './useHorseLookup'
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
const horseById = useHorseLookup(toRef(props, 'horses'))

const tables = computed(() => {
  const roundByIndex = new Map(props.rounds.map((round) => [round.index, round]))
  return props.results.flatMap((result) => {
    const round = roundByIndex.get(result.roundIndex)
    if (!round) return []
    const entries: RoundTableEntry[] = [...result.placements]
      .sort((a, b) => a.position - b.position)
      .flatMap(({ position, horseId }) => {
        const horse = horseById.value.get(horseId)
        return horse ? [{ position, horse }] : []
      })
    return [{ round, entries }]
  })
})

const announcement = computed(() => {
  const latest = tables.value[tables.value.length - 1]
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
