import { supabaseAdmin } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'

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
}

export interface CertificateData {
  enrollmentId: string
  skfId: string
  studentName: string
  programName: string
  beltLevel: string | null
  completionDate: string
  issuerName: string
  templateImageUrl: string
  fields: TemplateField[]
  useQrCode: boolean
  verifyUrl: string
}

export class CertificateRenderer {
  async getData(enrollmentId: string, requestingSkfId: string, isAdmin: boolean): Promise<CertificateData> {
    const { data: enrollment } = await supabaseAdmin
      .from('enrollments')
      .select('*, programs(name, type), certificate_templates(*)')
      .eq('id', enrollmentId)
      .single()
    
    if (!enrollment) throw new Error('ENROLLMENT_NOT_FOUND')
    if (!enrollment.certificate_unlocked && !isAdmin) throw new Error('CERTIFICATE_LOCKED')
    if (enrollment.status !== 'completed' && !isAdmin) throw new Error('NOT_COMPLETED')
    if (enrollment.skf_id !== requestingSkfId && !isAdmin) throw new Error('FORBIDDEN')
    
    const student = await getStudentBySkfId(enrollment.skf_id)
    if (!student) throw new Error('STUDENT_NOT_FOUND')
    
    const template = enrollment.certificate_templates[0] || enrollment.certificate_templates // handle array or single depending on relation
    const fieldValues: Record<string, string> = {
      student_name: student.name,
      skf_id: enrollment.skf_id,
      belt_level: enrollment.belt_level || '',
      completion_date: new Date(enrollment.completion_date).toLocaleDateString('en-IN', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      }),
      issuer_name: enrollment.issuer_name || 'Chief Instructor',
      program_name: enrollment.programs.name
    }
    
    const processedFields: TemplateField[] = (template.fields as TemplateField[]).map(field => ({
      ...field,
      value: fieldValues[field.label] || field.value
    }))
    
    return {
      enrollmentId,
      skfId: enrollment.skf_id,
      studentName: student.name,
      programName: enrollment.programs.name,
      beltLevel: enrollment.belt_level,
      completionDate: enrollment.completion_date,
      issuerName: enrollment.issuer_name,
      templateImageUrl: `/api/certificates/template-image?url=${encodeURIComponent(template.template_image_url)}`,
      fields: processedFields,
      useQrCode: template.use_qr_code,
      verifyUrl: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${enrollment.skf_id}/${enrollmentId}`
    }
  }
}
