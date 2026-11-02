<script setup lang="ts">
/**
 * Page grid of the game, filled through named slots:
 * `header`, `stable`, `track`, `program` and `results`.
 *
 * Wide screens (1440px and up): horse list | track | program | results.
 * Medium screens (768px and up): the track spans the first row, the three
 * panels share the second. Below 1440px four columns would leave the Program
 * and Results tables too narrow for a horse name on one line.
 * Narrow screens: one column (track, results, program, horse list).
 *
 * Program and Results sit in one scroll container, so their rounds stay side
 * by side while scrolling. On narrow screens nothing scrolls inside them and
 * the page scrolls instead.
 *
 * The track comes first in DOM order so keyboard and screen reader users
 * reach the race before the long tables; the grid places it visually.
 */
defineSlots<{
  header(): unknown
  stable(): unknown
  track(): unknown
  program(): unknown
  results(): unknown
}>()
</script>

<template>
  <div class="layout">
    <div class="area-header"><slot name="header" /></div>
    <main class="main">
      <div class="area-track"><slot name="track" /></div>
      <div class="area-stable"><slot name="stable" /></div>
      <div class="area-rounds" data-test="rounds-scroll">
        <div class="area-program"><slot name="program" /></div>
        <div class="area-results"><slot name="results" /></div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.main {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'track'
    'rounds'
    'stable';
}

.area-track {
  grid-area: track;
  min-width: 0;
}

.area-stable {
  grid-area: stable;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  max-height: 70vh;
}

.area-stable > :deep(*) {
  flex: 1 1 auto;
}

/* Narrow screens: results above the program, and the page does the scrolling. */
.area-rounds {
  grid-area: rounds;
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    'results'
    'program';
  /* Each panel is as tall as its content; a short Results panel does not stretch to the Program. */
  align-items: start;
  min-width: 0;
}

.area-program,
.area-results {
  display: flex;
  min-width: 0;
}

.area-program {
  grid-area: program;
}

.area-results {
  grid-area: results;
}

/* Each panel fills its column's width. */
.area-program > :deep(*),
.area-results > :deep(*) {
  flex: 1 1 auto;
}

@media (min-width: 768px) {
  .main {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-areas:
      'track track track'
      'stable program results';
  }

  /*
   * One scroller for both panels, so round N of the program stays level with
   * round N of the results. It spans the program and results columns of the
   * page grid and reuses them through subgrid, so each panel keeps exactly the
   * width it would have on its own.
   */
  .area-rounds {
    grid-row: program;
    grid-column: program-start / results-end;
    grid-template-columns: subgrid;
    grid-template-areas: none;
    max-height: 70vh;
    overflow: auto;
    overscroll-behavior: contain;
  }

  .area-program {
    grid-area: auto / program;
  }

  .area-results {
    grid-area: auto / results;
  }
}

/* Wide screens: all four columns fit the viewport; the horse list and the rounds scroll on their own. */
@media (min-width: 1440px) {
  .layout {
    height: 100vh;
    height: 100dvh;
  }

  .main {
    flex: 1;
    min-height: 0;
    /* The horse list column never gets narrower than its table, so no column is hidden. */
    grid-template-columns:
      minmax(max-content, 1.2fr) minmax(0, 2.4fr) minmax(12rem, 1fr)
      minmax(12rem, 1fr);
    grid-template-rows: minmax(0, 1fr);
    grid-template-areas: 'stable track program results';
    align-items: start;
  }

  .area-stable,
  .area-rounds {
    max-height: 100%;
  }
}
</style>
