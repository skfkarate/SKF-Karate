import { supabaseAdmin } from '@/lib/server/supabase'
import { normaliseSkfId } from '@/lib/utils/registration'

type CertificateStatus = 'draft' | 'issued' | 'revoked'
type CertificateProgramType = 'camp' | 'belt_exam' | 'training' | 'tournament'

export type CertificateWorkflowParticipant = {
  id?: string | null
  athleteId?: string | null
  athleteName?: string | null
  skfId?: string | null
  branchName?: string | null
  belt?: string | null
  photoUrl?: string | null
}

export type CertificateWorkflowResult = Record<string, unknown> & {
  id?: string
  participantId?: string
  athleteId?: string
  athleteName?: string
  skfId?: string
  branchName?: string
  belt?: string
  result?: string
  medal?: string
  beltAwarded?: string
  promotion?: string
  examiner?: string
  grade?: string
  score?: number | string
  daysAttended?: number | string
  specialAward?: string
  award?: string
  notes?: string
}

export type CertificateWorkflowEvent = Record<string, unknown> & {
  id: string
  name: string
  type?: string
  date?: string
  endDate?: string
  hostingBranch?: string
  affiliatedBody?: string
  participants?: CertificateWorkflowParticipant[]
  results?: CertificateWorkflowResult[]
}

type ProgramRow = {
  id: string
  name: string
  type: CertificateProgramType
  branch: string | null
  source_event_id?: string | null
  has_belt_subtypes?: boolean | null
}

type EnrollmentWorkflowRow = {
  id: string
  skf_id: string
  program_id: string
  belt_level: string | null
  status: string
  completion_date: string | null
  issuer_name: string | null
  certificate_unlocked: boolean
}

type CertificateWorkflowRow = {
  enrollment_id: string
  skf_id: string
  program_id: string | null
  issued_at: string
  verification_code: string
  certificate_number: string | null
  certificate_type: string
  status: CertificateStatus
  prepared_at?: string | null
  published_at?: string | null
  published_by?: string | null
}

export type EventCertificateRecord = {
  enrollmentId: string
  skfId: string
  studentName: string
  certificateNumber: string
  verificationCode: string
  certificateType: string
  status: CertificateStatus
  programName: string
  beltLevel: string | null
  verifyUrl: string
  qrDownloadUrl: string
  result: string
  preparedAt: string | null
  publishedAt: string | null
}

export type EventCertificateSkippedRecord = {
  skfId: string
  studentName: string
  reason: string
}

export type EventCertificateSummary = {
  programId: string | null
  programName: string
  totalResults: number
  eligibleCount: number
  preparedCount: number
  issuedCount: number
  draftCount: number
  skippedCount: number
  revokedCount: number
  certificates: EventCertificateRecord[]
  skipped: EventCertificateSkippedRecord[]
}

const CERTIFICATE_SELECT = [
  'enrollment_id',
  'skf_id',
  'program_id',
  'issued_at',
  'verification_code',
  'certificate_number',
  'certificate_type',
  'status',
  'prepared_at',
  'published_at',
  'published_by',
].join(', ')

const ENROLLMENT_CERTIFICATE_SELECT = 'id, skf_id, program_id, belt_level, status, completion_date, issuer_name, certificate_unlocked, certificates(enrollment_id, skf_id, program_id, issued_at, verification_code, certificate_number, certificate_type, status, prepared_at, published_at, published_by)'

const DEFAULT_TEMPLATE_IMAGE_URL = '/certificates/templates/default-certificate.png'

const DEFAULT_TEMPLATE_FIELDS = [
  {
    id: 'certificate_type',
    label: 'certificate_type',
    value: '',
    x: 50,
    y: 37,
    fontSize: 20,
    fontFamily: 'Georgia',
    color: '#6b4a12',
    align: 'center',
    bold: true,
    maxWidth: 70,
  },
  {
    id: 'student_name',
    label: 'student_name',
    value: '',
    x: 50,
    y: 48,
    fontSize: 34,
    fontFamily: 'Georgia',
    color: '#111111',
    align: 'center',
    bold: true,
    maxWidth: 72,
  },
  {
    id: 'belt_level',
    label: 'belt_level',
    value: '',
    x: 50,
    y: 58,
    fontSize: 24,
    fontFamily: 'Georgia',
    color: '#222222',
    align: 'center',
    bold: true,
    maxWidth: 64,
  },
  {
    id: 'program_name',
    label: 'program_name',
    value: '',
    x: 50,
    y: 66,
    fontSize: 18,
    fontFamily: 'Georgia',
    color: '#333333',
    align: 'center',
    bold: false,
    maxWidth: 70,
  },
  {
    id: 'skf_id',
    label: 'skf_id',
    value: '',
    x: 50,
    y: 74,
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#333333',
    align: 'center',
    bold: true,
    maxWidth: 50,
  },
  {
    id: 'completion_date',
    label: 'completion_date',
    value: '',
    x: 50,
    y: 80,
    fontSize: 16,
    fontFamily: 'Arial',
    color: '#333333',
    align: 'center',
    bold: false,
    maxWidth: 50,
  },
  {
    id: 'certificate_registration_no',
    label: 'certificate_registration_no',
    value: '',
    x: 50,
    y: 89,
    fontSize: 15,
    fontFamily: 'Arial',
    color: '#111111',
    align: 'center',
    bold: true,
    maxWidth: 70,
  },
]

const CERTIFICATE_NUMBER_PATTERN = /^SKF-C-\d{6,}$/i
const VERIFICATION_CODE_PATTERN = /^[a-f0-9]{32}$/i

function buildAppUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org'
  return `${origin.replace(/\/+$/, '')}${path}`
}

export function certificateVerifyUrl(verificationCode: string) {
  return buildAppUrl(`/verify/c/${encodeURIComponent(verificationCode)}`)
}

export function certificateQrDownloadUrl(verificationCode: string, size = 1600) {
  return buildAppUrl(`/api/certificates/qr/${encodeURIComponent(verificationCode)}?size=${size}`)
}

function safeText(value: unknown) {
  return String(value || '').trim()
}

function normalizedText(value: unknown) {
  return safeText(value).toLowerCase()
}

function eventText(event: CertificateWorkflowEvent) {
  return `${event.type || ''} ${event.name || ''}`.toLowerCase()
}

function isBeltEvent(event: CertificateWorkflowEvent) {
  const text = eventText(event)
  return (
    text.includes('belt') ||
    text.includes('grading') ||
    text.includes('examination') ||
    text.includes('dan')
  )
}

function isTournamentEvent(event: CertificateWorkflowEvent) {
  return eventText(event).includes('tournament')
}

function programTypeForEvent(event: CertificateWorkflowEvent): CertificateProgramType {
  const text = eventText(event)
  if (text.includes('tournament')) return 'tournament'
  if (text.includes('camp')) return 'camp'
  if (isBeltEvent(event)) return 'belt_exam'
  return 'training'
}

function certificateTypeForEvent(event: CertificateWorkflowEvent, result: CertificateWorkflowResult) {
  const text = `${eventText(event)} ${result.beltAwarded || ''} ${result.promotion || ''}`.toLowerCase()
  if (text.includes('black') || text.includes('dan')) return 'black_belt_exam'
  if (isBeltEvent(event)) return 'belt_exam'
  if (text.includes('camp')) return 'camp'
  if (text.includes('seminar')) return 'seminar'
  if (isTournamentEvent(event)) return 'tournament'
  return 'special_program'
}

function branchForProgram(event: CertificateWorkflowEvent) {
  const branch = safeText(event.hostingBranch)
  return branch || null
}

function dateOnly(value: unknown) {
  const raw = safeText(value)
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10)

  const date = raw ? new Date(raw) : new Date()
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10)
  return date.toISOString().slice(0, 10)
}

function findParticipant(event: CertificateWorkflowEvent, result: CertificateWorkflowResult) {
  const participantId = safeText(result.participantId)
  const skfId = normaliseSkfId(safeText(result.skfId))

  return (event.participants || []).find((participant) => {
    const participantSkfId = normaliseSkfId(safeText(participant.skfId))
    return (
      (participantId && safeText(participant.id) === participantId) ||
      (skfId && participantSkfId === skfId)
    )
  }) || null
}

function resultWithDefaults(
  event: CertificateWorkflowEvent,
  result: CertificateWorkflowResult,
  index: number
): CertificateWorkflowResult {
  const participant = findParticipant(event, result)
  const skfId = normaliseSkfId(safeText(result.skfId || participant?.skfId))

  return {
    ...result,
    id: safeText(result.id) || `cert_result_${event.id}_${skfId || index + 1}`,
    participantId: safeText(result.participantId || participant?.id),
    athleteId: safeText(result.athleteId || participant?.athleteId),
    athleteName: safeText(result.athleteName || participant?.athleteName || skfId || 'SKF Athlete'),
    skfId,
    branchName: safeText(result.branchName || participant?.branchName),
    belt: safeText(result.belt || participant?.belt),
  }
}

function resultOutcome(result: CertificateWorkflowResult) {
  return normalizedText(result.result || result.medal)
}

function isCertificateEligible(event: CertificateWorkflowEvent, result: CertificateWorkflowResult) {
  const outcome = resultOutcome(result)
  const blocked = new Set([
    'absent',
    'fail',
    'failed',
    'not-qualified',
    'not qualified',
    'rejected',
    'withdrawn',
    'disqualified',
    'no-show',
    'no show',
  ])

  if (blocked.has(outcome)) return false

  if (isBeltEvent(event)) {
    return (
      ['pass', 'passed', 'promoted', 'qualified', 'approved', 'completed'].includes(outcome) ||
      Boolean(safeText(result.beltAwarded || result.promotion))
    )
  }

  if (isTournamentEvent(event)) {
    return Boolean(outcome) && !blocked.has(outcome)
  }

  return (
    ['attended', 'completed', 'pass', 'passed', 'participation', 'approved', 'qualified'].includes(outcome) ||
    Boolean(safeText(result.specialAward || result.award))
  )
}

function beltLevelForResult(result: CertificateWorkflowResult) {
  return safeText(result.beltAwarded || result.promotion || result.belt) || null
}

function issuerForResult(event: CertificateWorkflowEvent, result: CertificateWorkflowResult) {
  return safeText(result.examiner || event.affiliatedBody) || 'SKF Karate'
}

function sourceResults(event: CertificateWorkflowEvent, results?: CertificateWorkflowResult[]) {
  return (Array.isArray(results) && results.length > 0 ? results : event.results || [])
    .map((result, index) => resultWithDefaults(event, result, index))
}

function certificateRecordFromRows(
  program: ProgramRow,
  enrollment: EnrollmentWorkflowRow,
  certificate: CertificateWorkflowRow,
  result?: CertificateWorkflowResult
): EventCertificateRecord {
  return {
    enrollmentId: enrollment.id,
    skfId: enrollment.skf_id,
    studentName: safeText(result?.athleteName) || enrollment.skf_id,
    certificateNumber: certificate.certificate_number || 'SKF-C-PENDING',
    verificationCode: certificate.verification_code,
    certificateType: certificate.certificate_type,
    status: certificate.status,
    programName: program.name,
    beltLevel: enrollment.belt_level,
    verifyUrl: certificateVerifyUrl(certificate.verification_code),
    qrDownloadUrl: certificateQrDownloadUrl(certificate.verification_code),
    result: resultOutcome(result || {}),
    preparedAt: certificate.prepared_at || null,
    publishedAt: certificate.published_at || null,
  }
}

function summarize(
  program: ProgramRow | null,
  totalResults: number,
  certificates: EventCertificateRecord[],
  skipped: EventCertificateSkippedRecord[]
): EventCertificateSummary {
  return {
    programId: program?.id || null,
    programName: program?.name || '',
    totalResults,
    eligibleCount: certificates.length,
    preparedCount: certificates.length,
    issuedCount: certificates.filter((certificate) => certificate.status === 'issued').length,
    draftCount: certificates.filter((certificate) => certificate.status === 'draft').length,
    skippedCount: skipped.length,
    revokedCount: certificates.filter((certificate) => certificate.status === 'revoked').length,
    certificates,
    skipped,
  }
}

async function findProgramForEvent(event: CertificateWorkflowEvent): Promise<ProgramRow | null> {
  const sourceEventId = safeText(event.id)
  if (!sourceEventId) return null

  const { data, error } = await supabaseAdmin
    .from('programs')
    .select('id, name, type, branch, source_event_id, has_belt_subtypes')
    .eq('source_event_id', sourceEventId)
    .maybeSingle()

  if (error) throw error
  return data as ProgramRow | null
}

async function ensureProgramForEvent(event: CertificateWorkflowEvent): Promise<ProgramRow> {
  const sourceEventId = safeText(event.id)
  if (!sourceEventId) throw new Error('EVENT_ID_REQUIRED')

  const type = programTypeForEvent(event)
  const payload = {
    name: safeText(event.name) || 'SKF Karate Certificate Program',
    type,
    branch: branchForProgram(event),
    source_event_id: sourceEventId,
    has_belt_subtypes: type === 'belt_exam',
    is_active: true,
  }

  const existing = await findProgramForEvent(event)
  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('programs')
      .update(payload)
      .eq('id', existing.id)
      .select('id, name, type, branch, source_event_id, has_belt_subtypes')
      .single()

    if (error) throw error
    return data as ProgramRow
  }

  const { data, error } = await supabaseAdmin
    .from('programs')
    .insert([payload])
    .select('id, name, type, branch, source_event_id, has_belt_subtypes')
    .single()

  if (error) {
    const afterRace = await findProgramForEvent(event)
    if (afterRace) return afterRace
    throw error
  }

  return data as ProgramRow
}

async function ensureDefaultTemplate(programId: string) {
  const { count, error: countError } = await supabaseAdmin
    .from('certificate_templates')
    .select('id', { count: 'exact', head: true })
    .eq('program_id', programId)

  if (countError) throw countError
  if ((count || 0) > 0) return

  const { error } = await supabaseAdmin
    .from('certificate_templates')
    .insert([{
      program_id: programId,
      belt_level: null,
      template_image_url: DEFAULT_TEMPLATE_IMAGE_URL,
      fields: DEFAULT_TEMPLATE_FIELDS,
      use_qr_code: true,
    }])

  if (error) throw error
}

async function getEnrollment(programId: string, skfId: string) {
  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select('id, skf_id, program_id, belt_level, status, completion_date, issuer_name, certificate_unlocked')
    .eq('program_id', programId)
    .eq('skf_id', skfId)
    .maybeSingle()

  if (error) throw error
  return data as EnrollmentWorkflowRow | null
}

async function upsertEnrollment(
  program: ProgramRow,
  event: CertificateWorkflowEvent,
  result: CertificateWorkflowResult
) {
  const skfId = normaliseSkfId(safeText(result.skfId))
  const existing = await getEnrollment(program.id, skfId)
  const payload = {
    skf_id: skfId,
    program_id: program.id,
    belt_level: beltLevelForResult(result),
    status: 'completed',
    completion_date: dateOnly(event.date),
    issuer_name: issuerForResult(event, result),
    updated_at: new Date().toISOString(),
  }

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update(payload)
      .eq('id', existing.id)
      .select('id, skf_id, program_id, belt_level, status, completion_date, issuer_name, certificate_unlocked')
      .single()

    if (error) throw error
    return data as EnrollmentWorkflowRow
  }

  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .insert([{ ...payload, certificate_unlocked: false }])
    .select('id, skf_id, program_id, belt_level, status, completion_date, issuer_name, certificate_unlocked')
    .single()

  if (error) {
    const afterRace = await getEnrollment(program.id, skfId)
    if (afterRace) return afterRace
    throw error
  }

  return data as EnrollmentWorkflowRow
}

async function getCertificateForEnrollment(enrollmentId: string) {
  const { data, error } = await supabaseAdmin
    .from('certificates')
    .select(CERTIFICATE_SELECT)
    .eq('enrollment_id', enrollmentId)
    .maybeSingle()

  if (error) throw error
  return data as CertificateWorkflowRow | null
}

async function ensureDraftCertificate(
  program: ProgramRow,
  event: CertificateWorkflowEvent,
  enrollment: EnrollmentWorkflowRow,
  result: CertificateWorkflowResult
) {
  const certificateType = certificateTypeForEvent(event, result)
  const existing = await getCertificateForEnrollment(enrollment.id)

  if (existing) {
    if (existing.status === 'revoked') return existing

    const { data, error } = await supabaseAdmin
      .from('certificates')
      .update({
        skf_id: enrollment.skf_id,
        program_id: program.id,
        certificate_type: certificateType,
        prepared_at: existing.prepared_at || new Date().toISOString(),
      })
      .eq('enrollment_id', enrollment.id)
      .select(CERTIFICATE_SELECT)
      .single()

    if (error) throw error
    return data as unknown as CertificateWorkflowRow
  }

  const { data, error } = await supabaseAdmin
    .from('certificates')
    .insert([{
      enrollment_id: enrollment.id,
      skf_id: enrollment.skf_id,
      program_id: program.id,
      certificate_type: certificateType,
      status: 'draft',
      prepared_at: new Date().toISOString(),
    }])
    .select(CERTIFICATE_SELECT)
    .single()

  if (error) {
    const afterRace = await getCertificateForEnrollment(enrollment.id)
    if (afterRace) return afterRace
    throw error
  }

  return data as unknown as CertificateWorkflowRow
}

async function publishCertificate(
  enrollment: EnrollmentWorkflowRow,
  certificate: CertificateWorkflowRow,
  publishedBy: string
) {
  if (certificate.status === 'revoked') return certificate

  const publishedAt = new Date().toISOString()

  const { error: enrollmentError } = await supabaseAdmin
    .from('enrollments')
    .update({
      status: 'completed',
      certificate_unlocked: true,
      updated_at: publishedAt,
    })
    .eq('id', enrollment.id)

  if (enrollmentError) throw enrollmentError

  const { data, error } = await supabaseAdmin
    .from('certificates')
    .update({
      status: 'issued',
      issued_at: publishedAt,
      published_at: publishedAt,
      published_by: publishedBy || 'FeeTrack',
    })
    .eq('enrollment_id', enrollment.id)
    .select(CERTIFICATE_SELECT)
    .single()

  if (error) throw error
  return data as unknown as CertificateWorkflowRow
}

export async function prepareEventCertificates(
  event: CertificateWorkflowEvent,
  results?: CertificateWorkflowResult[]
): Promise<EventCertificateSummary> {
  const allResults = sourceResults(event, results)
  const program = await ensureProgramForEvent(event)
  await ensureDefaultTemplate(program.id)

  const certificates: EventCertificateRecord[] = []
  const skipped: EventCertificateSkippedRecord[] = []
  const seen = new Set<string>()

  for (const result of allResults) {
    const skfId = normaliseSkfId(safeText(result.skfId))
    const studentName = safeText(result.athleteName) || skfId || 'SKF Athlete'

    if (!skfId) {
      skipped.push({ skfId: '', studentName, reason: 'Missing SKF ID' })
      continue
    }

    if (seen.has(skfId)) {
      skipped.push({ skfId, studentName, reason: 'Duplicate result row' })
      continue
    }
    seen.add(skfId)

    if (!isCertificateEligible(event, result)) {
      skipped.push({ skfId, studentName, reason: 'Result is not certificate eligible' })
      continue
    }

    const enrollment = await upsertEnrollment(program, event, result)
    const certificate = await ensureDraftCertificate(program, event, enrollment, result)
    certificates.push(certificateRecordFromRows(program, enrollment, certificate, result))
  }

  return summarize(program, allResults.length, certificates, skipped)
}

export async function publishEventCertificates(input: {
  event: CertificateWorkflowEvent
  results?: CertificateWorkflowResult[]
  publishedBy?: string
}): Promise<EventCertificateSummary> {
  const prepared = await prepareEventCertificates(input.event, input.results)
  const program = prepared.programId
    ? {
        id: prepared.programId,
        name: prepared.programName,
        type: programTypeForEvent(input.event),
        branch: branchForProgram(input.event),
      } as ProgramRow
    : await ensureProgramForEvent(input.event)

  const allResults = sourceResults(input.event, input.results)
  const resultBySkfId = new Map(allResults.map((result) => [normaliseSkfId(safeText(result.skfId)), result]))
  const certificates: EventCertificateRecord[] = []

  for (const preparedCertificate of prepared.certificates) {
    const result = resultBySkfId.get(preparedCertificate.skfId)
    const enrollment = await getEnrollment(program.id, preparedCertificate.skfId)
    if (!enrollment) continue

    const certificate = await getCertificateForEnrollment(enrollment.id)
    if (!certificate) continue

    const published = await publishCertificate(enrollment, certificate, input.publishedBy || 'FeeTrack')
    certificates.push(certificateRecordFromRows(program, enrollment, published, result))
  }

  return summarize(program, allResults.length, certificates, prepared.skipped)
}

export async function listEventCertificates(event: CertificateWorkflowEvent): Promise<EventCertificateSummary> {
  const program = await findProgramForEvent(event)
  const allResults = sourceResults(event)
  const resultBySkfId = new Map(allResults.map((result) => [normaliseSkfId(safeText(result.skfId)), result]))

  if (!program) {
    return summarize(null, allResults.length, [], [])
  }

  const { data, error } = await supabaseAdmin
    .from('enrollments')
    .select(ENROLLMENT_CERTIFICATE_SELECT)
    .eq('program_id', program.id)
    .order('skf_id', { ascending: true })

  if (error) throw error

  const certificates = (data || []).flatMap((row) => {
    const enrollment = row as unknown as EnrollmentWorkflowRow & { certificates?: CertificateWorkflowRow | CertificateWorkflowRow[] | null }
    const certificate = Array.isArray(enrollment.certificates)
      ? enrollment.certificates[0]
      : enrollment.certificates

    if (!certificate) return []
    return [certificateRecordFromRows(program, enrollment, certificate, resultBySkfId.get(enrollment.skf_id))]
  })

  return summarize(program, allResults.length, certificates, [])
}

export async function getCertificateQrPayload(lookup: string) {
  const normalized = safeText(lookup)
  if (!normalized) return null

  const query = supabaseAdmin
    .from('certificates')
    .select(CERTIFICATE_SELECT)

  const { data, error } = CERTIFICATE_NUMBER_PATTERN.test(normalized)
    ? await query.eq('certificate_number', normalized.toUpperCase()).maybeSingle()
    : VERIFICATION_CODE_PATTERN.test(normalized)
      ? await query.eq('verification_code', normalized.toLowerCase()).maybeSingle()
      : { data: null, error: null }

  if (error) throw error
  const certificate = data as CertificateWorkflowRow | null
  if (!certificate || certificate.status === 'revoked') return null

  return {
    certificateNumber: certificate.certificate_number || 'SKF-C-PENDING',
    verificationCode: certificate.verification_code,
    status: certificate.status,
    verifyUrl: certificateVerifyUrl(certificate.verification_code),
    qrDownloadUrl: certificateQrDownloadUrl(certificate.verification_code),
  }
}
