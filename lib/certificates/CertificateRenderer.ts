import { createHash } from 'node:crypto'
import QRCode from 'qrcode'

import { supabaseAdmin } from '@/lib/server/supabase'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'

export interface TemplateField {
  id: string
  label: string       // e.g. 'student_name', 'date', 'belt'
  value: string       // actual value to render
  x: number          // percentage 0-100 of canvas width
  y: number          // percentage 0-100 of canvas height
  fontSize: number   // base font size at 1240px width
  fontFamily: string
  color: string      // hex color
  align: 'left' | 'center' | 'right'
  bold: boolean
  maxWidth?: number // optional percentage of canvas width
}

export interface CertificateData {
  enrollmentId: string
  skfId: string
  certificateNumber: string
  verificationCode: string
  certificateType: string
  status: 'draft' | 'issued' | 'revoked'
  issuedAt: string
  studentName: string
  programName: string
  beltLevel: string | null
  completionDate: string
  issuerName: string
  templateImageUrl: string
  fields: TemplateField[]
  useQrCode: boolean
  verifyUrl: string
  qrCodeDataUrl?: string
  qrX: number
  qrY: number
  qrSize: number
}

type ProgramRow = {
  id?: string
  name?: string
  type?: string
}

type EnrollmentRow = {
  id: string
  skf_id: string
  program_id: string
  belt_level: string | null
  status: string
  completion_date: string | null
  issuer_name: string | null
  certificate_unlocked: boolean
  programs?: ProgramRow | ProgramRow[] | null
}

type TemplateRow = {
  id: string
  program_id: string
  belt_level: string | null
  template_image_url: string
  fields: unknown
  use_qr_code: boolean
}

type CertificateRecordRow = {
  enrollment_id: string
  skf_id: string
  program_id: string | null
  issued_at: string
  verification_code: string
  certificate_number: string | null
  certificate_type: string
  status: 'draft' | 'issued' | 'revoked'
  template_id: string | null
  issued_snapshot: Record<string, unknown> | null
  render_hash: string | null
  revoked_at?: string | null
  revoked_reason?: string | null
}

type CertificateSnapshot = {
  version: 1
  templateId: string
  templateImageUrl: string
  fields: TemplateField[]
  useQrCode: boolean
  qrX: number
  qrY: number
  qrSize: number
  fieldValues: Record<string, string>
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
  'template_id',
  'issued_snapshot',
  'render_hash',
  'revoked_at',
  'revoked_reason',
].join(', ')

const DEFAULT_QR = {
  x: 89,
  y: 82,
  size: 8.8,
}

const CERTIFICATE_NUMBER_PATTERN = /^SKF-C-\d{6,}$/i
const VERIFICATION_CODE_PATTERN = /^[a-f0-9]{32}$/i

function singleProgram(programs: ProgramRow | ProgramRow[] | null | undefined): ProgramRow {
  return Array.isArray(programs) ? programs[0] || {} : programs || {}
}

function normalizeKey(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-belt$/, '')
}

function beltLookupKeys(value: string | null | undefined) {
  const normalized = normalizeKey(value)
  const keys = new Set<string>()
  if (normalized) keys.add(normalized)

  if (normalized.startsWith('green')) keys.add('green')
  if (normalized.startsWith('brown')) keys.add('brown')
  if (normalized.startsWith('black')) keys.add('black')
  if (normalized.includes('dan')) keys.add('black')

  return [...keys].filter(Boolean)
}

function titleCaseFromKey(value: string) {
  return value
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function classifyCertificateType(programType: string | undefined, programName: string, beltLevel: string | null) {
  const name = programName.toLowerCase()
  const belt = String(beltLevel || '').toLowerCase()

  if (belt.includes('dan') || name.includes('black belt') || name.includes('dan grading')) {
    return 'black_belt_exam'
  }
  if (programType === 'belt_exam') return 'belt_exam'
  if (programType === 'camp' || name.includes('camp')) return 'camp'
  if (name.includes('seminar')) return 'seminar'
  if (programType === 'tournament') return 'tournament'
  if (programType === 'training') return 'special_program'

  return 'general'
}

function certificateTypeLabel(type: string) {
  const labels: Record<string, string> = {
    general: 'General Certificate',
    belt_exam: 'Belt Examination',
    black_belt_exam: 'Black Belt Examination',
    seminar: 'Seminar',
    camp: 'Camp',
    special_program: 'Special Program',
    tournament: 'Tournament',
    participation: 'Participation',
    achievement: 'Achievement',
  }

  return labels[type] || titleCaseFromKey(type)
}

function formatDate(value: string | null | undefined) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildAppUrl(path: string) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skfkarate.org'
  return `${origin.replace(/\/+$/, '')}${path}`
}

function proxiedTemplateImageUrl(rawUrl: string) {
  if (rawUrl.startsWith('/')) return rawUrl
  return `/api/certificates/template-image?url=${encodeURIComponent(rawUrl)}`
}

function snapshotFromUnknown(value: Record<string, unknown> | null | undefined): CertificateSnapshot | null {
  if (!value || typeof value !== 'object') return null
  if (value.version !== 1) return null
  if (typeof value.templateImageUrl !== 'string') return null
  if (!Array.isArray(value.fields)) return null

  return {
    version: 1,
    templateId: typeof value.templateId === 'string' ? value.templateId : '',
    templateImageUrl: value.templateImageUrl,
    fields: value.fields as TemplateField[],
    useQrCode: Boolean(value.useQrCode),
    qrX: typeof value.qrX === 'number' ? value.qrX : DEFAULT_QR.x,
    qrY: typeof value.qrY === 'number' ? value.qrY : DEFAULT_QR.y,
    qrSize: typeof value.qrSize === 'number' ? value.qrSize : DEFAULT_QR.size,
    fieldValues: value.fieldValues && typeof value.fieldValues === 'object'
      ? value.fieldValues as Record<string, string>
      : {},
  }
}

function renderHash(snapshot: CertificateSnapshot) {
  return createHash('sha256').update(JSON.stringify(snapshot)).digest('hex')
}

export class CertificateRenderer {
  async getData(enrollmentId: string, requestingSkfId: string, isAdmin: boolean): Promise<CertificateData> {
    return this.buildDataForEnrollment(enrollmentId, requestingSkfId, { isAdmin })
  }

  async getDataByVerificationCode(lookup: string): Promise<CertificateData> {
    const certificate = await this.getCertificateByLookup(lookup)
    if (!certificate) throw new Error('CERTIFICATE_NOT_FOUND')
    if (certificate.status === 'revoked') throw new Error('CERTIFICATE_REVOKED')
    if (certificate.status !== 'issued') throw new Error('CERTIFICATE_NOT_ISSUED')

    return this.buildDataForEnrollment(certificate.enrollment_id, certificate.skf_id, {
      isAdmin: true,
      publicIssued: true,
      certificate,
    })
  }

  private async buildDataForEnrollment(
    enrollmentId: string,
    requestingSkfId: string,
    options: {
      isAdmin: boolean
      publicIssued?: boolean
      certificate?: CertificateRecordRow
    }
  ): Promise<CertificateData> {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, program_id, belt_level, status, completion_date, issuer_name, certificate_unlocked, programs(id, name, type)')
      .eq('id', enrollmentId)
      .single()
    
    if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND')
    const enrollmentRow = enrollment as EnrollmentRow
    if (!enrollmentRow.certificate_unlocked && !options.isAdmin) throw new Error('CERTIFICATE_LOCKED')
    if (enrollmentRow.status !== 'completed' && !options.isAdmin) throw new Error('NOT_COMPLETED')
    if (enrollmentRow.skf_id !== requestingSkfId && !options.isAdmin) throw new Error('FORBIDDEN')

    const program = singleProgram(enrollmentRow.programs)
    const programName = program.name || 'SKF Karate Certificate'
    const programType = program.type || 'general'
    const certificate = options.certificate || await this.ensureCertificateRecord(enrollmentRow, programName, programType)

    if (!options.isAdmin) {
      if (certificate.status === 'revoked') throw new Error('CERTIFICATE_REVOKED')
      if (certificate.status !== 'issued') throw new Error('CERTIFICATE_NOT_ISSUED')
    }

    if (options.publicIssued) {
      if (certificate.status === 'revoked') throw new Error('CERTIFICATE_REVOKED')
      if (certificate.status !== 'issued') throw new Error('CERTIFICATE_NOT_ISSUED')
      if (enrollmentRow.status !== 'completed' || !enrollmentRow.certificate_unlocked) {
        throw new Error('CERTIFICATE_NOT_ISSUED')
      }
    }

    const athlete = await getAthleteBySkfIdLive(enrollment.skf_id)
    const liveStudentName = athlete
      ? [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim()
      : ''

    const existingSnapshot = snapshotFromUnknown(certificate.issued_snapshot)
    const snapshot = existingSnapshot || await this.createAndStoreSnapshot({
      enrollment: enrollmentRow,
      certificate,
      programName,
      programType,
      studentName: liveStudentName || 'Athlete',
    })

    const fieldValues = {
      ...this.buildFieldValues({
        enrollment: enrollmentRow,
        certificate,
        programName,
        programType,
        studentName: liveStudentName || snapshot.fieldValues.student_name || 'Athlete',
      }),
      ...snapshot.fieldValues,
    }

    const processedFields: TemplateField[] = snapshot.fields.map(field => ({
      ...field,
      value: this.valueForField(field, fieldValues)
    }))

    const verifyUrl = buildAppUrl(`/verify/c/${certificate.verification_code}`)
    const qrCodeDataUrl = snapshot.useQrCode
      ? await QRCode.toDataURL(verifyUrl, {
        width: 420,
        margin: 1,
        errorCorrectionLevel: 'M',
      })
      : undefined

    return {
      enrollmentId,
      skfId: enrollmentRow.skf_id,
      certificateNumber: certificate.certificate_number || 'SKF-C-PENDING',
      verificationCode: certificate.verification_code,
      certificateType: certificate.certificate_type,
      status: certificate.status,
      issuedAt: certificate.issued_at,
      studentName: fieldValues.student_name,
      programName,
      beltLevel: enrollmentRow.belt_level,
      completionDate: fieldValues.completion_date,
      issuerName: fieldValues.issuer_name,
      templateImageUrl: proxiedTemplateImageUrl(snapshot.templateImageUrl),
      fields: processedFields,
      useQrCode: snapshot.useQrCode,
      verifyUrl,
      qrCodeDataUrl,
      qrX: snapshot.qrX,
      qrY: snapshot.qrY,
      qrSize: snapshot.qrSize,
    }
  }

  private async getCertificateByLookup(lookup: string): Promise<CertificateRecordRow | null> {
    const normalized = lookup.trim()

    if (CERTIFICATE_NUMBER_PATTERN.test(normalized)) {
      const { data, error } = await supabaseAdmin
        .from('certificates')
        .select(CERTIFICATE_SELECT)
        .eq('certificate_number', normalized.toUpperCase())
        .maybeSingle()

      if (error) throw error
      return data as unknown as CertificateRecordRow | null
    }

    if (!VERIFICATION_CODE_PATTERN.test(normalized)) {
      return null
    }

    const { data: byCode, error: codeError } = await supabaseAdmin
      .from('certificates')
      .select(CERTIFICATE_SELECT)
      .eq('verification_code', normalized.toLowerCase())
      .maybeSingle()

    if (codeError) throw codeError
    return byCode as unknown as CertificateRecordRow | null
  }

  private async getCertificateForEnrollment(enrollmentId: string): Promise<CertificateRecordRow | null> {
    const { data, error } = await supabaseAdmin
      .from('certificates')
      .select(CERTIFICATE_SELECT)
      .eq('enrollment_id', enrollmentId)
      .maybeSingle()

    if (error) throw error
    return data as unknown as CertificateRecordRow | null
  }

  private async ensureCertificateRecord(
    enrollment: EnrollmentRow,
    programName: string,
    programType: string
  ): Promise<CertificateRecordRow> {
    const existing = await this.getCertificateForEnrollment(enrollment.id)
    if (existing) return existing

    const { data, error } = await supabaseAdmin
      .from('certificates')
      .insert([{
        enrollment_id: enrollment.id,
        skf_id: enrollment.skf_id,
        program_id: enrollment.program_id,
        certificate_type: classifyCertificateType(programType, programName, enrollment.belt_level),
        status: enrollment.status === 'completed' && enrollment.certificate_unlocked ? 'issued' : 'draft',
      }])
      .select(CERTIFICATE_SELECT)
      .single()

    if (error) {
      const afterRace = await this.getCertificateForEnrollment(enrollment.id)
      if (afterRace) return afterRace
      throw error
    }

    return data as unknown as CertificateRecordRow
  }

  private async createAndStoreSnapshot(input: {
    enrollment: EnrollmentRow
    certificate: CertificateRecordRow
    programName: string
    programType: string
    studentName: string
  }): Promise<CertificateSnapshot> {
    const template = await this.resolveTemplate(input.enrollment)
    const fieldValues = this.buildFieldValues(input)
    const snapshot: CertificateSnapshot = {
      version: 1,
      templateId: template.id,
      templateImageUrl: template.template_image_url,
      fields: Array.isArray(template.fields) ? template.fields as TemplateField[] : [],
      useQrCode: Boolean(template.use_qr_code),
      qrX: DEFAULT_QR.x,
      qrY: DEFAULT_QR.y,
      qrSize: DEFAULT_QR.size,
      fieldValues,
    }

    const hash = renderHash(snapshot)
    const { error } = await supabaseAdmin
      .from('certificates')
      .update({
        template_id: template.id,
        issued_snapshot: snapshot,
        render_hash: hash,
      })
      .eq('enrollment_id', input.enrollment.id)

    if (error) throw error
    return snapshot
  }

  private async resolveTemplate(enrollment: EnrollmentRow): Promise<TemplateRow> {
    const beltKeys = beltLookupKeys(enrollment.belt_level)

    if (beltKeys.length > 0) {
      const { data: assignments, error: assignmentError } = await supabaseAdmin
        .from('certificate_template_assignments')
        .select('belt_level, template_id')
        .eq('program_id', enrollment.program_id)
        .in('belt_level', beltKeys)

      if (assignmentError) throw assignmentError

      const assignment = (assignments || []).find((row) =>
        beltKeys.includes(normalizeKey(String(row.belt_level || '')))
      )

      if (assignment?.template_id) {
        const { data: assignedTemplate, error: templateError } = await supabaseAdmin
          .from('certificate_templates')
          .select('*')
          .eq('id', assignment.template_id)
          .maybeSingle()

        if (templateError) throw templateError
        if (assignedTemplate) return assignedTemplate as TemplateRow
      }
    }

    const { data: templates, error } = await supabaseAdmin
      .from('certificate_templates')
      .select('*')
      .eq('program_id', enrollment.program_id)

    if (error) throw error

    const rows = (templates || []) as TemplateRow[]
    const exact = rows.find((template) => beltKeys.includes(normalizeKey(template.belt_level)))
    if (exact) return exact

    const defaultTemplate = rows.find((template) => !template.belt_level)
    if (defaultTemplate) return defaultTemplate

    const firstTemplate = rows[0]
    if (!firstTemplate) throw new Error('TEMPLATE_NOT_FOUND')

    return firstTemplate
  }

  private buildFieldValues(input: {
    enrollment: EnrollmentRow
    certificate: CertificateRecordRow
    programName: string
    programType: string
    studentName: string
  }): Record<string, string> {
    const certificateNumber = input.certificate.certificate_number || 'SKF-C-PENDING'
    const beltLevel = input.enrollment.belt_level || ''
    const typeLabel = certificateTypeLabel(input.certificate.certificate_type)

    return {
      student_name: input.studentName,
      name: input.studentName,
      skf_id: input.enrollment.skf_id,
      skf: input.enrollment.skf_id,
      belt_level: beltLevel,
      belt: beltLevel,
      rank: beltLevel,
      kyu_or_dan: beltLevel,
      completion_date: formatDate(input.enrollment.completion_date),
      date: formatDate(input.enrollment.completion_date),
      issuer_name: input.enrollment.issuer_name || 'Chief Instructor',
      issuer: input.enrollment.issuer_name || 'Chief Instructor',
      program_name: input.programName,
      program: input.programName,
      certificate_number: certificateNumber,
      certificate_registration_no: `Certificate Registration No.: ${certificateNumber}`,
      registration_number: certificateNumber,
      verification_code: input.certificate.verification_code,
      certificate_type: typeLabel,
      type: typeLabel,
    }
  }

  private valueForField(field: TemplateField, fieldValues: Record<string, string>) {
    const label = normalizeKey(field.label).replace(/-/g, '_')
    return fieldValues[label] || fieldValues[field.label] || field.value || ''
  }
}
