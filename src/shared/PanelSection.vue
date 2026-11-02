<script setup lang="ts">
/**
 * Titled side panel shared by the Horse List, Program and Results panels.
 *
 * The section is labelled by its heading, so assistive technology lists it
 * as a named region. Only the body scrolls; the title stays in place.
 */
import { useId } from 'vue'

defineProps<{
  /** Visible heading of the panel. */
  title: string
  /** The panel has nothing to list; the empty message replaces the content. */
  isEmpty: boolean
  /** Hint shown while the panel is empty. */
  emptyMessage: string
}>()

defineSlots<{
  /** Panel content, placed in the scrollable body while the panel is not empty. */
  default(): unknown
}>()

const headingId = useId()
</script>

<template>
  <section class="panel" :aria-labelledby="headingId">
    <h2 :id="headingId" class="panel-title">{{ title }}</h2>
    <div class="panel-body">
      <p v-if="isEmpty" class="empty">{{ emptyMessage }}</p>
      <slot v-else />
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

/* Sticky, so the title stays visible when an outer container scrolls the whole panel. */
.panel-title {
  position: sticky;
  top: 0;
  z-index: 1;
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  border-radius: var(--radius) var(--radius) 0 0;
  background: var(--color-surface);
  font-size: 1rem;
}

.panel-body {
  min-height: 0;
  overflow: auto;
}

.empty {
  /* The hint wraps to the panel instead of widening a content-sized column. */
  contain: inline-size;
  margin: 0;
  padding: 0.75rem;
  color: var(--color-muted);
}
</style>
