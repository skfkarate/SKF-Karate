/**
 * Google Sheets Sync Documentation
 *
 * Source: lib/server/sheets.ts (878 lines)
 * Auth: Google Service Account (GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY)
 * Spreadsheet: GOOGLE_SHEET_ID env var
 *
 * ═══════════════════════════════════════════
 * COLUMN MAPPING — every Sheets tab and its field mapping
 * ═══════════════════════════════════════════
 */

/** Students tab — A:K */
export const STUDENTS_COLUMN_MAP = {
  A: 'skfId',
  B: 'name',
  C: 'branch',
  D: 'batch',
  E: 'belt',
  F: 'parentName',
  G: 'phone',
  H: 'status',         // 'Active' | 'Inactive'
  I: 'enrolledDate',
  J: 'monthlyFee',     // number
  K: 'photoConsent',   // 'Yes' | 'No' → boolean
} as const

/** Fees tab — A:I (note: col I in sheets = index 8) */
export const FEES_COLUMN_MAP = {
  A: 'skfId',
  B: 'month',
  C: 'year',            // number
  D: 'amount',           // number
  E: 'status',           // 'paid' | 'due' | 'overdue'
  F: 'paidDate',
  G: 'receiptId',
  H: 'paymentMethod',    // Razorpay payment ID
} as const

/** Videos tab — A:K */
export const VIDEOS_COLUMN_MAP = {
  A: 'videoId',
  B: 'title',
  C: 'youtubeUrl',       // NEVER sent to client — server only
  D: 'branch',
  E: 'batch',
  F: 'section',
  G: 'beltLevel',
  H: 'unlockDate',
  I: 'locked',           // 'TRUE' | 'FALSE' → boolean
  J: 'durationMin',      // number
} as const

/** Tournaments tab — A:F */
export const TOURNAMENTS_COLUMN_MAP = {
  A: 'skfId',
  B: 'tournamentName',
  C: 'date',
  D: 'category',
  E: 'medal',            // 'Gold' | 'Silver' | 'Bronze' | 'Participant'
  F: 'points',           // number
} as const

/** Attendance tab — A:D */
export const ATTENDANCE_COLUMN_MAP = {
  A: 'skfId',
  B: 'date',
  C: 'status',           // 'Present' | 'Absent' | 'Leave'
  D: 'markedBy',
} as const

/** Announcements tab — A:G */
export const ANNOUNCEMENTS_COLUMN_MAP = {
  A: 'slug',
  B: 'title',
  C: 'body',
  D: 'branch',           // 'ALL' for global
  E: 'publishedDate',
  F: 'expiryDate',
  G: 'author',
} as const

/** Techniques tab — A:H */
export const TECHNIQUES_COLUMN_MAP = {
  A: 'videoId',
  B: 'title',
  C: 'youtubeUrl',       // Converted to embed URL in code
  D: 'category',
  E: 'beltLevel',
  F: 'durationMin',      // number
  G: 'description',
  H: 'featured',         // 'YES' | 'NO' → boolean
} as const

/** Timetables tab — A:F */
export const TIMETABLES_COLUMN_MAP = {
  A: 'branch',
  B: 'month',
  C: 'year',
  D: 'imageUrl',
  E: 'uploadedBy',
  F: 'uploadedAt',
} as const

/** Sponsors tab — A:G (starts at A2, no header row) */
export const SPONSORS_COLUMN_MAP = {
  A: 'name',
  B: 'logoUrl',
  C: 'website',
  D: 'tier',             // 'Gold' | 'Silver' | 'Bronze'
  E: 'active',           // 'YES' | 'NO' → boolean
  F: 'since',
  G: 'description',
} as const

/** Orders tab — A:I */
export const ORDERS_COLUMN_MAP = {
  A: 'orderId',
  B: 'skfId',
  C: 'itemsJson',
  D: 'total',             // number
  E: 'discount',           // number
  F: 'pointsUsed',         // number
  G: 'date',
  H: 'status',
  I: 'addressJson',
} as const

/** Leads tab — A:H (write-only) */
export const LEADS_COLUMN_MAP = {
  A: 'name',
  B: 'phone',
  C: 'email',
  D: 'branch',
  E: 'source',
  F: 'date',
  G: 'notes',
  H: 'status',
} as const

/** Summer Camp Enrollments tab — A:K (read/write) */
export const SUMMER_CAMP_ENROLLMENTS_COLUMN_MAP = {
  A: 'skfId',
  // Columns B-K vary — see submitSummerCampEnrollment in sheets.ts
} as const

/** SummerCamp tab — A:F */
export const SUMMER_CAMP_CONFIG_COLUMN_MAP = {
  A: 'branch',
  B: 'registrationOpen',  // 'YES' | 'NO' → boolean
  C: 'priceMonth1',       // number
  D: 'priceMonth2',       // number
  E: 'priceFull',          // number
  F: 'availableSlots',     // number
} as const

/**
 * DATA FLOW DIRECTION SUMMARY
 *
 * Read-only from Sheets (app never writes back):
 *   - Videos
 *   - Tournaments (per-student results)
 *   - Announcements
 *   - Techniques
 *   - Sponsors
 *
 * Read/Write (app reads AND writes):
 *   - Students (createStudent, updateStudent, deactivateStudent)
 *   - Fees (markFeeAsPaid)
 *   - Attendance (markAttendance)
 *   - Timetables (upsertTimetable)
 *   - Orders (createShopOrder, updateShopOrderStatus)
 *   - Summer Camp Enrollments (submitSummerCampEnrollment)
 *   - SummerCamp config (decrementSummerCampSlots)
 *
 * Write-only (app writes, never reads back):
 *   - Leads (submitLead)
 *   - Contact form (submitContactForm — writes to default sheet)
 *
 * IMPORTANT: Sheets is the authoritative source for Student identity.
 * If Sheets is unavailable, sheets.ts falls back to local athletes.json.
 */
export const SHEETS_DATA_FLOW = {
  readonly:  ['Videos', 'Tournaments', 'Announcements', 'Techniques', 'Sponsors'],
  readwrite: ['Students', 'Fees', 'Attendance', 'Timetables', 'Orders', 'Summer Camp Enrollments', 'SummerCamp'],
  writeonly: ['Leads', 'ContactForm'],
} as const
