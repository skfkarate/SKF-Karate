/**
 * Seed: Belt Examinations — athlete profile mock data.
 */

export interface BeltExamination {
  id: string
  belt: string
  date: string
  status: 'Passed' | 'Scheduled' | 'Failed'
  score?: number
}

export const beltExaminations: BeltExamination[] = [
  { id: 'bex_001', belt: 'Yellow',   date: '2023-12-02', status: 'Passed', score: 88 },
  { id: 'bex_002', belt: 'Orange',   date: '2024-03-15', status: 'Passed', score: 92 },
  { id: 'bex_003', belt: 'Green II', date: '2024-06-22', status: 'Passed', score: 85 },
  { id: 'bex_004', belt: 'Green I',  date: '2024-09-14', status: 'Passed', score: 90 },
  { id: 'bex_005', belt: 'Blue',     date: '2025-01-18', status: 'Passed', score: 87 },
  { id: 'bex_006', belt: 'Purple',   date: '2025-05-10', status: 'Passed', score: 91 },
  { id: 'bex_007', belt: 'Brown III', date: '2025-09-20', status: 'Passed', score: 94 },
  { id: 'bex_008', belt: 'Brown II', date: '2026-02-08', status: 'Scheduled' },
  { id: 'bex_009', belt: 'Brown I',  date: '2026-06-15', status: 'Scheduled' },
  { id: 'bex_010', belt: 'Black — Shodan', date: '2026-12-14', status: 'Scheduled' },
]

/** Athlete profile default images */
export const DEFAULT_PROFILE_PHOTO = '/default-athlete.png'
export const DEFAULT_COUNTRY_FLAG  = 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg'
