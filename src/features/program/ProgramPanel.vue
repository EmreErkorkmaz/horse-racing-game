<script setup lang="ts">
/**
 * Panel listing every round of the program with its runners in lane order.
 * The round that is on the track is highlighted.
 */
import type { Horse, Round } from '@/domain/types'
import { useProgramTables } from './useProgramTables'
import PanelSection from '@/shared/PanelSection.vue'
import RoundTable from '@/shared/RoundTable.vue'

const props = defineProps<{
  /** Rounds of the program, in race order. */
  rounds: Round[]
  /** Stable used to resolve horse ids. */
  horses: Horse[]
  /** Zero-based index of the round on the track, or null when none is active. */
  currentRoundIndex: number | null
}>()

/** Rows per round; position equals the lane number (1-based). */
const tables = useProgramTables(
  () => props.rounds,
  () => props.horses,
)
</script>

<template>
  <PanelSection
    title="Program"
    :is-empty="tables.length === 0"
    empty-message="Generate a program to see the rounds."
  >
    <RoundTable
      v-for="table in tables"
      :key="table.round.index"
      :round="table.round"
      :entries="table.entries"
      :current="table.round.index === currentRoundIndex"
    />
  </PanelSection>
</template>
