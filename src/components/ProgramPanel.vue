<script setup lang="ts">
/**
 * Panel listing every round of the program with its runners in lane order.
 * The round that is on the track is highlighted.
 */
import { computed, toRef } from 'vue'
import type { Horse, Round } from '@/domain/types'
import type { RoundTableEntry } from './types'
import { useHorseLookup } from './useHorseLookup'
import PanelSection from './PanelSection.vue'
import RoundTable from './RoundTable.vue'

const props = defineProps<{
  /** Rounds of the program, in race order. */
  rounds: Round[]
  /** Stable used to resolve horse ids. */
  horses: Horse[]
  /** Zero-based index of the round on the track, or null when none is active. */
  currentRoundIndex: number | null
}>()

const horseById = useHorseLookup(toRef(props, 'horses'))

/** Rows per round; position equals the lane number (1-based). */
const tables = computed(() =>
  props.rounds.map((round) => {
    const entries: RoundTableEntry[] = []
    for (const id of round.horseIds) {
      const horse = horseById.value.get(id)
      if (horse) entries.push({ position: entries.length + 1, horse })
    }
    return { round, entries }
  }),
)
</script>

<template>
  <PanelSection title="Program">
    <template v-if="tables.length > 0">
      <RoundTable
        v-for="table in tables"
        :key="table.round.index"
        :round="table.round"
        :entries="table.entries"
        :current="table.round.index === currentRoundIndex"
      />
    </template>
    <p v-else class="empty">Generate a program to see the rounds.</p>
  </PanelSection>
</template>
