<script setup lang="ts">
/**
 * Modal shown after every round: the full result of the round that just
 * finished, earlier rounds as collapsed sections titled with their winner,
 * and the choice between the next round and finishing the program.
 *
 * Built on the native `<dialog>` element opened with `showModal()`, so the
 * browser makes the rest of the page inert, keeps focus inside the dialog and
 * announces it to assistive technology. The dialog cannot be dismissed:
 * `closedby="none"` opts out of light dismiss, the `cancel` event of the
 * Escape key is prevented and there is no close button. It closes only when
 * the parent sets `open` to false in response to `next` or `finish`.
 *
 * Browsers may still close a modal dialog on their own (Chrome closes it on a
 * repeated Escape press without user activation; Safari ignores `closedby`).
 * The `close` event reopens the dialog while `open` is true, so the game can
 * never get stuck behind a hidden modal.
 */
import { computed, onMounted, useId, useTemplateRef, watch } from 'vue'
import type { Horse, Round, RoundResult } from '@/domain/types'
import { roundLabel } from './format'
import { useResultTables } from './useResultTables'
import HorseSwatch from './HorseSwatch.vue'
import RoundTable from './RoundTable.vue'

const props = defineProps<{
  /** Whether the dialog is shown. */
  open: boolean
  /** Rounds of the program, used for the distance in each title. */
  rounds: Round[]
  /** Results of the finished rounds; the last entry is the round that just ended. */
  results: RoundResult[]
  /** Stable used to resolve horse ids. */
  horses: Horse[]
  /** The round that just ended is the last one; only finishing is offered. */
  isLastRound: boolean
}>()

const emit = defineEmits<{
  /** Request to start the following round. */
  next: []
  /** Request to end the program. */
  finish: []
}>()

const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const titleId = useId()

const tables = useResultTables(
  () => props.rounds,
  () => props.results,
  () => props.horses,
)
const latest = computed(() => tables.value.at(-1) ?? null)
const earlier = computed(() => tables.value.slice(0, -1))
const winner = computed(() => latest.value?.entries[0]?.horse ?? null)

function sync(open: boolean): void {
  const element = dialog.value
  if (!element) return
  if (open && !element.open) element.showModal()
  else if (!open && element.open) element.close()
}

onMounted(() => sync(props.open))
// After the DOM update, so the content and its autofocus button exist when the dialog opens.
watch(() => props.open, sync, { flush: 'post' })

/** Reopens the dialog if it was closed by the browser rather than by the parent. */
function onClose(): void {
  sync(props.open)
}
</script>

<template>
  <dialog
    ref="dialog"
    class="modal"
    closedby="none"
    :aria-labelledby="titleId"
    @cancel.prevent
    @close="onClose"
  >
    <template v-if="latest">
      <header class="modal-header">
        <h2 :id="titleId" class="modal-title">{{ roundLabel(latest.round) }} finished</h2>
        <p v-if="winner" class="winner" data-test="winner">
          <HorseSwatch :horse="winner" />
          <span
            >Winner: <strong>{{ winner.name }}</strong></span
          >
        </p>
      </header>

      <div class="modal-body">
        <section data-test="latest-round">
          <RoundTable :round="latest.round" :entries="latest.entries" current />
        </section>

        <section v-if="earlier.length > 0" class="earlier">
          <h3 class="earlier-title">Earlier rounds</h3>
          <details v-for="table in earlier" :key="table.round.index" class="earlier-round">
            <summary>
              <span class="summary-round">{{ roundLabel(table.round) }}</span>
              <span v-if="table.entries[0]" class="summary-winner">
                <HorseSwatch :horse="table.entries[0].horse" />
                Winner: {{ table.entries[0].horse.name }}
              </span>
            </summary>
            <RoundTable :round="table.round" :entries="table.entries" />
          </details>
        </section>
      </div>

      <footer class="modal-actions">
        <button
          v-if="!isLastRound"
          type="button"
          class="button button-primary"
          data-test="next-round"
          autofocus
          @click="emit('next')"
        >
          Next round
        </button>
        <button
          type="button"
          class="button"
          :class="{ 'button-primary': isLastRound }"
          data-test="finish"
          :autofocus="isLastRound"
          @click="emit('finish')"
        >
          Finish
        </button>
      </footer>
    </template>
  </dialog>
</template>

<style scoped>
.modal {
  display: none;
  flex-direction: column;
  width: min(36rem, 100vw - 2rem);
  max-height: min(48rem, 100dvh - 2rem);
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1.5rem 3rem rgb(0 0 0 / 0.3);
}

.modal[open] {
  display: flex;
}

.modal::backdrop {
  background: rgb(0 0 0 / 0.55);
}

.modal-header {
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
}

.winner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0 0;
}

/* Only the body scrolls, so the title and the actions stay visible. */
.modal-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

.earlier-title {
  margin: 0;
  padding: 0.75rem 1.25rem 0.375rem;
  font-size: 0.875rem;
  color: var(--color-muted);
}

.earlier-round {
  border-top: 1px solid var(--color-border);
}

summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  cursor: pointer;
}

summary::marker {
  content: '';
}

summary::before {
  content: '▸';
  margin-right: 0.25rem;
  color: var(--color-muted);
}

details[open] > summary::before {
  content: '▾';
}

.summary-round {
  flex: 1;
  font-weight: 600;
}

.summary-winner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border);
}

@media (max-width: 30rem) {
  .modal-actions .button {
    flex: 1;
  }
}
</style>
