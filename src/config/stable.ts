import type { HorseColor } from '@/domain/types'

/**
 * Content used to build the stable: horse names and silk colors.
 *
 * Both lists hold at least `GAME_CONFIG.maxHorseCount` unique entries, so
 * every horse of the largest stable gets its own name and color. Colors are
 * spread around the hue wheel and include light and dark tones, so
 * neighbouring lanes stay distinguishable.
 */

export const HORSE_NAMES: readonly string[] = [
  'Ada Lovelace',
  'Blue Comet',
  'Copper Crown',
  'Desert Wind',
  'Echo Valley',
  'Firefly',
  'Golden Hour',
  'Harbor Light',
  'Iron Duke',
  'Jade Arrow',
  'Kestrel',
  'Lucky Clover',
  'Midnight Run',
  'North Star',
  'Olive Branch',
  'Pepper Mint',
  'Quiet Storm',
  'Red Rocket',
  'Silver Lining',
  'Thunder Bay',
]

export const HORSE_COLORS: readonly HorseColor[] = [
  { name: 'Red', hex: '#e6194b' },
  { name: 'Green', hex: '#3cb44b' },
  { name: 'Yellow', hex: '#ffe119' },
  { name: 'Blue', hex: '#4363d8' },
  { name: 'Orange', hex: '#f58231' },
  { name: 'Purple', hex: '#911eb4' },
  { name: 'Cyan', hex: '#42d4f4' },
  { name: 'Magenta', hex: '#f032e6' },
  { name: 'Lime', hex: '#bfef45' },
  { name: 'Pink', hex: '#fabed4' },
  { name: 'Teal', hex: '#469990' },
  { name: 'Lavender', hex: '#dcbeff' },
  { name: 'Brown', hex: '#9a6324' },
  { name: 'Beige', hex: '#fffac8' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Mint', hex: '#aaffc3' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Apricot', hex: '#ffd8b1' },
  { name: 'Navy', hex: '#000075' },
  { name: 'Grey', hex: '#a9a9a9' },
]
