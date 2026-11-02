/**
 * Component helper that indexes horses by id for O(1) lookups in templates.
 */
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import type { Horse } from '@/domain/types'

/** Returns a computed `Map<id, Horse>` that rebuilds only when the horse array changes. */
export function useHorseLookup(horses: MaybeRefOrGetter<readonly Horse[]>) {
  return computed(() => new Map(toValue(horses).map((horse) => [horse.id, horse])))
}
