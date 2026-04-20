/**
 * Seed: Events — standalone events (non-tournament).
 * These serve as the initial seed for the events JSON store.
 */
import { EVENT_TYPES } from '../constants/categories'
import { EVENT_STATUSES } from '../constants/statuses'

export interface SeedEvent {
  id: string
  slug: string
  name: string
  shortName: string
  type: string
  status: string
  level?: string
  date: string
  endDate: string
  venue: string
  city: string
  state: string
  description: string
  coverImageUrl: string
  affiliatedBody: string
  isPublished: boolean
  isFeatured: boolean
  isResultsPublished: boolean
  hostingBranch: string
  createdAt: string
  updatedAt: string
}

export const events: SeedEvent[] = [
  {
    id: 'evt_summer_camp_2026', slug: 'summer-camp-2026',
    name: 'Summer Camp 2026', shortName: 'Summer Camp 2026',
    type: "camp", status: "upcoming", date: '2026-04-01', endDate: '2026-05-31',
    venue: 'M P Sports Club', city: 'Bengaluru', state: 'Karnataka',
    description: 'Intensive two-month training camp for all levels, from beginner to advanced.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: true, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'evt_kyu_grading_2026', slug: 'kyu-grading-examination-2026',
    name: 'Kyu Grading Examination', shortName: 'Kyu Grading 2026',
    type: "grading", status: "upcoming", date: '2026-05-10', endDate: '',
    venue: 'M P Sports Club', city: 'Bengaluru', state: 'Karnataka',
    description: 'Belt examination for all Kyu grades from white to yellow.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: false, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-01-12T00:00:00Z', updatedAt: '2026-01-12T00:00:00Z',
  },
  {
    id: 'evt_bring_your_buddy_2026', slug: 'bring-your-buddy-2026',
    name: 'Bring Your Buddy', shortName: 'Bring Your Buddy',
    type: "fun", status: "upcoming", date: '2026-06-15', endDate: '',
    venue: 'M P Sports Club', city: 'Bengaluru', state: 'Karnataka',
    description: 'Bring your friend to the dojo and show them what you love about training.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: false, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'evt_kata_masterclass_2026', slug: 'kata-masterclass-seminar-2026',
    name: 'Kata Masterclass Seminar', shortName: 'Kata Masterclass',
    type: "seminar", status: "upcoming", date: '2026-10-05', endDate: '',
    venue: 'SKF Headquarters', city: 'Bengaluru', state: 'Karnataka',
    description: 'Special seminar by a visiting Shihan covering advanced kata techniques and bunkai analysis.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: true, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'evt_dan_grading_2026', slug: 'dan-grading-examination-2026',
    name: 'Dan Grading Examination', shortName: 'Dan Grading 2026',
    type: "grading", status: "upcoming", date: '2026-12-14', endDate: '',
    venue: 'Central Dojo', city: 'Bengaluru', state: 'Karnataka',
    description: 'Black belt examination for Shodan, Nidan, and Sandan candidates.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: false, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-01-25T00:00:00Z', updatedAt: '2026-01-25T00:00:00Z',
  },
  {
    id: 'evt_annual_championship_2027', slug: 'annual-championship-2027',
    name: 'SKF Annual Championship 2027', shortName: 'Annual Championship',
    type: "tournament", status: "upcoming", date: '2027-01-20', endDate: '2027-01-21',
    venue: 'Kanteerava Indoor Stadium', city: 'Bengaluru', state: 'Karnataka',
    description: 'The premier annual SKF championship featuring Kata and Kumite events across all age divisions.',
    coverImageUrl: '', affiliatedBody: 'KIO',
    isPublished: true, isFeatured: true, isResultsPublished: false,
    hostingBranch: 'koramangala', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'evt_pelt_exam_2027', slug: 'pelt-examination-2027',
    name: 'PELT Examination 2027', shortName: 'PELT Exam 2027',
    type: "pelt-exam", status: "upcoming", date: '2027-03-15', endDate: '',
    venue: 'M P Sports Club', city: 'Bengaluru', state: 'Karnataka',
    description: 'Physical Education Leadership Training practical examination for all instructor-track candidates.',
    coverImageUrl: '', affiliatedBody: '',
    isPublished: true, isFeatured: false, isResultsPublished: false,
    hostingBranch: '', createdAt: '2026-08-01T00:00:00Z', updatedAt: '2026-08-01T00:00:00Z',
  },
]
