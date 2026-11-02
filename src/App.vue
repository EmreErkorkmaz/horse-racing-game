<script setup lang="ts">
/**
 * Application container: the only component that reads the game store.
 *
 * It passes store state down as props, maps component events to store
 * actions and drives the race clock with the animation frame loop. The live
 * `progress` is read only inside the `#track` slot, so a frame re-renders the
 * track and not the whole page.
 */
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/game'
import { useRaceLoop } from '@/composables/useRaceLoop'
import { resolveUrlSeed } from '@/composables/urlSeed'
import AppHeader from '@/components/AppHeader.vue'
import GameLayout from '@/components/GameLayout.vue'
import HorseList from '@/components/HorseList.vue'
import ProgramPanel from '@/components/ProgramPanel.vue'
import RaceTrack from '@/components/RaceTrack.vue'
import ResultsPanel from '@/components/ResultsPanel.vue'
import RoundResultModal from '@/components/RoundResultModal.vue'

const store = useGameStore()
const {
  status,
  speed,
  horses,
  horseCount,
  program,
  results,
  currentRound,
  currentRoundIndex,
  progress,
  isLastRound,
  isRunning,
  awaitsRoundChoice,
} = storeToRefs(store)

const { seed, url } = resolveUrlSeed(
  new URL(window.location.href),
  () => crypto.getRandomValues(new Uint32Array(1))[0] ?? 0,
)
window.history.replaceState(window.history.state, '', url)
store.init(seed)

useRaceLoop(isRunning, store.tick)
</script>

<template>
  <GameLayout>
    <template #header>
      <AppHeader
        :status="status"
        :horse-count="horseCount"
        :speed="speed"
        @update:horse-count="store.setHorseCount"
        @update:speed="store.setSpeed"
        @generate="store.generate"
        @toggle="store.toggle"
      />
    </template>
    <template #track>
      <RaceTrack :round="currentRound" :horses="horses" :progress="progress" :running="isRunning" />
    </template>
    <template #horses>
      <HorseList :horses="horses" />
    </template>
    <template #program>
      <ProgramPanel :rounds="program" :horses="horses" :current-round-index="currentRoundIndex" />
    </template>
    <template #results>
      <ResultsPanel :rounds="program" :results="results" :horses="horses" />
    </template>
  </GameLayout>

  <RoundResultModal
    :open="awaitsRoundChoice"
    :rounds="program"
    :results="results"
    :horses="horses"
    :is-last-round="isLastRound"
    @next="store.nextRound"
    @finish="store.finish"
  />
</template>
