import type { Horse, LaneProgress, Round, RoundResult } from '@/domain/types'

/** Small stable used across component specs. */
export const horses: Horse[] = [
  { id: 1, name: 'Ada Lovelace', color: { name: 'Red', hex: '#e53935' }, condition: 81 },
  { id: 2, name: 'Grace Hopper', color: { name: 'Blue', hex: '#1e88e5' }, condition: 64 },
  { id: 3, name: 'Alan Turing', color: { name: 'Green', hex: '#43a047' }, condition: 47 },
  { id: 4, name: 'Linus Torvalds', color: { name: 'Yellow', hex: '#fdd835' }, condition: 99 },
]

/** Two rounds; lane order differs from horse id order on purpose. */
export const rounds: Round[] = [
  { index: 0, distance: 1200, horseIds: [3, 1, 4] },
  { index: 1, distance: 1400, horseIds: [2, 4, 1, 3] },
]

/** Result of the first round only. */
export const results: RoundResult[] = [
  {
    roundIndex: 0,
    placements: [
      { position: 1, horseId: 4 },
      { position: 2, horseId: 3 },
      { position: 3, horseId: 1 },
    ],
  },
]

/** Mid-race progress of the first round (1200 m). */
export const progress: LaneProgress[] = [
  { horseId: 3, covered: 600, finishTime: null },
  { horseId: 1, covered: 300, finishTime: null },
  { horseId: 4, covered: 1200, finishTime: 71250 },
]
