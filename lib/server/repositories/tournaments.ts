import { randomUUID } from 'node:crypto'
import { resolveDataFile, readJsonArray, writeJsonAtomically } from '../data-store'
import { ApiError } from '../api'

/**
 * Mock tournament data for SKF Karate
 * Replace with Firebase/Supabase queries when ready — function signatures stay identical.
 */

/** @type {import('../../types/tournament').Tournament[]} */
const TOURNAMENTS_DATA_FILE = resolveDataFile('tournaments.json')

export type TournamentWinner = {
  id: string
  athleteId?: string
  athleteName: string
  registrationNumber?: string
  belt: string
  branchName: string
  category: string
  ageGroup: string
  weightCategory?: string
  medal: 'gold' | 'silver' | 'bronze'
  position: number
  photoUrl?: string
}

export type TournamentParticipant = {
  id: string
  athleteId?: string
  athleteName: string
  registrationNumber: string
  branchName: string
  belt: string
  photoUrl?: string
}

export type TournamentResultRecord = {
  id?: string
  athleteId?: string
  registrationNumber: string
  athleteName: string
  result: string
  medal?: string
  position?: number
  category?: string
  ageGroup?: string
  weightCategory?: string
  notes?: string
  award?: string
  promotion?: string
}

export type TournamentRecord = {
  id: string
  slug: string
  name: string
  shortName: string
  level: string
  date: string
  endDate?: string
  venue: string
  city: string
  state: string
  description: string
  coverImageUrl?: string
  totalParticipants: number
  skfParticipants: number
  medals: {
    gold: number
    silver: number
    bronze: number
  }
  affiliatedBody?: string
  status: string
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  participants: TournamentParticipant[]
  winners: TournamentWinner[]
  results?: TournamentResultRecord[]
  resultsAppliedAt?: string
  isResultsPublished?: boolean
}

let tournaments: TournamentRecord[] = [
  {
    id: 't1',
    slug: 'skf-national-karate-championship-2025',
    name: 'SKF National Karate Championship 2025',
    shortName: 'National Championship 2025',
    level: 'national',
    date: '2025-12-06',
    endDate: '2025-12-08',
    venue: 'Kanteerava Indoor Stadium',
    city: 'Bengaluru',
    state: 'Karnataka',
    description: 'The premier national-level karate championship organized by SKF Karate, bringing together over 500 athletes from across India for three days of elite competition.',
    totalParticipants: 520,
    skfParticipants: 45,
    medals: { gold: 8, silver: 6, bronze: 10 },
    affiliatedBody: 'WKF',
    status: 'upcoming',
    isPublished: true,
    isFeatured: true,
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2025-12-10T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w1', athleteName: 'Arjun Raghavendra', belt: 'Black Belt 1st Dan', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w2', athleteName: 'Priya Shankar', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w3', athleteName: 'Karthik Murthy', belt: 'Black Belt 1st Dan', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'silver', position: 2 },
      { id: 'w4', athleteName: 'Deepika Nair', belt: 'Brown Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'senior', medal: 'gold', position: 1 },
      { id: 'w5', athleteName: 'Varun Hegde', belt: 'Blue Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 55kg', medal: 'silver', position: 2 },
      { id: 'w6', athleteName: 'Ananya Prasad', belt: 'Green Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'bronze', position: 3 },
      { id: 'w7', athleteName: 'Rahul Gowda', belt: 'Black Belt 1st Dan', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 84kg', medal: 'gold', position: 1 },
      { id: 'w8', athleteName: 'Meera Venkatesh', belt: 'Brown Belt', branchName: 'Malleshwaram', category: 'kata-team', ageGroup: 'senior', medal: 'bronze', position: 3 },
    ],
  },
  {
    id: 't2',
    slug: 'karnataka-state-karate-championship-2025',
    name: 'Karnataka State Karate Championship 2025',
    shortName: 'State Championship 2025',
    level: 'state',
    date: '2025-08-15',
    endDate: '2025-08-16',
    venue: 'Mysore Palace Grounds Indoor Arena',
    city: 'Mysuru',
    state: 'Karnataka',
    description: 'Annual state-level championship sanctioned by KIO, featuring top karatekas from 30 districts across Karnataka.',
    totalParticipants: 380,
    skfParticipants: 38,
    medals: { gold: 6, silver: 5, bronze: 8 },
    affiliatedBody: 'KIO',
    status: 'upcoming',
    isPublished: true,
    isFeatured: true,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-08-20T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w9', athleteName: 'Siddharth Rao', belt: 'Black Belt 1st Dan', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 60kg', medal: 'gold', position: 1 },
      { id: 'w10', athleteName: 'Kavitha Ramesh', belt: 'Brown Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'senior', medal: 'gold', position: 1 },
      { id: 'w11', athleteName: 'Aditya Kumar', belt: 'Blue Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 50kg', medal: 'silver', position: 2 },
      { id: 'w12', athleteName: 'Lakshmi Devi', belt: 'Green Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'gold', position: 1 },
      { id: 'w13', athleteName: 'Naveen Shetty', belt: 'Brown Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'bronze', position: 3 },
      { id: 'w14', athleteName: 'Ranjitha Gowda', belt: 'Blue Belt', branchName: 'Sunkadakatte', category: 'kata-team', ageGroup: 'junior', medal: 'silver', position: 2 },
    ],
  },
  {
    id: 't3',
    slug: 'national-karate-open-2024',
    name: 'All India Karate Open Championship 2024',
    shortName: 'National Open 2024',
    level: 'national',
    date: '2024-11-22',
    endDate: '2024-11-24',
    venue: 'Nehru Indoor Stadium',
    city: 'Chennai',
    state: 'Tamil Nadu',
    description: 'One of India\'s most prestigious open karate tournaments, attracting participation from 18 states with WKF-standard refereeing.',
    totalParticipants: 650,
    skfParticipants: 32,
    medals: { gold: 5, silver: 4, bronze: 7 },
    affiliatedBody: 'WKF',
    status: 'completed',
    isPublished: true,
    isFeatured: true,
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w15', athleteName: 'Arjun Raghavendra', belt: 'Black Belt 1st Dan', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w16', athleteName: 'Shreya Bhat', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w17', athleteName: 'Manoj Patel', belt: 'Black Belt 1st Dan', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 84kg', medal: 'silver', position: 2 },
      { id: 'w18', athleteName: 'Divya Ramachandra', belt: 'Blue Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'bronze', position: 3 },
      { id: 'w19', athleteName: 'Harish Naik', belt: 'Brown Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 60kg', medal: 'gold', position: 1 },
      { id: 'w20', athleteName: 'Pooja Iyer', belt: 'Green Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'junior', medal: 'silver', position: 2 },
    ],
  },
  {
    id: 't4',
    slug: 'karnataka-state-championship-2024',
    name: 'Karnataka State Karate Championship 2024',
    shortName: 'State Championship 2024',
    level: 'state',
    date: '2024-07-20',
    endDate: '2024-07-21',
    venue: 'Sree Kanteerava Stadium',
    city: 'Bengaluru',
    state: 'Karnataka',
    description: 'The 2024 edition of Karnataka\'s premier state karate championship, with fierce competition across all age groups.',
    totalParticipants: 400,
    skfParticipants: 42,
    medals: { gold: 7, silver: 5, bronze: 9 },
    affiliatedBody: 'KIO',
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-07-25T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w21', athleteName: 'Prashanth Kumar', belt: 'Black Belt 1st Dan', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w22', athleteName: 'Vaishnavi Rao', belt: 'Brown Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'senior', medal: 'gold', position: 1 },
      { id: 'w23', athleteName: 'Suresh Naidu', belt: 'Blue Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 55kg', medal: 'silver', position: 2 },
      { id: 'w24', athleteName: 'Rekha Gowda', belt: 'Green Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'gold', position: 1 },
      { id: 'w25', athleteName: 'Akash Shetty', belt: 'Brown Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'bronze', position: 3 },
      { id: 'w26', athleteName: 'Madhuri Hegde', belt: 'Blue Belt', branchName: 'Sunkadakatte', category: 'kata-team', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w27', athleteName: 'Girish Ananth', belt: 'Black Belt 1st Dan', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 84kg', medal: 'silver', position: 2 },
    ],
  },
  {
    id: 't5',
    slug: 'bengaluru-district-championship-2024',
    name: 'Bengaluru District Karate Championship 2024',
    shortName: 'District Championship 2024',
    level: 'district',
    date: '2024-03-10',
    venue: 'Koramangala Indoor Stadium',
    city: 'Bengaluru',
    state: 'Karnataka',
    description: 'District-level qualifying tournament for the state championship, testing emerging talent across Bengaluru Urban.',
    totalParticipants: 220,
    skfParticipants: 55,
    medals: { gold: 10, silver: 8, bronze: 12 },
    affiliatedBody: 'KIO',
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w28', athleteName: 'Darshan Gowda', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 60kg', medal: 'gold', position: 1 },
      { id: 'w29', athleteName: 'Keerthi Prasad', belt: 'Blue Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w30', athleteName: 'Nikhil Sharma', belt: 'Green Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 50kg', medal: 'silver', position: 2 },
      { id: 'w31', athleteName: 'Sowmya Murthy', belt: 'Yellow Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'gold', position: 1 },
      { id: 'w32', athleteName: 'Tarun Reddy', belt: 'Blue Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'bronze', position: 3 },
      { id: 'w33', athleteName: 'Ashwini Rao', belt: 'Green Belt', branchName: 'Sunkadakatte', category: 'kata-team', ageGroup: 'junior', medal: 'gold', position: 1 },
    ],
  },
  {
    id: 't6',
    slug: 'karnataka-state-championship-2023',
    name: 'Karnataka State Karate Championship 2023',
    shortName: 'State Championship 2023',
    level: 'state',
    date: '2023-09-09',
    endDate: '2023-09-10',
    venue: 'JSS Indoor Stadium',
    city: 'Dharwad',
    state: 'Karnataka',
    description: 'SKF athletes delivered a stellar performance at the 2023 state championship held in Dharwad, winning medals across multiple categories.',
    totalParticipants: 350,
    skfParticipants: 35,
    medals: { gold: 5, silver: 6, bronze: 4 },
    affiliatedBody: 'KIO',
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2023-08-01T00:00:00Z',
    updatedAt: '2023-09-15T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w34', athleteName: 'Rohan Bhat', belt: 'Black Belt 1st Dan', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'gold', position: 1 },
      { id: 'w35', athleteName: 'Swathi Krishnan', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'senior', medal: 'silver', position: 2 },
      { id: 'w36', athleteName: 'Vinay Acharya', belt: 'Blue Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 55kg', medal: 'gold', position: 1 },
      { id: 'w37', athleteName: 'Nandini Upadhyaya', belt: 'Green Belt', branchName: 'Vijayanagar', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'bronze', position: 3 },
      { id: 'w38', athleteName: 'Chetan Rao', belt: 'Brown Belt', branchName: 'Yeshwanthpur', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
    ],
  },
  {
    id: 't7',
    slug: 'mysuru-district-championship-2023',
    name: 'Mysuru District Karate Championship 2023',
    shortName: 'Mysuru District 2023',
    level: 'district',
    date: '2023-05-20',
    venue: 'Chamundi Vihar Stadium',
    city: 'Mysuru',
    state: 'Karnataka',
    description: 'District karate championship at Chamundi Vihar Stadium with participation from dojos across Mysuru district.',
    totalParticipants: 180,
    skfParticipants: 28,
    medals: { gold: 6, silver: 4, bronze: 5 },
    affiliatedBody: 'KIO',
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2023-04-01T00:00:00Z',
    updatedAt: '2023-05-25T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w39', athleteName: 'Rajesh Kumar', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w40', athleteName: 'Bhavya Hegde', belt: 'Blue Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w41', athleteName: 'Ganesh Iyengar', belt: 'Green Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 50kg', medal: 'silver', position: 2 },
      { id: 'w42', athleteName: 'Pallavi Nair', belt: 'Yellow Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'bronze', position: 3 },
      { id: 'w43', athleteName: 'Santosh Reddy', belt: 'Brown Belt', branchName: 'Vijayanagar', category: 'kumite-team', ageGroup: 'senior', medal: 'gold', position: 1 },
    ],
  },
  {
    id: 't8',
    slug: 'skf-inter-dojo-championship-2024',
    name: 'SKF Inter-Dojo Championship 2024',
    shortName: 'Inter-Dojo 2024',
    level: 'inter-dojo',
    date: '2024-01-14',
    venue: 'SKF Headquarters Dojo',
    city: 'Bengaluru',
    state: 'Karnataka',
    description: 'Annual internal championship between all SKF branches, building competitive spirit and camaraderie among our karatekas.',
    totalParticipants: 150,
    skfParticipants: 150,
    medals: { gold: 12, silver: 12, bronze: 15 },
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-01-18T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w44', athleteName: 'Anand Gowda', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w45', athleteName: 'Smitha Rao', belt: 'Blue Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w46', athleteName: 'Pavan Shetty', belt: 'Green Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 50kg', medal: 'silver', position: 2 },
      { id: 'w47', athleteName: 'Chaitra Naik', belt: 'Yellow Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'gold', position: 1 },
      { id: 'w48', athleteName: 'Vivek Murthy', belt: 'Brown Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'bronze', position: 3 },
      { id: 'w49', athleteName: 'Rashmi Gowda', belt: 'Blue Belt', branchName: 'Sunkadakatte', category: 'kata-team', ageGroup: 'junior', medal: 'gold', position: 1 },
    ],
  },
  {
    id: 't9',
    slug: 'international-karate-friendship-cup-2022',
    name: 'International Karate Friendship Cup 2022',
    shortName: 'Friendship Cup 2022',
    level: 'international',
    date: '2022-10-15',
    endDate: '2022-10-17',
    venue: 'Thyagaraj Sports Complex',
    city: 'New Delhi',
    state: 'Delhi',
    description: 'An international tournament featuring athletes from 12 countries. SKF athletes represented India with distinction on the global stage.',
    totalParticipants: 800,
    skfParticipants: 12,
    medals: { gold: 2, silver: 3, bronze: 4 },
    affiliatedBody: 'WKF',
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2022-09-01T00:00:00Z',
    updatedAt: '2022-10-20T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w50', athleteName: 'Arjun Raghavendra', belt: 'Brown Belt', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 67kg', medal: 'gold', position: 1 },
      { id: 'w51', athleteName: 'Priya Shankar', belt: 'Blue Belt', branchName: 'Sunkadakatte', category: 'kata-individual', ageGroup: 'junior', medal: 'silver', position: 2 },
      { id: 'w52', athleteName: 'Karthik Murthy', belt: 'Brown Belt', branchName: 'Malleshwaram', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 75kg', medal: 'bronze', position: 3 },
      { id: 'w53', athleteName: 'Rohan Bhat', belt: 'Brown Belt', branchName: 'Rajajinagar', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 84kg', medal: 'gold', position: 1 },
      { id: 'w54', athleteName: 'Deepika Nair', belt: 'Blue Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'senior', medal: 'silver', position: 2 },
    ],
  },
  {
    id: 't10',
    slug: 'skf-inter-dojo-championship-2021',
    name: 'SKF Inter-Dojo Championship 2021',
    shortName: 'Inter-Dojo 2021',
    level: 'inter-dojo',
    date: '2021-02-07',
    venue: 'SKF Sunkadakatte Dojo',
    city: 'Bengaluru',
    state: 'Karnataka',
    description: 'The first post-pandemic inter-dojo championship, marking SKF\'s resilient return to competitive karate.',
    totalParticipants: 100,
    skfParticipants: 100,
    medals: { gold: 8, silver: 8, bronze: 10 },
    status: 'completed',
    isPublished: true,
    isFeatured: false,
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-02-10T00:00:00Z',
    participants: [],
    winners: [
      { id: 'w55', athleteName: 'Ajay Gowda', belt: 'Brown Belt', branchName: 'Sunkadakatte', category: 'kumite-individual', ageGroup: 'senior', weightCategory: 'Under 60kg', medal: 'gold', position: 1 },
      { id: 'w56', athleteName: 'Divya Rao', belt: 'Green Belt', branchName: 'Rajajinagar', category: 'kata-individual', ageGroup: 'junior', medal: 'gold', position: 1 },
      { id: 'w57', athleteName: 'Mohan Kumar', belt: 'Blue Belt', branchName: 'Vijayanagar', category: 'kumite-individual', ageGroup: 'junior', weightCategory: 'Under 55kg', medal: 'silver', position: 2 },
      { id: 'w58', athleteName: 'Asha Prasad', belt: 'Yellow Belt', branchName: 'Yeshwanthpur', category: 'kata-individual', ageGroup: 'sub-junior', medal: 'bronze', position: 3 },
      { id: 'w59', athleteName: 'Sunil Shetty', belt: 'Brown Belt', branchName: 'Malleshwaram', category: 'kumite-team', ageGroup: 'senior', medal: 'gold', position: 1 },
    ],
  },
]

// Sort newest first by default
tournaments.sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)

let tournamentsLoadedFromDisk = false

function cloneTournamentData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function ensureTournamentsLoaded() {
  if (tournamentsLoadedFromDisk) return
  tournamentsLoadedFromDisk = true

  try {
    const stored = readJsonArray(TOURNAMENTS_DATA_FILE)
    if (Array.isArray(stored) && stored.length > 0) {
      tournaments = (stored as TournamentRecord[]).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    }
  } catch (error) {
    console.error('Failed to load tournament store:', error)
  }
}

function persistTournaments() {
  ensureTournamentsLoaded()
  tournaments.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  writeJsonAtomically(TOURNAMENTS_DATA_FILE, tournaments)
}

function recalculateMedals(
  winners: TournamentWinner[] = []
): TournamentRecord['medals'] {
  return {
    gold: winners.filter((winner) => winner.medal === 'gold').length,
    silver: winners.filter((winner) => winner.medal === 'silver').length,
    bronze: winners.filter((winner) => winner.medal === 'bronze').length,
  }
}

function normaliseTournamentPayload(
  input: Partial<TournamentRecord> = {},
  existing: TournamentRecord | null = null
): TournamentRecord {
  const winners = Array.isArray(input.winners) ? input.winners : existing?.winners || []
  const participants = Array.isArray(input.participants)
    ? input.participants
    : existing?.participants || []
  const results = Array.isArray(input.results) ? input.results : existing?.results || []
  const now = new Date().toISOString()

  return {
    id: existing?.id || input.id || `t_${randomUUID()}`,
    slug: input.slug?.trim() || existing?.slug || '',
    name: input.name?.trim() || existing?.name || '',
    shortName: input.shortName?.trim() || existing?.shortName || '',
    level: input.level || existing?.level || 'district',
    date: input.date || existing?.date || '',
    endDate: input.endDate || existing?.endDate || '',
    venue: input.venue?.trim() || existing?.venue || '',
    city: input.city?.trim() || existing?.city || '',
    state: input.state?.trim() || existing?.state || 'Karnataka',
    description: input.description?.trim() || existing?.description || '',
    coverImageUrl: input.coverImageUrl || existing?.coverImageUrl || '',
    status: input.status || existing?.status || 'draft',
    totalParticipants: Number(input.totalParticipants ?? existing?.totalParticipants ?? 0),
    skfParticipants: Number(input.skfParticipants ?? existing?.skfParticipants ?? 0),
    medals: input.medals || recalculateMedals(winners),
    affiliatedBody: input.affiliatedBody || existing?.affiliatedBody || '',
    isPublished: typeof input.isPublished === 'boolean' ? input.isPublished : existing?.isPublished ?? false,
    isFeatured: typeof input.isFeatured === 'boolean' ? input.isFeatured : existing?.isFeatured ?? false,
    resultsAppliedAt: input.resultsAppliedAt || existing?.resultsAppliedAt || '',
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: now,
    participants,
    results,
    winners,
  }
}

/** Get all published tournaments */
export function getAllTournaments() {
  ensureTournamentsLoaded()
  return cloneTournamentData(tournaments.filter(t => t.isPublished))
}

/** Get featured tournaments (max 3)  */
export function getFeaturedTournaments() {
  ensureTournamentsLoaded()
  return cloneTournamentData(tournaments.filter(t => t.isPublished && t.isFeatured).slice(0, 3))
}

/** Find a tournament by its URL slug */
export function getTournamentBySlug(slug) {
  ensureTournamentsLoaded()
  return tournaments.find(t => t.slug === slug && t.isPublished) || null
}

/** Find a tournament by ID (admin use — includes unpublished) */
export function getTournamentById(id) {
  ensureTournamentsLoaded()
  const tournament = tournaments.find(t => t.id === id) || null
  return tournament ? cloneTournamentData(tournament) : null
}

/** Get tournaments by competition level */
export function getTournamentsByLevel(level) {
  ensureTournamentsLoaded()
  return cloneTournamentData(tournaments.filter(t => t.isPublished && t.level === level))
}

/** Get tournaments by year */
export function getTournamentsByYear(year) {
  ensureTournamentsLoaded()
  return cloneTournamentData(
    tournaments.filter(t => t.isPublished && new Date(t.date).getFullYear() === year)
  )
}

/** Get all available years from published tournaments */
export function getAvailableYears() {
  ensureTournamentsLoaded()
  const years = [...new Set(
    tournaments
      .filter(t => t.isPublished)
      .map(t => new Date(t.date).getFullYear())
  )]
  return years.sort((a, b) => b - a)
}

/** Get aggregate stats across all published tournaments */
export function getTournamentStats() {
  ensureTournamentsLoaded()
  const published = tournaments.filter(t => t.isPublished)
  const totalGold = published.reduce((sum, t) => sum + t.medals.gold, 0)
  const totalSilver = published.reduce((sum, t) => sum + t.medals.silver, 0)
  const totalBronze = published.reduce((sum, t) => sum + t.medals.bronze, 0)

  const nationalInternational = published.filter(
    t => t.level === 'national' || t.level === 'international'
  )
  const nationalChampions = nationalInternational.reduce((sum, t) => sum + t.medals.gold, 0)

  const years = getAvailableYears()
  const yearsActive = years.length > 0 ? years[0] - years[years.length - 1] + 1 : 0

  return {
    totalTournaments: published.length,
    totalGold,
    totalSilver,
    totalBronze,
    totalMedals: totalGold + totalSilver + totalBronze,
    nationalChampions,
    yearsActive,
  }
}

/** Search tournaments by name, venue, city, or winner name */
export function searchTournaments(query) {
  ensureTournamentsLoaded()
  const q = query.toLowerCase().trim()
  if (!q) return getAllTournaments()

  return cloneTournamentData(getAllTournaments().filter(t =>
    t.name.toLowerCase().includes(q) ||
    t.shortName.toLowerCase().includes(q) ||
    t.venue.toLowerCase().includes(q) ||
    t.city.toLowerCase().includes(q) ||
    t.winners.some(w => w.athleteName.toLowerCase().includes(q))
  ))
}

export function hasTournamentSlug(slug, excludeId = null) {
  ensureTournamentsLoaded()
  const normalized = String(slug || '').trim().toLowerCase()

  return tournaments.some((tournament) => {
    return tournament.slug.toLowerCase() === normalized && tournament.id !== excludeId
  })
}

/** Get all tournaments for admin (including unpublished) */
export function getAllTournamentsAdmin() {
  ensureTournamentsLoaded()
  return cloneTournamentData(
    [...tournaments].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  )
}

export function createTournament(input) {
  ensureTournamentsLoaded()
  const tournament = normaliseTournamentPayload(input)

  if (hasTournamentSlug(tournament.slug)) {
    throw new ApiError(409, 'A tournament with this slug already exists.')
  }

  tournaments = [tournament, ...tournaments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  persistTournaments()
  return cloneTournamentData(tournament)
}

export function updateTournament(id, input) {
  ensureTournamentsLoaded()
  const index = tournaments.findIndex((tournament) => tournament.id === id)
  if (index === -1) return null

  const updatedTournament = normaliseTournamentPayload(input, tournaments[index])

  if (hasTournamentSlug(updatedTournament.slug, id)) {
    throw new ApiError(409, 'A tournament with this slug already exists.')
  }

  tournaments[index] = updatedTournament
  persistTournaments()
  return cloneTournamentData(updatedTournament)
}

export function deleteTournament(id) {
  ensureTournamentsLoaded()
  const index = tournaments.findIndex((tournament) => tournament.id === id)
  if (index === -1) return false

  tournaments.splice(index, 1)
  persistTournaments()
  return true
}
