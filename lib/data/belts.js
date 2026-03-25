// Define all belts in order from lowest to highest
// order field must be sequential starting from 0
export const BELTS = [
  { colour: 'white',         label: 'White Belt',              kyuOrDan: '9th Kyu',  order: 0 },
  { colour: 'yellow',        label: 'Yellow Belt',             kyuOrDan: '8th Kyu',  order: 1 },
  { colour: 'orange',        label: 'Orange Belt',             kyuOrDan: '7th Kyu',  order: 2 },
  { colour: 'green',         label: 'Green Belt',              kyuOrDan: '6th Kyu',  order: 3 },
  { colour: 'blue',          label: 'Blue Belt',               kyuOrDan: '5th Kyu',  order: 4 },
  { colour: 'brown',         label: 'Brown Belt',              kyuOrDan: '4th Kyu',  order: 5 },
  { colour: 'black-1st-dan', label: 'Black Belt — 1st Dan',   kyuOrDan: '1st Dan',  order: 6 },
  { colour: 'black-2nd-dan', label: 'Black Belt — 2nd Dan',   kyuOrDan: '2nd Dan',  order: 7 },
  { colour: 'black-3rd-dan', label: 'Black Belt — 3rd Dan',   kyuOrDan: '3rd Dan',  order: 8 },
  { colour: 'black-4th-dan', label: 'Black Belt — 4th Dan',   kyuOrDan: '4th Dan',  order: 9 },
  { colour: 'black-5th-dan', label: 'Black Belt — 5th Dan',   kyuOrDan: '5th Dan',  order: 10 },
];

export function getBelt(colour) {
  return BELTS.find(b => b.colour === colour) || BELTS[0];
}

export function getNextBelt(colour) {
  const current = getBelt(colour);
  return BELTS.find(b => b.order === current.order + 1) ?? null;
}

export function getBeltOrder(colour) {
  return getBelt(colour)?.order ?? 0;
}

// Visual colours for each belt — used in UI components
// These are Tailwind class strings. Match them to the project's palette.
// If the project does not have exact belt colours, use the closest available.
export const BELT_COLOURS = {
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
};
