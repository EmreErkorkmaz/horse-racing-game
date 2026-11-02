<script setup lang="ts">
/**
 * Page grid of the game, filled through named slots:
 * `header`, `stable`, `track`, `program` and `results`.
 *
 * Wide screens (1440px and up): horse list | track | program | results.
 * Medium screens (768px and up): the track spans the first row, the three
 * panels share the second. Below 1440px four columns would leave the Program
 * and Results tables too narrow for a horse name on one line.
 * Narrow screens (below 768px): one column; the track stays on top and the
 * horse list, program and results sit behind tabs, one panel at a time. The
 * breakpoint lives only in the CSS: the inactive panels stay mounted and are
 * hidden there, so their scroll positions survive a tab switch.
 *
 * Program and Results sit in one scroll container, so their rounds stay side
 * by side while scrolling. On narrow screens the page stays one screen tall:
 * the track and the tabs keep their height and the active panel scrolls in
 * the space left.
 *
 * The tab panel roles stay on wider screens, where the tab list is hidden;
 * applying them only on phones would need script, so this is accepted.
 *
 * The track comes first in DOM order so keyboard and screen reader users
 * reach the race before the long tables; the grid places it visually.
 */
import { useId } from 'vue'
import PanelTabs, { type PanelTab } from './PanelTabs.vue'
import { PANELS, type PanelId } from './usePanelTab'

const props = defineProps<{
  /** Panel shown on narrow screens. */
  activePanel: PanelId
}>()

const emit = defineEmits<{
  /** The panel the player picked from the tabs. */
  'update:activePanel': [id: PanelId]
}>()

defineSlots<{
  header(): unknown
  stable(): unknown
  track(): unknown
  program(): unknown
  results(): unknown
}>()

const baseId = useId()
const tabs: PanelTab[] = PANELS.map(({ id, label }) => ({
  id,
  label,
  tabId: `${baseId}-tab-${id}`,
  panelId: `${baseId}-panel-${id}`,
}))
const tabOf = Object.fromEntries(tabs.map((tab) => [tab.id, tab])) as Record<PanelId, PanelTab>

/** Attributes that make a slot wrapper the tab panel of `id`. */
function panelAttrs(id: PanelId) {
  return {
    id: tabOf[id].panelId,
    role: 'tabpanel',
    'aria-labelledby': tabOf[id].tabId,
    'data-active': String(id === props.activePanel),
  }
}
</script>

<template>
  <div class="layout">
    <div class="area-header"><slot name="header" /></div>
    <main class="main">
      <div class="area-track"><slot name="track" /></div>
      <PanelTabs
        class="area-tabs"
        :tabs="tabs"
        :active="activePanel"
        @update:active="emit('update:activePanel', $event)"
      />
      <div class="area-stable" v-bind="panelAttrs('stable')"><slot name="stable" /></div>
      <div class="area-rounds" data-test="rounds-scroll">
        <div class="area-program" v-bind="panelAttrs('program')"><slot name="program" /></div>
        <div class="area-results" v-bind="panelAttrs('results')"><slot name="results" /></div>
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
    'tabs'
    'rounds'
    'stable';
}

.area-tabs {
  grid-area: tabs;
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

/*
 * Phones: one screen tall. Only the panel of the selected tab is shown, and it
 * fills the space under the track and the tabs, scrolling inside itself.
 */
@media (max-width: 767px) {
  .layout {
    height: 100vh;
    height: 100dvh;
  }

  .main {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 0.75rem;
  }

  .area-stable,
  .area-rounds,
  .area-program,
  .area-results {
    flex: 1;
    min-height: 0;
    max-height: none;
  }

  .area-rounds {
    display: flex;
    flex-direction: column;
    /* The wider layouts align the rounds to the top; here the active panel spans the full width. */
    align-items: stretch;
  }

  [data-active='false'],
  .area-rounds:not(:has(> [data-active='true'])) {
    display: none;
  }
}

@media (min-width: 768px) {
  .area-tabs {
    display: none;
  }

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
    /*
     * The horse list, program and results columns never get narrower than
     * their tables, so no column is hidden and no name wraps whatever font the
     * system provides; the track takes the remaining width.
     */
    grid-template-columns:
      minmax(max-content, 1.2fr) minmax(0, 2.4fr) minmax(max-content, 1fr)
      minmax(max-content, 1fr);
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
