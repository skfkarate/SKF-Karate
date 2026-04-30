import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import type { LegacyProgramTemplateInput } from '@/src/server/api/validators/template.validator'
import { NotFoundError } from '@/src/server/lib/errors'

export class AdminProgramTemplateService {
  static async get(programId: string) {
    if (!isSupabaseReady()) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database not configured for certificate templates.')
      }
      return { template: null, mock: true }
    }

    const { data: template, error } = await supabaseAdmin
      .from('certificate_templates')
      .select('program_id, template_image_url, fields, use_qr_code')
      .eq('program_id', programId)
      .maybeSingle()

    if (error) {
      throw error
    }

    if (!template) {
      return { template: null }
    }

    return {
      template: {
        background_url: template.template_image_url,
        text_configs: template.fields,
        width_px: 2000,
        height_px: 1414,
        use_qr_code: template.use_qr_code,
      },
    }
  }

  static async save(programId: string, input: LegacyProgramTemplateInput) {
    if (!isSupabaseReady()) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database not configured for certificate templates.')
      }
      return { success: true, mock: true }
    }

    const { data: program, error: programError } = await supabaseAdmin
      .from('programs')
      .select('id')
      .eq('id', programId)
      .maybeSingle()

    if (programError) {
      throw programError
    }

    if (!program) {
      throw new NotFoundError('Program')
    }

    const { data, error } = await supabaseAdmin
      .from('certificate_templates')
      .upsert(
        {
          program_id: programId,
          belt_level: null,
          template_image_url: input.background_url,
          fields: input.text_configs,
          use_qr_code: false,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'program_id,belt_level' }
      )
      .select('program_id, template_image_url, fields, use_qr_code')
      .single()

    if (error) {
      throw error
    }

    return {
      template: {
        background_url: data.template_image_url,
        text_configs: data.fields,
        width_px: input.width_px,
        height_px: input.height_px,
        use_qr_code: data.use_qr_code,
      },
    }
  }
}
