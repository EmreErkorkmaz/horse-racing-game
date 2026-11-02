<script setup lang="ts">
/**
 * Page grid of the game, filled through named slots:
 * `header`, `stable`, `track`, `program` and `results`.
 *
 * Phones (below 768px, the base styles): one column; the track stays on top
 * and the horse list, program and results sit behind tabs, one panel at a
 * time. The breakpoint lives only in the CSS: the inactive panels stay mounted
 * and are hidden there, so their scroll positions survive a tab switch.
 * Tablets (768px to 1023px): the track, then program | results, then the horse
 * list.
 * Medium screens (1024px and up): the track on top, horse list | program |
 * results below.
 * Wide screens (1440px and up): horse list | track | program | results.
 * Four columns need 1440px; below that the program and results tables would
 * be too narrow for a horse name on one line.
 *
 * The horse list comes before the rounds in DOM order, as on medium and wide
 * screens and in the phone tabs; only the tablet grid shows it below them.
 *
 * Program and Results sit in one scroll container, so their rounds stay side
 * by side while scrolling. On phones the page scrolls past the header and the
 * track, the tabs stick to the top and the active panel fills the rest of the
 * screen, scrolling inside itself.
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
/*
 * Base: phones. Only the panel of the selected tab is shown. The page scrolls
 * past the header and the track; the tabs then stick to the top and the panel
 * is capped at the rest of the screen, scrolling inside itself. A fixed
 * one-screen page left only a few rows once mobile browser bars took their
 * share of the height.
 */
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
}

.main {
  /* Tab bar height; the panel below it gets the rest of the screen. */
  --tabs-height: 2.25rem;
  /* Gap between the areas and padding around them. */
  --space: 0.75rem;

  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space);
  padding: var(--space);
}

.area-track {
  min-width: 0;
}

.area-tabs {
  position: sticky;
  top: 0;
  z-index: 1;
  min-height: var(--tabs-height);
}

.area-stable,
.area-rounds {
  /* Screen height minus the sticky tabs, the gap below them and the bottom padding. */
  max-height: calc(100vh - var(--tabs-height) - 2 * var(--space));
  max-height: calc(100dvh - var(--tabs-height) - 2 * var(--space));
}

.area-stable,
.area-rounds,
.area-program,
.area-results {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.area-program,
.area-results {
  flex: 1 1 auto;
}

/* Each panel fills its area. */
.area-stable > :deep(*),
.area-program > :deep(*),
.area-results > :deep(*) {
  flex: 1 1 auto;
}

.main [data-active='false'],
/* The Horses tab is active: hide the then empty rounds wrapper too. */
.area-rounds:not(:has(> [data-active='true'])) {
  display: none;
}

@media (min-width: 768px) {
  .area-tabs {
    display: none;
  }

  .main {
    display: grid;
    gap: 1rem;
    padding: 1rem;
    /*
     * Up to 1023px the program and results share the row and the horse list
     * goes below them: in three columns a results table with times does not
     * fit and its names would wrap, breaking the round-by-round alignment.
     */
    grid-template-columns: repeat(2, minmax(0, 1fr));
    grid-template-areas:
      'track track'
      'program results'
      'stable stable';
  }

  /* Every panel shows again, whichever tab is selected. */
  .main [data-active='false'] {
    display: flex;
  }

  .area-track {
    grid-area: track;
  }

  .area-stable {
    grid-area: stable;
    max-height: 70vh;
  }

  /*
   * One scroller for both panels, so round N of the program stays level with
   * round N of the results. It spans the program and results columns of the
   * page grid and reuses them through subgrid, so each panel keeps exactly the
   * width it would have on its own. Each panel is as tall as its content, so a
   * short Results panel does not stretch to the Program.
   *
   * `.main >` raises the specificity to (0,2,0), so this beats the phone hide
   * rule above; keep it on every wider-screen `.area-rounds` rule.
   */
  .main > .area-rounds {
    display: grid;
    grid-row: program;
    grid-column: program-start / results-end;
    grid-template-columns: subgrid;
    gap: 1rem;
    align-items: start;
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

@media (min-width: 1024px) {
  .main {
    /* As on wide screens, no panel gets narrower than its table, whatever the font. */
    grid-template-columns: repeat(3, minmax(max-content, 1fr));
    grid-template-areas:
      'track track track'
      'stable program results';
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
  .main > .area-rounds {
    max-height: 100%;
  }
}
</style>
