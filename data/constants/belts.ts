/**
 * Belt Constants — single source of truth for all belt data.
 * Defines belt levels, visual colors (Tailwind classes), and hex values.
 */

/** Ordered list of all belts from lowest to highest */
export const BELTS = Object.freeze([
  { colour: 'white',         label: 'White Belt',            kyuOrDan: '10th Kyu', order: 0 },
  { colour: 'yellow',        label: 'Yellow Belt',           kyuOrDan: '9th Kyu',  order: 1 },
  { colour: 'orange',        label: 'Orange Belt',           kyuOrDan: '8th Kyu',  order: 2 },
  { colour: 'green-ii',      label: 'Green II Belt',         kyuOrDan: '7th Kyu',  order: 3 },
  { colour: 'green-i',       label: 'Green I Belt',          kyuOrDan: '6th Kyu',  order: 4 },
  { colour: 'blue',          label: 'Blue Belt',             kyuOrDan: '5th Kyu',  order: 5 },
  { colour: 'purple',        label: 'Purple Belt',           kyuOrDan: '4th Kyu',  order: 6 },
  { colour: 'brown-iii',     label: 'Brown III Belt',        kyuOrDan: '3rd Kyu',  order: 7 },
  { colour: 'brown-ii',      label: 'Brown II Belt',         kyuOrDan: '2nd Kyu',  order: 8 },
  { colour: 'brown-i',       label: 'Brown I Belt',          kyuOrDan: '1st Kyu',  order: 9 },
  { colour: 'black',         label: 'Black Belt',            kyuOrDan: 'Dan 1',    order: 10 },
])

export type BeltColour = (typeof BELTS)[number]['colour']

/** Helper: find belt by colour string (handles both raw keys and human labels) */
export function getBelt(colour: string) {
  if (!colour) return null
  const normalized = colour.toLowerCase().replace(/\s+/g, '-').replace(/-belt$/, '')
  return BELTS.find(b => b.colour === normalized || b.label.toLowerCase() === colour.toLowerCase()) || null
}

/** Helper: get the next belt */
export function getNextBelt(colour: string) {
  const current = getBelt(colour)
  if (!current) return null
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
  'green-ii':      { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-400' },
  'green-i':       { bg: 'bg-green-200',  text: 'text-green-900',  border: 'border-green-500' },
  'blue':          { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-500' },
  'purple':        { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-500' },
  'brown-iii':     { bg: 'bg-amber-800',  text: 'text-amber-100',  border: 'border-amber-600' },
  'brown-ii':      { bg: 'bg-amber-900',  text: 'text-amber-100',  border: 'border-amber-700' },
  'brown-i':       { bg: 'bg-amber-950',  text: 'text-amber-100',  border: 'border-amber-800' },
  'black':         { bg: 'bg-gray-900',   text: 'text-white',      border: 'border-gray-700' },
} as Record<string, { bg: string; text: string; border: string }>)

/** Hex color values for rendering belt visuals */
export const BELT_HEX_COLORS = Object.freeze({
  White: '#F5F5F5',
  Yellow: '#FFD700',
  Orange: '#FF8C00',
  'Green II': '#32CD32',
  'Green I': '#228B22',
  Blue: '#1E90FF',
  Purple: '#8B008B',
  'Brown III': '#CD853F',
  'Brown II': '#8B4513',
  'Brown I': '#5C4033',
  Black: '#1a1a1a',
} as Record<string, string>)
