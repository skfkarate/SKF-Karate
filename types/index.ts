export type UserRole = 'student' | 'sensei' | 'branch_admin' | 'super_admin'
export type Belt = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
export type Branch = 'koramangala' | 'whitefield' | 'jp-nagar' | string

export interface JWTPayload {
  skfId: string | null
  role: UserRole
  branch: Branch | null
  batch: string | null
  belt: Belt | null
  name: string
  parentPhone: string | null
  iat: number
  exp: number
}

export interface Student {
  skfId: string
  name: string
  branch: Branch
  batch: string
  belt: Belt
  parentName: string
  phone: string
  status: 'Active' | 'Inactive'
  enrolledDate: string
  monthlyFee: number
  photoConsent: boolean
}

export interface FeeRow {
  skfId: string
  month: string
  year: number
  amount: number
  status: 'paid' | 'due' | 'overdue'
  paidDate?: string
  receiptId?: string
  paymentMethod?: string
}

export interface VideoRow {
  videoId: string
  title: string
  branch: Branch
  batch: string
  section: string
  beltLevel: Belt
  unlockDate: string
  locked: boolean
  durationMin: number
  progressPercent?: number
}

export interface TournamentResult {
  skfId: string
  tournamentName: string
  date: string
  category: string
  medal: 'Gold' | 'Silver' | 'Bronze' | 'Participant'
  points: number
}

export interface AttendanceRow {
  skfId: string
  date: string
  status: 'Present' | 'Absent' | 'Leave'
  markedBy?: string
}

export interface Announcement {
  slug: string
  title: string
  body: string
  branch: string
  publishedDate: string
  expiryDate: string
  author: string
}
