import { google } from 'googleapis'

// ─── Google Sheets Client ────────────────────────────────────────────────────

let sheetsClient = null

/**
 * Get an authenticated Google Sheets client.
 * Uses service account credentials from environment variables.
 */
function getSheetsClient() {
  if (sheetsClient) return sheetsClient

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetId = process.env.GOOGLE_SHEET_ID

  if (!email || !key || !sheetId) {
    console.warn('[Sheets] Missing Google Sheets credentials. Data features will not work.')
    return null
  }

  const auth = new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/spreadsheets',
  ])

  sheetsClient = google.sheets({ version: 'v4', auth })
  return sheetsClient
}

/**
 * Check if Google Sheets credentials are configured in env.
 */
export function isGoogleSheetsReady() {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID)
}

/**
 * Read a full sheet tab and return as an array of objects.
 * First row is treated as headers.
 * @param {string} tabName — the sheet tab name
 * @returns {Promise<object[]|null>}
 */
async function readSheetTab(tabName) {
  try {
    const sheets = getSheetsClient()
    if (!sheets) return null

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${tabName}!A:Z`,
    })

    const rows = response.data.values
    if (!rows || rows.length < 2) return []

    const headers = rows[0].map(h => h.trim())
    return rows.slice(1).map(row => {
      const obj = {}
      headers.forEach((header, i) => {
        obj[header] = row[i] || ''
      })
      return obj
    })
  } catch (error) {
    console.error(`[Sheets] Error reading tab "${tabName}":`, error.message)
    return null
  }
}

/**
 * Append a row to a sheet tab.
 * @param {string} tabName
 * @param {string[]} values — array of cell values in column order
 */
async function appendToSheet(tabName, values) {
  try {
    const sheets = getSheetsClient()
    if (!sheets) throw new Error('Google Sheets not configured')

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `${tabName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [values] },
    })
  } catch (error) {
    console.error(`[Sheets] Error appending to "${tabName}":`, error.message)
    throw error
  }
}

// ─── Student Functions ───────────────────────────────────────────────────────

/**
 * Get a student by their SKF ID from the Students sheet.
 * @param {string} skfId
 * @returns {Promise<object|null>}
 */
export async function getStudentBySkfId(skfId) {
  try {
    const students = await readSheetTab('Students')
    if (!students) return null

    const normalizedId = skfId.trim().toUpperCase()
    return students.find(s =>
      (s.SKF_ID || s.skf_id || s['SKF ID'] || '').trim().toUpperCase() === normalizedId
    ) || null
  } catch (error) {
    console.error('[Sheets] getStudentBySkfId error:', error.message)
    return null
  }
}

/**
 * Get all students for a specific branch.
 * @param {string} branch
 * @returns {Promise<object[]>}
 */
export async function getStudentsByBranch(branch) {
  try {
    const students = await readSheetTab('Students')
    if (!students) return []

    const normalizedBranch = branch.trim().toLowerCase()
    return students.filter(s =>
      (s.Branch || s.branch || '').trim().toLowerCase() === normalizedBranch
    )
  } catch (error) {
    console.error('[Sheets] getStudentsByBranch error:', error.message)
    return []
  }
}

// ─── Fee Functions ───────────────────────────────────────────────────────────

/**
 * Get fee records for a specific student.
 * @param {string} skfId
 * @returns {Promise<object[]>}
 */
export async function getFeesBySkfId(skfId) {
  try {
    const fees = await readSheetTab('Fees')
    if (!fees) return []

    const normalizedId = skfId.trim().toUpperCase()
    return fees.filter(f =>
      (f.SKF_ID || f.skf_id || f['SKF ID'] || '').trim().toUpperCase() === normalizedId
    )
  } catch (error) {
    console.error('[Sheets] getFeesBySkfId error:', error.message)
    return []
  }
}

/**
 * Mark a fee as paid in the Fees sheet.
 * @param {string} skfId
 * @param {string} month
 * @param {string} receiptId
 */
export async function markFeeAsPaid(skfId, month, receiptId) {
  // TODO: Implement row update in Google Sheets
  // This requires finding the specific row and updating it
  console.log(`[Sheets] markFeeAsPaid: ${skfId}, ${month}, ${receiptId}`)
}

// ─── Timetable Functions ─────────────────────────────────────────────────────

/**
 * Get timetable for a specific branch.
 * Returns the current and recent months' timetable data.
 * @param {string} branch
 * @returns {Promise<object[]>}
 */
export async function getTimetableByBranch(branch) {
  try {
    const timetables = await readSheetTab('Timetables')
    if (!timetables) return []

    const normalizedBranch = branch.trim().toLowerCase()
    return timetables
      .filter(t =>
        (t.Branch || t.branch || '').trim().toLowerCase() === normalizedBranch
      )
      .sort((a, b) => {
        // Sort by Year desc, then Month desc
        const yearA = parseInt(a.Year || a.year || '0')
        const yearB = parseInt(b.Year || b.year || '0')
        if (yearB !== yearA) return yearB - yearA
        const monthA = parseInt(a.Month || a.month || '0')
        const monthB = parseInt(b.Month || b.month || '0')
        return monthB - monthA
      })
  } catch (error) {
    console.error('[Sheets] getTimetableByBranch error:', error.message)
    return []
  }
}

// ─── Video Functions ─────────────────────────────────────────────────────────

/**
 * Get videos for a specific branch and batch.
 * @param {string} branch
 * @param {string} batch
 * @returns {Promise<object[]>}
 */
export async function getVideosByBranchAndBatch(branch, batch) {
  try {
    const videos = await readSheetTab('Videos')
    if (!videos) return []

    const normalizedBranch = branch.trim().toLowerCase()
    return videos.filter(v => {
      const vBranch = (v.Branch || v.branch || '').trim().toLowerCase()
      const vBatch = (v.Batch || v.batch || '').trim().toLowerCase()
      return vBranch === normalizedBranch &&
        (!batch || vBatch === batch.trim().toLowerCase())
    })
  } catch (error) {
    console.error('[Sheets] getVideosByBranchAndBatch error:', error.message)
    return []
  }
}

// ─── Tournament Functions ────────────────────────────────────────────────────

/**
 * Get tournament records for a specific student.
 * @param {string} skfId
 * @returns {Promise<object[]>}
 */
export async function getTournamentsBySkfId(skfId) {
  try {
    const tournaments = await readSheetTab('Tournaments')
    if (!tournaments) return []

    const normalizedId = skfId.trim().toUpperCase()
    return tournaments.filter(t =>
      (t.SKF_ID || t.skf_id || t['SKF ID'] || '').trim().toUpperCase() === normalizedId
    )
  } catch (error) {
    console.error('[Sheets] getTournamentsBySkfId error:', error.message)
    return []
  }
}

// ─── Attendance Functions ────────────────────────────────────────────────────

/**
 * Get attendance records for a student in a specific month.
 * @param {string} skfId
 * @param {string} [month] — format: 'YYYY-MM'
 * @returns {Promise<object[]>}
 */
export async function getAttendanceBySkfId(skfId, month) {
  try {
    const attendance = await readSheetTab('Attendance')
    if (!attendance) return []

    const normalizedId = skfId.trim().toUpperCase()
    return attendance.filter(a => {
      const matchesId = (a.SKF_ID || a.skf_id || a['SKF ID'] || '').trim().toUpperCase() === normalizedId
      if (!matchesId) return false
      if (!month) return true
      const date = a.Date || a.date || ''
      return date.startsWith(month)
    })
  } catch (error) {
    console.error('[Sheets] getAttendanceBySkfId error:', error.message)
    return []
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  readSheetTab,
  appendToSheet,
}
