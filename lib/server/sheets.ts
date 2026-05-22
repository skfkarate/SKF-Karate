import { google } from 'googleapis'
import { unstable_cache } from 'next/cache'
import type { 
  Student, FeeRow, VideoRow, TournamentResult, AttendanceRow, Announcement, Belt
} from '@/types'
import { logger } from '@/src/server/lib/logger'

type SheetCell = string | number | boolean | null | undefined
type SheetRow = SheetCell[]
type CachedAsyncFn<Args extends unknown[], Result> = (...args: Args) => Promise<Result>

type LiveAthlete = {
  skfId?: string
  firstName?: string
  lastName?: string
  branchName?: string
  batch?: string
  currentBelt?: string
  parentName?: string
  phone?: string
  status?: string
  joinDate?: string
  monthlyFee?: number | string
  photoConsent?: boolean
  dateOfBirth?: string
}

type EnrollmentSummary = {
  id: string
  type: 'enrollment' | 'certificate'
  title: string
  date: string
}

type AdminVideoRow = VideoRow & {
  youtubeUrl: string
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
})

async function getSheets() {
  return google.sheets({ version: 'v4', auth })
}

function cellText(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

function normalizeSheetDob(value: unknown): string | undefined {
  const text = cellText(value).trim()
  if (!text) return undefined

  const dmy = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (dmy) return normalizeDateParts(dmy[3], dmy[2], dmy[1]) || text

  const ymd = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (ymd) return normalizeDateParts(ymd[1], ymd[2], ymd[3]) || text

  return text
}

function normalizeDateParts(year: string, month: string, day: string): string | undefined {
  const paddedMonth = month.padStart(2, '0')
  const paddedDay = day.padStart(2, '0')
  const parsed = new Date(`${year}-${paddedMonth}-${paddedDay}T00:00:00.000Z`)

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== Number(year) ||
    parsed.getUTCMonth() + 1 !== Number(paddedMonth) ||
    parsed.getUTCDate() !== Number(paddedDay)
  ) {
    return undefined
  }

  return `${year}-${paddedMonth}-${paddedDay}`
}

function sheetDataStartIndex<T extends unknown[]>(rows: T[]): number {
  const firstCell = cellText(rows[0]?.[0]).trim().toLowerCase()
  return firstCell.startsWith('skf karate') ? 2 : 1
}

function sheetDataRows<T extends unknown[]>(rows: T[]): T[] {
  return rows.slice(sheetDataStartIndex(rows))
}

function sheetDataRowsWithSheetIndex<T extends unknown[]>(rows: T[]): Array<{ row: T; sheetRow: number }> {
  const startIndex = sheetDataStartIndex(rows)
  return rows.slice(startIndex).map((row, index) => ({
    row,
    sheetRow: startIndex + index + 1,
  }))
}

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!

export interface Sponsor {
  name: string
  logoUrl: string
  website: string
  tier: 'Gold' | 'Silver' | 'Bronze'
  active: boolean
  since: string
  description: string
}

const TIER_ORDER: Record<string, number> = {
  'Gold': 1,
  'Silver': 2,
  'Bronze': 3
}

export async function getAllSkfIds(): Promise<string[]> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:A' })
    const rows = res.data.values || []
    return sheetDataRows(rows).map(r => r[0]).filter(Boolean)
  } catch (error) {
    logger.error('sheets.get_all_skf_ids_failed', { error })
    return []
  }
}

// Helper for caching reads
const cacheRead = <Args extends unknown[], Result>(
  fn: CachedAsyncFn<Args, Result>,
  keyParts: string[],
  revalidate: number
) => {
  return unstable_cache(fn, keyParts, { revalidate }) as CachedAsyncFn<Args, Result>
}

// ── STUDENTS ──
/**
 * Reads "Students" tab, finds by SKF_ID column.
 */
export const getStudentBySkfId = cacheRead(async (skfId: string): Promise<Student | null> => {
  const { getAthleteBySkfIdLive } = await import('@/lib/server/repositories/athletes-live')
  try {
    const localAthlete = await getAthleteBySkfIdLive(skfId)
    
    if (localAthlete) {
      return {
        skfId: localAthlete.skfId,
        name: `${localAthlete.firstName} ${localAthlete.lastName}`.trim(),
        branch: localAthlete.branchName || 'Sunkadakatte',
        batch: localAthlete.batch || 'Evening',
        belt: localAthlete.currentBelt || 'white',
        parentName: localAthlete.parentName || 'Parent',
        phone: localAthlete.phone || '9999999999',
        status: localAthlete.status === 'active' ? 'Active' : 'Inactive',
        enrolledDate: localAthlete.joinDate || '2022-01-01',
        monthlyFee: localAthlete.monthlyFee ? Number(localAthlete.monthlyFee) : 1500,
        photoConsent: localAthlete.photoConsent !== false,
        dob: localAthlete.dateOfBirth
      } as Student
    }
  } catch (error) {
    logger.warn('sheets.get_student_by_skf_id_failed', { skfId, error })
  }

  return null
}, ['getStudentBySkfId'], 60)

/**
 * Filters Students by Branch column.
 */
export const getAllStudents = cacheRead(async (): Promise<Student[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:L' })
    const rows = res.data.values || []
    return sheetDataRows(rows).map(row => ({
      skfId: row[0],
      name: row[1],
      branch: row[2],
      batch: row[3],
      belt: row[4],
      parentName: row[5],
      phone: row[6],
      status: row[7],
      enrolledDate: row[8],
      monthlyFee: Number(row[9] || 0),
      photoConsent: row[10] === 'Yes',
      dob: normalizeSheetDob(row[11])
    } as Student))
  } catch (error) {
    logger.error('sheets.get_all_students_failed', { error })
    const { getAllAthletesLive } = await import('@/lib/server/repositories/athletes-live')
    const athletes = (await getAllAthletesLive()) as LiveAthlete[]
    return athletes.map((athlete) => ({
      skfId: athlete.skfId,
      name: `${athlete.firstName} ${athlete.lastName}`.trim(),
      branch: athlete.branchName || 'M P Sports Club',
      batch: athlete.batch || 'Evening',
      belt: (athlete.currentBelt || 'white') as Belt,
      parentName: athlete.parentName || '',
      phone: athlete.phone || '',
      status: athlete.status === 'inactive' ? 'Inactive' : 'Active',
      enrolledDate: athlete.joinDate || '',
      monthlyFee: Number(athlete.monthlyFee || 0),
      photoConsent: athlete.photoConsent ?? true,
      dob: athlete.dateOfBirth || undefined,
    }))
  }
}, ['getAllStudents'], 60)

export const getStudentsByBranch = cacheRead(async (branch: string): Promise<Student[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:L' })
    const rows = res.data.values || []
    // Skip header row
    return sheetDataRows(rows).filter(r => r[2] === branch).map(row => ({
      skfId: row[0],
      name: row[1],
      branch: row[2],
      batch: row[3],
      belt: row[4],
      parentName: row[5],
      phone: row[6],
      status: row[7],
      enrolledDate: row[8],
      monthlyFee: Number(row[9] || 0),
      photoConsent: row[10] === 'Yes',
      dob: normalizeSheetDob(row[11])
    } as Student))
  } catch (error) {
    logger.error('sheets.get_students_by_branch_failed', { branch, error })
    const { getAllAthletesLive } = await import('@/lib/server/repositories/athletes-live')
    const athletes = (await getAllAthletesLive()) as LiveAthlete[]
    return athletes
      .filter((athlete) => athlete.branchName === branch)
      .map((athlete) => ({
        skfId: athlete.skfId,
        name: `${athlete.firstName} ${athlete.lastName}`.trim(),
        branch: athlete.branchName || '',
        batch: athlete.batch || 'Evening',
        belt: (athlete.currentBelt || 'white') as Belt,
        parentName: athlete.parentName || '',
        phone: athlete.phone || '',
        status: athlete.status === 'inactive' ? 'Inactive' : 'Active',
        enrolledDate: athlete.joinDate || '',
        monthlyFee: Number(athlete.monthlyFee || 0),
        photoConsent: athlete.photoConsent ?? true,
        dob: athlete.dateOfBirth || undefined,
      }))
  }
}, ['getStudentsByBranch'], 60)

/**
 * Filters Students by Phone column for parent multi-child portal access.
 */
export const getStudentsByPhone = cacheRead(async (phone: string): Promise<Student[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:L' })
    const rows = res.data.values || []
    return sheetDataRows(rows).filter(r => r[6] === phone).map(row => ({
      skfId: row[0],
      name: row[1],
      branch: row[2],
      batch: row[3],
      belt: row[4],
      parentName: row[5],
      phone: row[6],
      status: row[7],
      enrolledDate: row[8],
      monthlyFee: Number(row[9] || 0),
      photoConsent: row[10] === 'Yes',
      dob: normalizeSheetDob(row[11])
    } as Student))
  } catch (error) {
    logger.error('sheets.get_students_by_phone_failed', { phone, error })
    const { getAllAthletesLive } = await import('@/lib/server/repositories/athletes-live')
    const athletes = (await getAllAthletesLive()) as LiveAthlete[]
    return athletes
      .filter((athlete) => athlete.phone === phone)
      .map((athlete) => ({
        skfId: athlete.skfId,
        name: `${athlete.firstName} ${athlete.lastName}`.trim(),
        branch: athlete.branchName || '',
        batch: athlete.batch || 'Evening',
        belt: (athlete.currentBelt || 'white') as Belt,
        parentName: athlete.parentName || '',
        phone: athlete.phone || '',
        status: athlete.status === 'inactive' ? 'Inactive' : 'Active',
        enrolledDate: athlete.joinDate || '',
        monthlyFee: Number(athlete.monthlyFee || 0),
        photoConsent: athlete.photoConsent ?? true,
        dob: athlete.dateOfBirth || undefined,
      }))
  }
}, ['getStudentsByPhone'], 60)

// ── FEES ──
/**
 * Reads "Fees" tab, all rows where SKF_ID matches.
 */
export const getFeesBySkfId = cacheRead(async (skfId: string): Promise<FeeRow[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Fees!A:I' })
    const rows = res.data.values || []
    return sheetDataRows(rows).filter(r => r[0] === skfId).map(row => ({
      skfId: row[0],
      month: row[1],
      year: Number(row[2]),
      amount: Number(row[3]),
      status: row[4] as FeeRow['status'],
      paidDate: row[5],
      receiptId: row[6],
      paymentMethod: row[7]
    }))
  } catch (error) {
    logger.error('sheets.get_fees_by_skf_id_failed', { skfId, error })
    return []
  }
}, ['getFeesBySkfId'], 30)

function mapFeeRow(row: SheetRow): FeeRow {
  return {
    skfId: cellText(row[0]),
    month: cellText(row[1]),
    year: Number(row[2]),
    amount: Number(row[3]),
    status: row[4] as FeeRow['status'],
    paidDate: cellText(row[5]),
    receiptId: cellText(row[6]),
    paymentMethod: cellText(row[7])
  }
}

async function getFeeRowsWithSheetIndex(): Promise<Array<{ row: SheetRow; sheetRow: number; fee: FeeRow }>> {
  const sheets = await getSheets()
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Fees!A:I' })
  const rows = res.data.values || []
  return sheetDataRowsWithSheetIndex(rows).map(({ row, sheetRow }) => ({
    row,
    sheetRow,
    fee: mapFeeRow(row)
  }))
}

export async function getFeesBySkfIdLive(skfId: string, year?: number): Promise<FeeRow[]> {
  const fees = await getFeesBySkfId(skfId)
  return Number.isFinite(Number(year))
    ? fees.filter((row) => row.year === Number(year))
    : fees
}

export async function getAllFeesLive(year?: number): Promise<FeeRow[]> {
  try {
    const rows = await getFeeRowsWithSheetIndex()
    return rows
      .map((entry) => entry.fee)
      .filter((row) => (Number.isFinite(Number(year)) ? row.year === Number(year) : true))
  } catch (error) {
    logger.error('sheets.get_all_fees_live_failed', { error })
    return []
  }
}

export async function findFeeByReceiptIdLive(receiptId: string): Promise<FeeRow | null> {
  try {
    const normalizedReceiptId = String(receiptId || '').trim()
    if (!normalizedReceiptId) return null

    const rows = await getFeeRowsWithSheetIndex()
    return rows.find((entry) => String(entry.fee.receiptId || '').trim() === normalizedReceiptId)?.fee || null
  } catch (error) {
    logger.error('sheets.find_fee_by_receipt_id_failed', { receiptId, error })
    return null
  }
}

export async function ensureFeeRowsForStudent(
  skfId: string,
  options: {
    monthlyFee: number
    enrolledDate?: string
    year: number
    overwriteAmount?: boolean
  }
): Promise<{ created: number; updated: number }> {
  try {
    const normalizedSkfId = String(skfId || '').trim().toUpperCase()
    const year = Number(options.year || new Date().getFullYear())
    if (!normalizedSkfId || !year) return { created: 0, updated: 0 }

    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    const enrolledAt = options.enrolledDate ? new Date(options.enrolledDate) : null
    const startMonth =
      enrolledAt && Number.isFinite(enrolledAt.getTime()) && enrolledAt.getFullYear() === year
        ? enrolledAt.getMonth()
        : 0
    const existingRows = await getFeeRowsWithSheetIndex()
    const existingByMonth = new Map(
      existingRows
        .filter((entry) => entry.fee.skfId === normalizedSkfId && entry.fee.year === year)
        .map((entry) => [entry.fee.month, entry])
    )

    let created = 0
    let updated = 0
    const sheets = await getSheets()

    for (let index = startMonth; index < months.length; index++) {
      const month = months[index]
      const existing = existingByMonth.get(month)

      if (!existing) {
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: 'Fees!A:I',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[normalizedSkfId, month, year, options.monthlyFee || 0, 'due', '', '', '', new Date().toISOString()]]
          }
        })
        created++
        continue
      }

      if (options.overwriteAmount && Number(existing.fee.amount || 0) !== Number(options.monthlyFee || 0)) {
        const nextRow = [...existing.row]
        nextRow[3] = options.monthlyFee || 0
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `Fees!A${existing.sheetRow}:I${existing.sheetRow}`,
          valueInputOption: 'USER_ENTERED',
          requestBody: { values: [nextRow] }
        })
        updated++
      }
    }

    return { created, updated }
  } catch (error) {
    logger.error('sheets.ensure_fee_rows_for_student_failed', { skfId, year: options.year, error })
    return { created: 0, updated: 0 }
  }
}

/**
 * Writes to Fees tab — finds row by SKF_ID + Month, updates Status to 'paid'.
 */
export async function markFeeAsPaid(skfId: string, month: string, receiptId: string, paymentId: string, year?: number): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Fees!A:I' })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === skfId && r[1] === month && (!year || Number(r[2]) === Number(year)))
    if (rowIndex === -1) return false
    
    // Row index for updates is 1-based, rowIndex is 0-based.
    const range = `Fees!A${rowIndex + 1}:H${rowIndex + 1}`
    const updatedRow = [...rows[rowIndex]]
    updatedRow[4] = 'paid'
    updatedRow[5] = new Date().toISOString()
    updatedRow[6] = receiptId
    updatedRow[7] = paymentId

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] }
    })
    return true
  } catch (error) {
    logger.error('sheets.mark_fee_as_paid_failed', { skfId, month, receiptId, error })
    return false
  }
}

export async function markFeeStatus(
  skfId: string,
  month: string,
  year: number,
  updates: Partial<Pick<FeeRow, 'status' | 'paidDate' | 'receiptId' | 'paymentMethod'>>
): Promise<boolean> {
  try {
    const rows = await getFeeRowsWithSheetIndex()
    const entry = rows.find((candidate) =>
      candidate.fee.skfId === skfId &&
      candidate.fee.month === month &&
      candidate.fee.year === Number(year)
    )
    if (!entry) return false

    const nextRow = [...entry.row]
    if (updates.status !== undefined) nextRow[4] = updates.status
    if (updates.paidDate !== undefined) nextRow[5] = updates.paidDate
    if (updates.receiptId !== undefined) nextRow[6] = updates.receiptId
    if (updates.paymentMethod !== undefined) nextRow[7] = updates.paymentMethod

    const sheets = await getSheets()
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Fees!A${entry.sheetRow}:I${entry.sheetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [nextRow] }
    })

    return true
  } catch (error) {
    logger.error('sheets.mark_fee_status_failed', { skfId, month, status, error })
    return false
  }
}

// ── VIDEOS ──
/**
 * Reads "Videos" tab, filters by Branch + Batch. Never includes YouTube_URL.
 */
export const getVideosByBranchAndBatch = cacheRead(async (branch: string, batch: string): Promise<VideoRow[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Videos!A:K' })
    const rows = res.data.values || []
    return sheetDataRows(rows)
      .filter(r => r[3] === branch && r[4] === batch)
      .map(row => ({
        videoId: row[0],
        title: row[1],
        // skip row[2] which is YouTube_URL
        branch: row[3],
        batch: row[4],
        section: row[5],
        beltLevel: row[6] as Belt,
        unlockDate: row[7],
        locked: row[8] === 'TRUE',
        durationMin: Number(row[9])
      }))
  } catch (error) {
    logger.error('sheets.get_videos_by_branch_and_batch_failed', { branch, batch, error })
    return []
  }
}, ['getVideosByBranchAndBatch'], 300)

/**
 * Server-side ONLY — returns the YouTube_URL for a given Video_ID.
 */
export const getVideoUrlById = cacheRead(async (videoId: string): Promise<string | null> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Videos!A:K' })
    const rows = res.data.values || []
    const row = rows.find(r => r[0] === videoId)
    if (!row) return null
    return row[2] // YouTube_URL
  } catch (error) {
    logger.error('sheets.get_video_url_by_id_failed', { videoId, error })
    return null
  }
}, ['getVideoUrlById'], 3600)

// ── TIMETABLES ──
/**
 * Reads "Timetables" tab, returns current month row for this branch.
 */
export const getTimetableByBranch = cacheRead(async (branch: string): Promise<{ imageUrl: string; month: string; year: number } | null> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Timetables!A:F' })
    const rows = res.data.values || []
    
    // Simplistic current month logic 
    const d = new Date()
    const currentMonth = d.toLocaleString('en-US', { month: 'long' })
    const currentYear = d.getFullYear()
    
    const row = rows.find(r => r[0] === branch && r[1] === currentMonth && Number(r[2]) === currentYear)
    if (!row) return null
    return {
      imageUrl: row[3],
      month: row[1],
      year: Number(row[2])
    }
  } catch (error) {
    logger.error('sheets.get_timetable_by_branch_failed', { branch, error })
    return null
  }
}, ['getTimetableByBranch'], 3600)

// ── TOURNAMENTS ──
export const getTournamentsBySkfId = cacheRead(async (skfId: string): Promise<TournamentResult[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Tournaments!A:F' })
    const rows = res.data.values || []
    return sheetDataRows(rows).filter(r => r[0] === skfId).map(row => ({
      skfId: row[0],
      tournamentName: row[1],
      date: row[2],
      category: row[3],
      medal: row[4] as TournamentResult['medal'],
      points: Number(row[5])
    }))
  } catch (error) {
    logger.error('sheets.get_tournaments_by_skf_id_failed', { skfId, error })
    return []
  }
}, ['getTournamentsBySkfId'], 300)

// ── ENROLLMENTS (CERTIFICATES) ──
export const getEnrollmentsBySkfId = cacheRead(async (skfId: string): Promise<EnrollmentSummary[]> => {
  try {
    const sheets = await getSheets()
    // Simulated read from a hypothetical Enrollments sheet
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Summer Camp Enrollments!A:K' }).catch(() => ({ data: { values: [] } }))
    const rows = res.data.values || []
    const mapped: EnrollmentSummary[] = sheetDataRows(rows).filter(r => r[0] === skfId).map(row => ({
      id: String(row[0]),
      type: 'enrollment',
      title: 'Summer Camp 2026',
      date: String(row[2] || new Date().toISOString())
    }))
    // Return mock cert if empty
    return mapped.length > 0 ? mapped : [
      { id: '1', type: 'certificate', title: 'Yellow Belt Certification', date: '2025-10-15' },
      { id: '2', type: 'certificate', title: 'Elite Kumite Workshop', date: '2025-12-05' }
    ]
  } catch (error) {
    logger.error('sheets.get_enrollments_by_skf_id_failed', { skfId, error })
    return []
  }
}, ['getEnrollmentsBySkfId'], 300)

// ── ATTENDANCE ──
export const getAttendanceBySkfId = cacheRead(async (skfId: string, month: string): Promise<AttendanceRow[]> => {
  try {
    // Basic implementation reading from Attendance tab
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Attendance!A:D' })
    const rows = res.data.values || []
    return sheetDataRows(rows).filter(r => r[0] === skfId && r[1].includes(month)).map(row => ({
      skfId: row[0],
      date: row[1],
      status: row[2] as AttendanceRow['status'],
      markedBy: row[3]
    }))
  } catch (error) {
    logger.error('sheets.get_attendance_by_skf_id_failed', { skfId, error })
    return []
  }
}, ['getAttendanceBySkfId'], 60)

export async function markAttendance(rows: AttendanceRow[]): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const values = rows.map(r => [r.skfId, r.date, r.status, r.markedBy || 'System'])
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Attendance!A:D',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    })
    return true
  } catch (error) {
    logger.error('sheets.mark_attendance_failed', { count: rows.length, error })
    return false
  }
}

// ── ADMIN WRITES ──
export async function createStudent(student: Omit<Student, 'skfId'> & { skfId: string }): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const values = [[
      student.skfId, student.name, student.branch, student.batch, student.belt,
      student.parentName, student.phone, student.status, student.enrolledDate,
      student.monthlyFee, student.photoConsent ? 'Yes' : 'No', student.dob || ''
    ]]
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Students!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    })
    return true
  } catch (error) {
    logger.error('sheets.create_student_failed', { skfId: student.skfId, error })
    return false
  }
}

export async function updateStudent(skfId: string, updates: Partial<Student>): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Students!A:L' })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === skfId)
    if (rowIndex === -1) return false
    
    const row = rows[rowIndex]
    while (row.length < 12) row.push('')
    // apply updates manually based on index
    if (updates.name !== undefined) row[1] = updates.name
    if (updates.branch !== undefined) row[2] = updates.branch
    if (updates.batch !== undefined) row[3] = updates.batch
    if (updates.belt !== undefined) row[4] = updates.belt
    if (updates.parentName !== undefined) row[5] = updates.parentName
    if (updates.phone !== undefined) row[6] = updates.phone
    if (updates.status !== undefined) row[7] = updates.status
    if (updates.enrolledDate !== undefined) row[8] = updates.enrolledDate
    if (updates.monthlyFee !== undefined) row[9] = updates.monthlyFee.toString()
    if (updates.photoConsent !== undefined) row[10] = updates.photoConsent ? 'Yes' : 'No'
    if (updates.dob !== undefined) row[11] = updates.dob

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Students!A${rowIndex + 1}:L${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return true
  } catch (error) {
    logger.error('sheets.update_student_failed', { skfId, error })
    return false
  }
}

export async function deactivateStudent(skfId: string): Promise<boolean> {
  return updateStudent(skfId, { status: 'Inactive' })
}

// ── VIDEOS (ADMIN) ──
export async function getVideosByBranch(branch: string): Promise<AdminVideoRow[]> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Videos!A:K' })
    const rows = res.data.values || []
    return sheetDataRows(rows).filter(r => r[3] === branch).map(row => ({
        videoId: row[0],
        title: row[1],
        // admin panel needs url, so we do include it here safely (since admin role verified in api)
        branch: row[3],
        batch: row[4],
        section: row[5],
        beltLevel: row[6] as Belt,
        unlockDate: row[7],
        locked: row[8] === 'TRUE',
        durationMin: Number(row[9]),
        youtubeUrl: row[2] // Admin specific
    }))
  } catch (error) {
    logger.error('sheets.get_videos_by_branch_failed', { branch, error })
    return []
  }
}

// ── TIMETABLES (ADMIN) ──
export async function upsertTimetable(branch: string, imageUrl: string): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Timetables!A:F' })
    const rows = res.data.values || []
    
    const d = new Date()
    const currentMonth = d.toLocaleString('en-US', { month: 'long' })
    const currentYear = d.getFullYear().toString()
    
    const rowIndex = rows.findIndex(r => r[0] === branch && r[1] === currentMonth && r[2] === currentYear)
    
    const newRow = [branch, currentMonth, currentYear, imageUrl, 'Admin', d.toISOString()]

    if (rowIndex === -1) {
      // append
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Timetables!A:F',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] }
      })
    } else {
      // replace
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Timetables!A${rowIndex + 1}:F${rowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [newRow] }
      })
    }
    return true
  } catch (error) {
    logger.error('sheets.upsert_timetable_failed', { branch, error })
    return false
  }
}

// ── ANNOUNCEMENTS ──
export const getAnnouncements = cacheRead(async (branch?: string): Promise<Announcement[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Announcements!A:G' })
    const rows = res.data.values || []
    const today = new Date()

    return sheetDataRows(rows).map(row => ({
      slug: row[0],
      title: row[1],
      body: row[2],
      branch: row[3],
      publishedDate: row[4],
      expiryDate: row[5],
      author: row[6]
    })).filter(a => {
      const isExpired = new Date(a.expiryDate) < today
      if (isExpired) return false
      if (branch && a.branch !== 'ALL' && a.branch !== branch) return false
      return true
    })
  } catch (error) {
    logger.error('sheets.get_announcements_failed', { branch, error })
    return []
  }
}, ['getAnnouncements'], 60)

export const getAnnouncementBySlug = async (slug: string): Promise<Announcement | null> => {
  const all = await getAnnouncements()
  return all.find(a => a.slug === slug) || null
}

// ── TECHNIQUE VIDEOS ──
export interface TechniqueVideo {
  videoId: string
  title: string
  youtubeUrl: string
  category: string
  beltLevel: string
  durationMin: number
  description: string
  featured: boolean
}

export const getTechniqueVideos = cacheRead(async (beltLevel?: string, category?: string): Promise<TechniqueVideo[]> => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Techniques!A:H' })
    const rows = res.data.values || []
    
    // Video_ID | Title | YouTube_URL | Category | Belt_Level | Duration_Min | Description | Featured
    const mapped = sheetDataRows(rows).map(row => {
      // Convert standard URL to embed
      let embedUrl = row[2] || ''
      if (embedUrl.includes('youtube.com/watch?v=')) {
          const vId = new URL(embedUrl).searchParams.get('v')
          if (vId) embedUrl = `https://www.youtube.com/embed/${vId}?rel=0&modestbranding=1`
      } else if (embedUrl.includes('youtu.be/')) {
          const vId = embedUrl.split('youtu.be/')[1]
          if (vId) embedUrl = `https://www.youtube.com/embed/${vId.split('?')[0]}?rel=0&modestbranding=1`
      }

      return {
        videoId: row[0],
        title: row[1],
        youtubeUrl: embedUrl,
        category: (row[3] || '').trim(),
        beltLevel: (row[4] || '').trim(),
        durationMin: Number(row[5]) || 0,
        description: row[6] || '',
        featured: (row[7] || '').toUpperCase() === 'YES'
      }
    })

    return mapped.filter(v => {
      if (beltLevel && v.beltLevel.toLowerCase() !== beltLevel.toLowerCase()) return false
      if (category && v.category.toLowerCase() !== category.toLowerCase()) return false
      return true
    })

  } catch (error) {
    logger.error('sheets.get_technique_videos_failed', { beltLevel, category, error })
    return []
  }
}, ['getTechniqueVideos'], 3600)

// ── EXTERNAL FORMS ──
export async function submitContactForm(row: SheetRow): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const sheetId = process.env.GOOGLE_SHEET_ID || SPREADSHEET_ID
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return true
  } catch (error) {
    logger.error('sheets.submit_contact_form_failed', { error })
    return false
  }
}

export async function getSponsors(): Promise<Sponsor[]> {
  try {
    const sheets = await getSheets()
    const sheetId = process.env.GOOGLE_SHEET_ID!

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: 'Sponsors!A2:G',
    })

    const rows = res.data.values || []
    const sponsors: Sponsor[] = rows.map(row => ({
      name: row[0] || '',
      logoUrl: row[1] || '',
      website: row[2] || '',
      tier: (row[3] || 'Bronze') as 'Gold' | 'Silver' | 'Bronze',
      active: (row[4] || '').toUpperCase() === 'YES',
      since: row[5] || '',
      description: row[6] || ''
    }))

    return sponsors
      .filter(s => s.active)
      .sort((a, b) => (TIER_ORDER[a.tier] || 99) - (TIER_ORDER[b.tier] || 99))
  } catch (error) {
    logger.error('sheets.get_sponsors_failed', { error })
    return []
  }
}

export async function submitLead(row: string[]): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const sheetId = process.env.GOOGLE_SHEET_ID!
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Leads!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return true
  } catch (error) {
    logger.error('sheets.submit_lead_failed', { error })
    return false
  }
}

export async function submitSummerCampEnrollment(row: SheetRow): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const sheetId = process.env.GOOGLE_SHEET_ID_SUMMER_CAMP || SPREADSHEET_ID
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Summer Camp Enrollments!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return true
  } catch (error) {
    logger.error('sheets.submit_summer_camp_enrollment_failed', { error })
    return false
  }
}

// ── SUMMER CAMP DATA ──
export const getSummerCampByBranch = cacheRead(async (branch: string) => {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'SummerCamp!A:F' }).catch(() => ({ data: { values: [] } }))
    const rows = res.data.values || []
    
    // Assumption: [Branch, Registration_Open, Month1_Price, Month2_Price, FullCamp_Price, Available_Slots]
    const row = sheetDataRows(rows).find((r: SheetRow) => r[0] === branch)
    if (!row) {
      // Mock Fallback
      return {
        branch,
        registrationOpen: true,
        priceMonth1: 1500,
        priceMonth2: 1200,
        priceFull: 2500,
        availableSlots: 20
      }
    }
    
    return {
      branch: row[0],
      registrationOpen: row[1]?.toUpperCase() === 'YES',
      priceMonth1: Number(row[2]) || 1500,
      priceMonth2: Number(row[3]) || 1200,
      priceFull: Number(row[4]) || 2500,
      availableSlots: Number(row[5]) || 0
    }
  } catch (error) {
    logger.error('sheets.get_summer_camp_by_branch_failed', { branch, error })
    return {
      branch,
      registrationOpen: true,
      priceMonth1: 1500,
      priceMonth2: 1200,
      priceFull: 2500,
      availableSlots: 20
    }
  }
}, ['getSummerCampByBranch'], 60)

export async function decrementSummerCampSlots(branch: string): Promise<boolean> {
  try {
    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'SummerCamp!A:F' })
    const rows = res.data.values || []
    const rowIndex = rows.findIndex(r => r[0] === branch)
    if (rowIndex === -1) return false
    
    const row = rows[rowIndex]
    const currentSlots = Number(row[5])
    if (currentSlots <= 0) return false
    
    // decrement slots
    row[5] = String(currentSlots - 1)

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `SummerCamp!A${rowIndex + 1}:F${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    })
    return true
  } catch (error) {
    logger.error('sheets.decrement_summer_camp_slots_failed', { branch, error })
    return false
  }
}

// ----------------------------------------------------------------------
// Shop E-Commerce / Orders Logic
// ----------------------------------------------------------------------

export interface ShopOrder {
    orderId: string
    skfId: string
    itemsJson: string
    total: number
    discount: number
    pointsUsed: number
    date: string
    status: string
    addressJson: string
}

export async function createShopOrder(order: ShopOrder): Promise<boolean> {
    try {
        const sheets = await getSheets()
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Orders!A:I',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [[
                    order.orderId,
                    order.skfId,
                    order.itemsJson,
                    order.total,
                    order.discount,
                    order.pointsUsed,
                    order.date,
                    order.status,
                    order.addressJson
                ]]
            }
        })
        return true
  } catch (error) {
    logger.error('sheets.shop_order_create_failed', { orderId: order.orderId, error })
    return false
  }
}

export const getShopOrdersBySkfId = cacheRead(async (skfId: string): Promise<ShopOrder[]> => {
    try {
        const sheets = await getSheets()
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Orders!A:I' })
        const rows = res.data.values || []
        
        return sheetDataRows(rows)
            .filter(r => r[1]?.toUpperCase() === skfId.toUpperCase())
            .map(row => ({
                orderId: row[0],
                skfId: row[1],
                itemsJson: row[2],
                total: Number(row[3]),
                discount: Number(row[4] || 0),
                pointsUsed: Number(row[5] || 0),
                date: row[6],
                status: row[7],
                addressJson: row[8]
            }))
    } catch (e) {
        logger.error('sheets.shop_orders_by_skf_id_failed', { skfId, error: e })
        return []
    }
}, ['shopOrdersBySkfId'], 15)

export const getAllShopOrders = cacheRead(async (): Promise<ShopOrder[]> => {
    try {
        const sheets = await getSheets()
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Orders!A:I' })
        const rows = res.data.values || []
        
        return sheetDataRows(rows).map(row => ({
            orderId: row[0],
            skfId: row[1],
            itemsJson: row[2],
            total: Number(row[3]),
            discount: Number(row[4] || 0),
            pointsUsed: Number(row[5] || 0),
            date: row[6],
            status: row[7],
            addressJson: row[8]
        }))
    } catch (e) {
        logger.error('sheets.shop_orders_fetch_all_failed', { error: e })
        return []
    }
}, ['allShopOrders'], 15)

export async function updateShopOrderStatus(orderId: string, status: string): Promise<boolean> {
    try {
        const sheets = await getSheets()
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Orders!A:I' })
        const rows = res.data.values || []
        
        const rowIndex = rows.findIndex(row => row[0] === orderId)
        if (rowIndex === -1) return false
        
        // Status is Column H (index 7 => H${rowIndex + 1})
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `Orders!H${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [[status]] }
        })
        return true
    } catch (e) {
        logger.error('sheets.shop_order_status_update_failed', { orderId, status, error: e })
        return false
    }
}
