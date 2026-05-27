/**
 * blackbelt-live.ts — Repository for Black Belt Examination Program data.
 *
 * All reads go through supabaseAdmin (service_role).
 * This follows the same pattern as athletes-live.ts and events-live.ts.
 */

import { supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'

/* ═══════════════════ Types ═══════════════════ */

export interface BBProgram {
  id: string
  title: string
  slug: string
  tagline: string
  exam_date: string | null
  program_start: string | null
  program_end: string | null
  status: 'draft' | 'active' | 'completed' | 'archived'
  exam_components: ExamComponent[]
  wkf_documents: WKFDocument[]
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ExamComponent {
  id: string
  name: string
  weight: number
  description: string
}

export interface WKFDocument {
  id: string
  title: string
  url: string
  description: string
}

export interface BBCandidate {
  id: string
  program_id: string
  skf_id: string
  display_name: string
  display_code: string | null
  photo_url: string | null
  weapon_group: 'bo_staff' | 'nunchaku'
  bunkai_group: 'group_a' | 'group_b'
  self_defense_day: 'tuesday' | 'friday' | 'saturday'

  first_aid_status: 'not_started' | 'in_progress' | 'completed'
  first_aid_cert_date: string | null

  marketing_status: 'in_progress' | 'enrolled'
  enrolled_student_name: string | null
  enrolled_student_date: string | null

  enrollment_fee_status: 'pending' | 'verifying' | 'paid'

  tournament_kata_status: 'not_won' | 'won'
  tournament_kata_event: string | null
  tournament_kata_date: string | null
  tournament_kumite_status: 'not_won' | 'won'
  tournament_kumite_event: string | null
  tournament_kumite_date: string | null

  fitness_baseline_done: boolean
  fitness_baseline_data: FitnessData
  fitness_retest_done: boolean
  fitness_retest_data: FitnessData
  fitness_months?: {
    month_1?: FitnessData
    month_2?: FitnessData
    month_3?: FitnessData
    month_4?: FitnessData
    month_5?: FitnessData
  }
  fitness_improved: boolean | null

  wkf_kumite_status: 'not_started' | 'reading' | 'quiz_passed'
  wkf_kata_status: 'not_started' | 'reading' | 'quiz_passed'
  wkf_referee_status: 'not_started' | 'in_progress' | 'reviewed'

  weapon_status: 'not_started' | 'in_progress' | 'exam_ready'
  bunkai_status: 'not_done' | 'internal_demo' | 'taught_to_kids'

  self_defense_months: Record<string, boolean>

  video_count: number
  video_target: number

  teaching_status: 'active' | 'ongoing' | 'flagged'
  teaching_hours: number
  mock_exam_done: boolean

  readiness: 'on_track' | 'attention_needed' | 'exam_ready'

  exam_score: number | null
  exam_result: 'pass' | 'conditional' | 'defer' | null
  exam_component_scores: Record<string, number>

  instructor_notes: string

  sort_order: number
  created_at: string
  updated_at: string
}

export interface FitnessData {
  pushups?: number
  pullups?: number
  situps?: number
  run_time?: string
  leg_split?: number
}

export interface BBProgressEntry {
  id: string
  candidate_id: string
  entry_type: string
  title: string
  description: string
  month_number: number | null
  entry_date: string
  metadata: Record<string, unknown>
  is_private: boolean
  created_at: string
}

/* ═══════════════════ Queries ═══════════════════ */

/**
 * Get the currently active BB program (only one should be active at a time).
 */
export async function getActiveBBProgram(): Promise<BBProgram | null> {
  const { data, error } = await supabaseAdmin
    .from('bb_programs')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    logger.error('blackbelt_live.active_program_failed', { error })
    return null
  }

  return data as BBProgram | null
}

/**
 * Get all candidates for a program, ordered by sort_order.
 */
export async function getAllBBCandidates(programId: string): Promise<BBCandidate[]> {
  const { data, error } = await supabaseAdmin
    .from('bb_candidates')
    .select('*')
    .eq('program_id', programId)
    .order('sort_order', { ascending: true })

  if (error) {
    logger.error('blackbelt_live.candidates_load_failed', { programId, error })
    return []
  }

  return (data || []) as BBCandidate[]
}

/**
 * Get a specific candidate by their SKF ID within a program.
 */
export async function getBBCandidateBySkfId(
  programId: string,
  skfId: string
): Promise<BBCandidate | null> {
  const { data, error } = await supabaseAdmin
    .from('bb_candidates')
    .select('*')
    .eq('program_id', programId)
    .eq('skf_id', skfId)
    .maybeSingle()

  if (error) {
    logger.error('blackbelt_live.candidate_by_skf_id_failed', { programId, skfId, error })
    return null
  }

  return data as BBCandidate | null
}

/**
 * True only when the athlete is assigned to the currently active Black Belt program.
 * Used by both the portal navigation and the route guard so visibility matches access.
 */
export async function isActiveBBCandidate(skfId?: string | null): Promise<boolean> {
  const normalizedSkfId = String(skfId || '').trim()
  if (!normalizedSkfId) return false

  const program = await getActiveBBProgram()
  if (!program) return false

  const candidate = await getBBCandidateBySkfId(program.id, normalizedSkfId)
  return Boolean(candidate)
}

/**
 * Get progress entries for a candidate (public entries only).
 */
export async function getBBCandidateProgress(
  candidateId: string,
  includePrivate = false
): Promise<BBProgressEntry[]> {
  let query = supabaseAdmin
    .from('bb_progress_entries')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('entry_date', { ascending: false })

  if (!includePrivate) {
    query = query.eq('is_private', false)
  }

  const { data, error } = await query

  if (error) {
    logger.error('blackbelt_live.candidate_progress_failed', { candidateId, error })
    return []
  }

  return (data || []) as BBProgressEntry[]
}

/**
 * Full portal data bundle: program + all candidates + their public progress.
 * This is the single query used by the portal page.
 */
export async function getBBProgramForPortal() {
  const program = await getActiveBBProgram()
  if (!program) return null

  const candidates = await getAllBBCandidates(program.id)

  // Fetch public progress for all candidates in parallel
  const progressMap: Record<string, BBProgressEntry[]> = {}
  await Promise.all(
    candidates.map(async (c) => {
      progressMap[c.id] = await getBBCandidateProgress(c.id, false)
    })
  )

  return {
    program,
    candidates,
    progressMap,
  }
}
