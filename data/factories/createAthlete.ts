/**
 * Factory: createAthlete
 */
import { generateId, isoNow, randomPastDate } from './helpers'
import { ATHLETE_STATUSES } from '../constants/statuses'

export interface AthleteInput {
  firstName: string
  lastName: string
  branchName?: string
  currentBelt?: string
  [key: string]: any
}

export function createAthlete(input: AthleteInput) {
  const now = isoNow()
  return {
    id: input.id || generateId('ath'),
    registrationNumber: input.registrationNumber || `SKF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    firstName: input.firstName,
    lastName: input.lastName,
    dateOfBirth: input.dateOfBirth || randomPastDate(15),
    gender: input.gender || 'male',
    photoUrl: input.photoUrl || '',
    branchName: input.branchName || 'koramangala',
    currentBelt: input.currentBelt || 'white',
    joinDate: input.joinDate || randomPastDate(2),
    status: input.status || ATHLETE_STATUSES.ACTIVE,
    pointsBalance: input.pointsBalance ?? 50,
    pointsLifetime: input.pointsLifetime ?? 50,
    isPublic: input.isPublic ?? true,
    isFeatured: input.isFeatured ?? false,
    achievements: input.achievements || [
      { id: `ach_${generateId('enr')}`, type: 'enrollment', date: input.joinDate || randomPastDate(2), title: 'Joined SKF Karate', pointsAwarded: 50 },
    ],
    pointsHistory: input.pointsHistory || [],
    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}
