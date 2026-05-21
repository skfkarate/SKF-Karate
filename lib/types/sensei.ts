export const SENSEI_ACCENTS = ['gold', 'crimson', 'blue', 'neutral'] as const

export type SenseiAccent = (typeof SENSEI_ACCENTS)[number]

export interface SenseiBranchAssignment {
  citySlug: string
  cityName: string
  branchSlug: string
  branchName: string
}

export interface SenseiSummary {
  id: string
  slug: string
  name: string
  title: string
  dan: string
  role: string
  specialty: string
  description: string
  imageUrl: string
  objectPosition?: string
  hidePhoto?: boolean
  accent: SenseiAccent
  isPublic: boolean
  isActive: boolean
  isAssignable: boolean
}

export interface SenseiProfile extends SenseiSummary {
  experience: string
  fullBio: string
  achievements: string[]
  quote: string
  isFounder: boolean
  isExecutiveCommittee: boolean
  sortOrder: number
  assignments: SenseiBranchAssignment[]
}
