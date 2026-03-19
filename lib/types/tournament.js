/**
 * Tournament data types for SKF Karate
 * Using JSDoc for type documentation (project uses JS, not TS)
 */

/** @type {readonly ['gold', 'silver', 'bronze']} */
export const MEDAL_TYPES = ['gold', 'silver', 'bronze']

/** @type {readonly ['inter-dojo', 'district', 'state', 'national', 'international']} */
export const TOURNAMENT_LEVELS = ['inter-dojo', 'district', 'state', 'national', 'international']

/** @type {Record<string, string>} */
export const TOURNAMENT_LEVEL_LABELS = {
  'inter-dojo': 'Inter-Dojo',
  'district': 'District',
  'state': 'State',
  'national': 'National',
  'international': 'International',
}

/** @type {readonly ['kata-individual', 'kata-team', 'kumite-individual', 'kumite-team', 'mixed']} */
export const EVENT_CATEGORIES = ['kata-individual', 'kata-team', 'kumite-individual', 'kumite-team', 'mixed']

/** @type {Record<string, string>} */
export const EVENT_CATEGORY_LABELS = {
  'kata-individual': 'Kata Individual',
  'kata-team': 'Kata Team',
  'kumite-individual': 'Kumite Individual',
  'kumite-team': 'Kumite Team',
  'mixed': 'Mixed',
}

/** @type {readonly ['sub-junior', 'junior', 'senior', 'open']} */
export const AGE_GROUPS = ['sub-junior', 'junior', 'senior', 'open']

/** @type {Record<string, string>} */
export const AGE_GROUP_LABELS = {
  'sub-junior': 'Sub-Junior (U14)',
  'junior': 'Junior (14–17)',
  'senior': 'Senior (18+)',
  'open': 'Open',
}

export const BRANCHES = [
  'Sunkadakatte',
  'Rajajinagar',
  'Malleshwaram',
  'Yeshwanthpur',
  'Vijayanagar',
]

export const BELTS = [
  'White Belt',
  'Yellow Belt',
  'Orange Belt',
  'Green Belt',
  'Blue Belt',
  'Brown Belt',
  'Black Belt 1st Dan',
  'Black Belt 2nd Dan',
  'Black Belt 3rd Dan',
]

/**
 * @typedef {Object} MedalWinner
 * @property {string} id
 * @property {string} studentName
 * @property {string} [registrationNumber]
 * @property {string} belt
 * @property {string} branchName
 * @property {'kata-individual'|'kata-team'|'kumite-individual'|'kumite-team'|'mixed'} category
 * @property {'sub-junior'|'junior'|'senior'|'open'} ageGroup
 * @property {string} [weightCategory]
 * @property {'gold'|'silver'|'bronze'} medal
 * @property {number} position
 * @property {string} [photoUrl]
 */

/**
 * @typedef {Object} Tournament
 * @property {string} id
 * @property {string} slug
 * @property {string} name
 * @property {string} shortName
 * @property {'inter-dojo'|'district'|'state'|'national'|'international'} level
 * @property {string} date
 * @property {string} [endDate]
 * @property {string} venue
 * @property {string} city
 * @property {string} state
 * @property {string} description
 * @property {string} [coverImageUrl]
 * @property {number} totalParticipants
 * @property {number} skfParticipants
 * @property {{gold: number, silver: number, bronze: number}} medals
 * @property {MedalWinner[]} winners
 * @property {string} [affiliatedBody]
 * @property {boolean} isPublished
 * @property {boolean} isFeatured
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} TournamentFilters
 * @property {string} [level]
 * @property {number|string} [year]
 * @property {string} [search]
 */

/**
 * @typedef {Object} TournamentStats
 * @property {number} totalTournaments
 * @property {number} totalGold
 * @property {number} totalSilver
 * @property {number} totalBronze
 * @property {number} totalMedals
 * @property {number} nationalChampions
 * @property {number} yearsActive
 */
