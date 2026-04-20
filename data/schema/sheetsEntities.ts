import type { EntitySchema } from './types'

/**
 * Schema: student (Google Sheets)
 * Source: /types/index.ts Student interface + lib/server/sheets.ts Students tab
 *
 * IMPORTANT: Student and Athlete are the SAME person.
 * - Student = Sheets row shape (portal/admin view, authoritative for identity)
 * - Athlete = JSON store shape (public profile, achievements, rankings)
 *
 * Sheets columns A:K → skfId, name, branch, batch, belt, parentName, phone, status, enrolledDate, monthlyFee, photoConsent
 */
export const studentSchema: EntitySchema = {
  entity: 'Student',
  tableName: 'Students',
  primaryKey: 'skfId',
  storage: 'sheets',
  fields: {
    skfId:        { type: 'string',  required: true,  unique: true, description: 'Col A. Format: SKF-YYYY-XXXX. Used as login credential.' },
    name:         { type: 'string',  required: true,  description: 'Col B. Full name.' },
    branch:       { type: 'string',  required: true,  description: 'Col C. Branch name (e.g. Sunkadakatte, Rajajinagar).' },
    batch:        { type: 'string',  required: true,  description: 'Col D. Class batch (e.g. Morning, Evening).' },
    belt:         { type: 'enum',    required: true,  enumValues: ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'], description: 'Col E.' },
    parentName:   { type: 'string',  required: true,  description: 'Col F. Guardian name for junior athletes.' },
    phone:        { type: 'string',  required: true,  description: 'Col G. Parent phone number. Used for multi-child portal lookup.' },
    status:       { type: 'enum',    required: true,  enumValues: ['Active', 'Inactive'], description: 'Col H.' },
    enrolledDate: { type: 'date',    required: true,  description: 'Col I. Format: YYYY-MM-DD.' },
    monthlyFee:   { type: 'number',  required: true,  description: 'Col J. Monthly fee in INR.' },
    photoConsent: { type: 'boolean', required: true,  description: 'Col K. Stored as Yes/No in Sheets.' },
  },
  notes: 'Read/write via Google Sheets API (lib/server/sheets.ts). The same person exists as an Athlete in the local JSON store with different fields. Multi-child access is implemented by filtering on phone number (getStudentsByPhone).',
}

/**
 * Schema: feeRow (Google Sheets)
 * Source: /types/index.ts FeeRow + lib/server/sheets.ts Fees tab
 */
export const feeRowSchema: EntitySchema = {
  entity: 'FeeRow',
  tableName: 'Fees',
  primaryKey: 'skfId+month+year',
  storage: 'sheets',
  fields: {
    skfId:         { type: 'string', required: true,  description: 'Col A.' },
    month:         { type: 'string', required: true,  description: 'Col B. Month name.' },
    year:          { type: 'number', required: true,  description: 'Col C.' },
    amount:        { type: 'number', required: true,  description: 'Col D. Amount in INR.' },
    status:        { type: 'enum',   required: true,  enumValues: ['paid', 'due', 'overdue'], description: 'Col E.' },
    paidDate:      { type: 'date',   required: false, description: 'Col F.' },
    receiptId:     { type: 'string', required: false, description: 'Col G.' },
    paymentMethod: { type: 'string', required: false, description: 'Col H. Razorpay payment ID.' },
  },
  notes: 'Read/write via Sheets. markFeeAsPaid writes status=paid + paidDate + receiptId + paymentId.',
}

/**
 * Schema: videoRow (Google Sheets)
 * Source: /types/index.ts VideoRow + lib/server/sheets.ts Videos tab
 */
export const videoRowSchema: EntitySchema = {
  entity: 'VideoRow',
  tableName: 'Videos',
  primaryKey: 'videoId',
  storage: 'sheets',
  fields: {
    videoId:     { type: 'string',  required: true,  description: 'Col A.' },
    title:       { type: 'string',  required: true,  description: 'Col B.' },
    youtubeUrl:  { type: 'string',  required: true,  description: 'Col C. NEVER exposed to client (server-only via getVideoUrlById).' },
    branch:      { type: 'string',  required: true,  description: 'Col D.' },
    batch:       { type: 'string',  required: true,  description: 'Col E.' },
    section:     { type: 'string',  required: true,  description: 'Col F.' },
    beltLevel:   { type: 'enum',    required: true,  enumValues: ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'], description: 'Col G.' },
    unlockDate:  { type: 'date',    required: true,  description: 'Col H.' },
    locked:      { type: 'boolean', required: true,  description: 'Col I. Stored as TRUE/FALSE string in Sheets.' },
    durationMin: { type: 'number',  required: true,  description: 'Col J.' },
  },
  notes: 'Read-only via Sheets. YouTube URL only returned in admin context (getVideosByBranch). Watch progress tracked in Supabase video_progress table.',
}

/**
 * Schema: announcement (Google Sheets)
 * Source: /types/index.ts Announcement + lib/server/sheets.ts Announcements tab
 */
export const announcementSchema: EntitySchema = {
  entity: 'Announcement',
  tableName: 'Announcements',
  primaryKey: 'slug',
  storage: 'sheets',
  fields: {
    slug:          { type: 'string', required: true, description: 'Col A.' },
    title:         { type: 'string', required: true, description: 'Col B.' },
    body:          { type: 'string', required: true, description: 'Col C.' },
    branch:        { type: 'string', required: true, description: 'Col D. "ALL" for global announcements.' },
    publishedDate: { type: 'date',   required: true, description: 'Col E.' },
    expiryDate:    { type: 'date',   required: true, description: 'Col F. Expired announcements are filtered out.' },
    author:        { type: 'string', required: true, description: 'Col G.' },
  },
  notes: 'Read-only via Sheets. Filtered by branch and expiry date.',
}

/**
 * Schema: shopOrder (Google Sheets)
 * Source: lib/server/sheets.ts ShopOrder interface + Orders tab
 */
export const shopOrderSchema: EntitySchema = {
  entity: 'ShopOrder',
  tableName: 'Orders',
  primaryKey: 'orderId',
  storage: 'sheets',
  fields: {
    orderId:     { type: 'string', required: true, description: 'Col A.' },
    skfId:       { type: 'string', required: true, description: 'Col B.' },
    itemsJson:   { type: 'string', required: true, description: 'Col C. JSON-encoded array of OrderLineItems.' },
    total:       { type: 'number', required: true, description: 'Col D.' },
    discount:    { type: 'number', required: false, description: 'Col E.' },
    pointsUsed:  { type: 'number', required: false, description: 'Col F.' },
    date:        { type: 'date',   required: true, description: 'Col G.' },
    status:      { type: 'string', required: true, description: 'Col H.' },
    addressJson: { type: 'string', required: true, description: 'Col I. JSON-encoded address object.' },
  },
  notes: 'Read/write via Sheets. Status updated via updateShopOrderStatus.',
}

/**
 * Schema: sponsor (Google Sheets)
 * Source: lib/server/sheets.ts Sponsor interface + Sponsors tab
 */
export const sponsorSchema: EntitySchema = {
  entity: 'Sponsor',
  tableName: 'Sponsors',
  primaryKey: 'name',
  storage: 'sheets',
  fields: {
    name:        { type: 'string',  required: true, description: 'Col A.' },
    logoUrl:     { type: 'string',  required: true, description: 'Col B.' },
    website:     { type: 'string',  required: false, description: 'Col C.' },
    tier:        { type: 'enum',    required: true, enumValues: ['Gold', 'Silver', 'Bronze'], description: 'Col D.' },
    active:      { type: 'boolean', required: true, description: 'Col E. Stored as YES/NO string in Sheets.' },
    since:       { type: 'string',  required: false, description: 'Col F.' },
    description: { type: 'string',  required: false, description: 'Col G.' },
  },
  notes: 'Read-only via Sheets. Sorted by tier priority (Gold > Silver > Bronze). Filtered by active=true.',
}

/**
 * Schema: techniqueVideo (Google Sheets)
 * Source: lib/server/sheets.ts TechniqueVideo interface + Techniques tab
 */
export const techniqueVideoSchema: EntitySchema = {
  entity: 'TechniqueVideo',
  tableName: 'Techniques',
  primaryKey: 'videoId',
  storage: 'sheets',
  fields: {
    videoId:     { type: 'string',  required: true, description: 'Col A.' },
    title:       { type: 'string',  required: true, description: 'Col B.' },
    youtubeUrl:  { type: 'string',  required: true, description: 'Col C. Converted to embed URL in code.' },
    category:    { type: 'string',  required: true, description: 'Col D.' },
    beltLevel:   { type: 'string',  required: true, description: 'Col E.' },
    durationMin: { type: 'number',  required: true, description: 'Col F.' },
    description: { type: 'string',  required: false, description: 'Col G.' },
    featured:    { type: 'boolean', required: false, description: 'Col H. Stored as YES/NO string in Sheets.' },
  },
  notes: 'Read-only via Sheets. Public technique library. Filterable by beltLevel and category.',
}

/**
 * Schema: attendanceRow (Google Sheets)
 * Source: /types/index.ts AttendanceRow + lib/server/sheets.ts Attendance tab
 */
export const attendanceSchema: EntitySchema = {
  entity: 'AttendanceRow',
  tableName: 'Attendance',
  primaryKey: 'skfId+date',
  storage: 'sheets',
  fields: {
    skfId:    { type: 'string', required: true, description: 'Col A.' },
    date:     { type: 'date',   required: true, description: 'Col B.' },
    status:   { type: 'enum',   required: true, enumValues: ['Present', 'Absent', 'Leave'], description: 'Col C.' },
    markedBy: { type: 'string', required: false, description: 'Col D.' },
  },
  notes: 'Read/write via Sheets. markAttendance appends rows.',
}
