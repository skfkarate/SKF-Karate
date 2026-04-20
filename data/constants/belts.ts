/**
 * Belt Constants — single source of truth for all belt data.
 * Defines belt levels, visual colors (Tailwind classes), and hex values.
 */

/** Ordered list of all belts from lowest to highest */
export const BELTS = Object.freeze([
  { colour: 'white',         label: 'White Belt',            kyuOrDan: '9th Kyu',  order: 0 },
  { colour: 'yellow',        label: 'Yellow Belt',           kyuOrDan: '8th Kyu',  order: 1 },
  { colour: 'orange',        label: 'Orange Belt',           kyuOrDan: '7th Kyu',  order: 2 },
  { colour: 'green',         label: 'Green Belt',            kyuOrDan: '6th Kyu',  order: 3 },
  { colour: 'blue',          label: 'Blue Belt',             kyuOrDan: '5th Kyu',  order: 4 },
  { colour: 'brown',         label: 'Brown Belt',            kyuOrDan: '4th Kyu',  order: 5 },
  { colour: 'black-1st-dan', label: 'Black Belt — 1st Dan', kyuOrDan: '1st Dan',  order: 6 },
  { colour: 'black-2nd-dan', label: 'Black Belt — 2nd Dan', kyuOrDan: '2nd Dan',  order: 7 },
  { colour: 'black-3rd-dan', label: 'Black Belt — 3rd Dan', kyuOrDan: '3rd Dan',  order: 8 },
  { colour: 'black-4th-dan', label: 'Black Belt — 4th Dan', kyuOrDan: '4th Dan',  order: 9 },
  { colour: 'black-5th-dan', label: 'Black Belt — 5th Dan', kyuOrDan: '5th Dan',  order: 10 },
])

export type BeltColour = (typeof BELTS)[number]['colour']

/** Helper: find belt by colour string */
export function getBelt(colour: string) {
  return BELTS.find(b => b.colour === colour) || BELTS[0]
}

/** Helper: get the next belt */
export function getNextBelt(colour: string) {
  const current = getBelt(colour)
  return BELTS.find(b => b.order === current.order + 1) ?? null
}

/** Helper: get sort order */
export function getBeltOrder(colour: string) {
  return getBelt(colour)?.order ?? 0
}

/** Tailwind class mappings for belt colours */
export const BELT_COLOURS = Object.freeze({
  'white':         { bg: 'bg-gray-100',   text: 'text-gray-800',   border: 'border-gray-300' },
  'yellow':        { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-400' },
  'orange':        { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-400' },
  'green':         { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-500' },
  'blue':          { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-500' },
  'brown':         { bg: 'bg-amber-900',  text: 'text-amber-100',  border: 'border-amber-700' },
  'black-1st-dan': { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
  'black-2nd-dan': { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
  'black-3rd-dan': { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
  'black-4th-dan': { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
  'black-5th-dan': { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
} as const)

/** Hex color values for rendering belt visuals */
export const BELT_HEX_COLORS = Object.freeze({
  White: '#F5F5F5',
  Yellow: '#FFD700',
  Orange: '#FF8C00',
  Green: '#228B22',
  Blue: '#1E90FF',
  Purple: '#8B008B',
  Brown: '#8B4513',
  Black: '#1a1a1a',
} as Record<string, string>)
