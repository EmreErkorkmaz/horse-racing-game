<script setup lang="ts">
/**
 * Panel listing the result of every finished round in finishing order.
 * New results are announced by the round result modal, not by this panel,
 * so assistive technology reads each result once.
 */
import type { Horse, Round, RoundResult } from '@/domain/types'
import { useResultTables } from './useResultTables'
import PanelSection from './PanelSection.vue'
import RoundTable from './RoundTable.vue'

const props = defineProps<{
  /** Rounds of the program, used for the distance in each caption. */
  rounds: Round[]
  /** Results of the finished rounds, in the order they finished. */
  results: RoundResult[]
  /** Stable used to resolve horse ids. */
  horses: Horse[]
}>()

const tables = useResultTables(
  () => props.rounds,
  () => props.results,
  () => props.horses,
)
</script>

<template>
  <PanelSection
    title="Results"
    :is-empty="tables.length === 0"
    empty-message="Results appear here as each round finishes."
  >
    <RoundTable
      v-for="table in tables"
      :key="table.round.index"
      :round="table.round"
      :entries="table.entries"
    />
  </PanelSection>
</template>
