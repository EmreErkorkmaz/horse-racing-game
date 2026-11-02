<script setup lang="ts">
/**
 * Tab list that switches the side panels on phones.
 *
 * Follows the ARIA tabs pattern: only the selected tab is in the Tab order
 * (roving tabindex), and the arrow keys move to the previous or next tab,
 * wrapping at both ends. The parent owns the panels and their ids.
 */
import { nextTick } from 'vue'
import type { PanelId } from './usePanelTab'

/** A tab and the ids that link it to its panel. */
export interface PanelTab {
  id: PanelId
  label: string
  tabId: string
  panelId: string
}

const props = defineProps<{
  /** Tabs in display order. */
  tabs: readonly PanelTab[]
  /** The selected panel. */
  active: PanelId
}>()

const emit = defineEmits<{
  /** The panel the player asked for. */
  'update:active': [id: PanelId]
}>()

/** Selects the tab `step` places away from the current one and moves focus to it. */
async function move(step: number): Promise<void> {
  const index = props.tabs.findIndex((tab) => tab.id === props.active)
  const next = (index + step + props.tabs.length) % props.tabs.length
  const tab = props.tabs[next]
  if (!tab) return
  emit('update:active', tab.id)
  await nextTick()
  document.getElementById(tab.tabId)?.focus()
}
</script>

<template>
  <div class="panel-tabs" role="tablist" aria-label="Panels">
    <button
      v-for="tab in tabs"
      :id="tab.tabId"
      :key="tab.id"
      type="button"
      role="tab"
      class="tab"
      :aria-selected="tab.id === active"
      :aria-controls="tab.panelId"
      :tabindex="tab.id === active ? 0 : -1"
      @click="emit('update:active', tab.id)"
      @keydown.right.prevent="move(1)"
      @keydown.left.prevent="move(-1)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<style scoped>
.panel-tabs {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 0.5rem;
  border: 0;
  background: transparent;
  color: var(--color-text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.tab + .tab {
  border-left: 1px solid var(--color-border);
}

.tab[aria-selected='true'] {
  background: var(--color-accent);
  color: var(--color-on-accent);
}
</style>
