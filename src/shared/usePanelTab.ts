/**
 * Which side panel is shown on phones, where the panels sit behind tabs.
 */
import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

/** Key of a side panel; it matches the panel's slot and grid area. */
export type PanelId = 'stable' | 'program' | 'results'

/** The panels in tab order, with their visible tab labels. */
export const PANELS: readonly { id: PanelId; label: string }[] = [
  { id: 'stable', label: 'Horses' },
  { id: 'program', label: 'Program' },
  { id: 'results', label: 'Results' },
]

/**
 * The panel that matches the game's progress: the results once a round has
 * finished, otherwise the program once one is drawn, otherwise the stable.
 */
export function defaultPanel(programCount: number, resultCount: number): PanelId {
  if (resultCount > 0) return 'results'
  if (programCount > 0) return 'program'
  return 'stable'
}

/**
 * The active panel. It follows `defaultPanel` whenever a program is drawn or
 * a round finishes (the inputs are read again, even if a count stays the
 * same); a panel the player picks stays until that happens.
 */
export function usePanelTab(
  programCount: MaybeRefOrGetter<number>,
  resultCount: MaybeRefOrGetter<number>,
): Ref<PanelId> {
  const active = ref<PanelId>(defaultPanel(toValue(programCount), toValue(resultCount)))
  watch(
    () => [toValue(programCount), toValue(resultCount)] as const,
    ([programs, results]) => {
      active.value = defaultPanel(programs, results)
    },
  )
  return active
}
