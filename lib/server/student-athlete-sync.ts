import { resolveClassBranchLabel } from '@/lib/classes/catalog'

import { getAthleteBySkfIdLive, upsertAthleteMirror } from './repositories/athletes-live'
import { getAllCitiesLive } from './repositories/classes-live'

type StudentRecord = {
  skfId: string
  name: string
  branch?: string
  belt?: string
  gender?: string
  parentName?: string
  phone?: string
  email?: string
  photoUrl?: string
  batch?: string
  monthlyFee?: number
  photoConsent?: boolean
  isPublic?: boolean
  isFeatured?: boolean
  status?: string
  enrolledDate?: string
  dob?: string
}

const LEGACY_BRANCH_MAP: Record<string, string> = {
  sunkadakatte: 'M P Sports Club',
  rajajinagar: 'Herohalli',
  malleshwaram: 'Tumkur',
  yeshwanthpur: 'Kunigal',
  vijayanagar: 'Udupi',
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

function resolveBranchLabel(branch?: string) {
  if (!branch) return 'M P Sports Club'

  const normalized = branch.trim().toLowerCase()

  if (LEGACY_BRANCH_MAP[normalized]) {
    return LEGACY_BRANCH_MAP[normalized]
  }

  return titleCase(branch.replace(/-/g, ' '))
}

function splitName(name: string) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { firstName: 'SKF', lastName: 'Athlete' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export async function syncStudentToAthleteMirror(student: StudentRecord) {
  const skfId = String(student.skfId || '').trim().toUpperCase()
  if (!skfId) return null
  const classes = await getAllCitiesLive()

  const existingAthlete = await getAthleteBySkfIdLive(skfId)
  if (!existingAthlete && !String(student.name || '').trim()) {
    return null
  }

  const hasExplicitName = Boolean(String(student.name || '').trim())
  const { firstName, lastName } = hasExplicitName
    ? splitName(student.name)
    : {
        firstName: existingAthlete?.firstName || 'SKF',
        lastName: existingAthlete?.lastName || 'Athlete',
      }

  return upsertAthleteMirror({
    ...existingAthlete,
    skfId,
    firstName,
    lastName,
    dateOfBirth: student.dob || existingAthlete?.dateOfBirth || '2000-01-01',
    gender: student.gender || existingAthlete?.gender || 'male',
    photoUrl: student.photoUrl ?? existingAthlete?.photoUrl ?? '',
    branchName:
      resolveClassBranchLabel(classes, student.branch || existingAthlete?.branchName) ||
      resolveBranchLabel(student.branch || existingAthlete?.branchName),
    currentBelt: String(student.belt || existingAthlete?.currentBelt || 'white').toLowerCase(),
    joinDate: student.enrolledDate || existingAthlete?.joinDate || new Date().toISOString().split('T')[0],
    status:
      String(student.status || existingAthlete?.status || 'active').toLowerCase() === 'inactive'
        ? 'inactive'
        : String(student.status || existingAthlete?.status || 'active').toLowerCase() === 'alumni'
          ? 'alumni'
          : 'active',
    parentName: student.parentName ?? existingAthlete?.parentName ?? '',
    phone: student.phone ?? existingAthlete?.phone ?? '',
    email: student.email ?? existingAthlete?.email ?? '',
    batch: student.batch ?? existingAthlete?.batch ?? '',
    monthlyFee: (() => {
      const explicitFee = student.monthlyFee !== undefined && student.monthlyFee !== null ? Number(student.monthlyFee) : null;
      if (explicitFee !== null && explicitFee !== 0) return explicitFee;
      if ((existingAthlete?.monthlyFee || 0) !== 0) return existingAthlete!.monthlyFee;
      
      const branchName = resolveClassBranchLabel(classes, student.branch || existingAthlete?.branchName) ||
        resolveBranchLabel(student.branch || existingAthlete?.branchName);
      return branchName.toLowerCase() === 'herohalli' ? 500 : 0;
    })(),
    photoConsent:
      student.photoConsent === undefined
        ? existingAthlete?.photoConsent ?? false
        : Boolean(student.photoConsent),
    isPublic: student.isPublic ?? existingAthlete?.isPublic ?? true,
    isFeatured: student.isFeatured ?? existingAthlete?.isFeatured ?? false,
    achievements: existingAthlete?.achievements || [],
    pointsHistory: existingAthlete?.pointsHistory || [],
    pointsBalance: existingAthlete?.pointsBalance || 0,
    pointsLifetime: existingAthlete?.pointsLifetime || 0,
  })
}
