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
import { useRaceLoop } from '@/features/track/useRaceLoop'
import { GAME_CONFIG } from '@/config/game'
import { randomSeed, resolveUrlSeed } from '@/shared/urlSeed'
import AppHeader from '@/features/header/AppHeader.vue'
import GameLayout from '@/shared/GameLayout.vue'
import { usePanelTab } from '@/shared/usePanelTab'
import HorseList from '@/features/stable/HorseList.vue'
import ProgramPanel from '@/features/program/ProgramPanel.vue'
import RaceTrack from '@/features/track/RaceTrack.vue'
import ResultsPanel from '@/features/results/ResultsPanel.vue'
import RoundResultModal from '@/features/results/RoundResultModal.vue'

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
  isRaceRunning,
  isAwaitingRoundChoice,
  isProgramFinished,
} = storeToRefs(store)

const { seed, url } = resolveUrlSeed(new URL(window.location.href), randomSeed)
window.history.replaceState(window.history.state, '', url)
store.init(seed)

useRaceLoop(isRaceRunning, store.tick, { maxFrameMs: GAME_CONFIG.race.maxFrameMs })

const activePanel = usePanelTab(
  () => program.value.length,
  () => results.value.length,
)
</script>

<template>
  <GameLayout v-model:active-panel="activePanel">
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
      <RaceTrack
        :round="currentRound"
        :horses="horses"
        :progress="progress"
        :running="isRaceRunning"
        :speed="speed"
        :program-finished="isProgramFinished"
      />
    </template>
    <template #stable>
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
    :open="isAwaitingRoundChoice"
    :rounds="program"
    :results="results"
    :horses="horses"
    :is-last-round="isLastRound"
    @next="store.nextRound"
    @finish="store.finish"
  />
</template>
