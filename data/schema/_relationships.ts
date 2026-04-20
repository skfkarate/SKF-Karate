import type { RelationshipDef } from './types'

/**
 * Master Relationship Map — ALL entities across ALL storage layers
 *
 * Covers: Supabase tables, local JSON store, Google Sheets
 * This is the single source of truth for all FK + entity relationships.
 */
export const relationships: Record<string, RelationshipDef> = {

  /* ═══════ LOCAL JSON STORE RELATIONSHIPS ═══════ */

  dojoToInstructor: {
    type: 'ONE_TO_ONE',
    from: 'dojos.senseiId',
    to: 'instructors.id',
    onDelete: 'RESTRICT',
    description: 'Each dojo has one lead sensei. senseiId must resolve to an instructor.',
  },

  instructorToDojo: {
    type: 'MANY_TO_ONE',
    from: 'instructors.dojoSlug',
    to: 'dojos.id',
    onDelete: 'SET_NULL',
    description: 'Instructor teaches at a dojo. Executive committee members have no dojoSlug.',
  },

  eventToDojo: {
    type: 'MANY_TO_ONE',
    from: 'events.hostingBranch',
    to: 'dojos.id',
    onDelete: 'RESTRICT',
    description: 'Event is hosted at a specific dojo/branch.',
  },

  testimonialToDojo: {
    type: 'MANY_TO_ONE',
    from: 'testimonials.branch',
    to: 'dojos.id',
    onDelete: 'SET_NULL',
    description: 'Testimonial is associated with a dojo/branch.',
  },

  athleteToDojo: {
    type: 'MANY_TO_ONE',
    from: 'athletes.branchName',
    to: 'dojos.name',
    onDelete: 'SET_NULL',
    description: 'Athlete trains at a branch. Note: uses branchName string, not slug ID.',
  },

  beltExamToAthlete: {
    type: 'MANY_TO_ONE',
    from: 'beltExaminations.athleteId',
    to: 'athletes.id',
    onDelete: 'CASCADE',
    description: 'Belt examination record for a specific athlete.',
  },

  /* ═══════ SUPABASE RELATIONSHIPS ═══════ */

  templateToProgram: {
    type: 'MANY_TO_ONE',
    from: 'certificate_templates.program_id',
    to: 'programs.id',
    onDelete: 'CASCADE',
    description: 'Certificate template belongs to a program. Unique per program+belt combo.',
  },

  enrollmentToProgram: {
    type: 'MANY_TO_ONE',
    from: 'enrollments.program_id',
    to: 'programs.id',
    onDelete: 'CASCADE',
    description: 'Student enrolled in a specific program.',
  },

  enrollmentToStudent: {
    type: 'MANY_TO_ONE',
    from: 'enrollments.skf_id',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Cross-storage FK: Supabase enrollment → Sheets student. Not a DB constraint.',
  },

  certEventToEnrollment: {
    type: 'MANY_TO_ONE',
    from: 'certificate_events.enrollment_id',
    to: 'enrollments.id',
    onDelete: 'CASCADE',
    description: 'Certificate event tracks interaction on a specific enrollment.',
  },

  certViewToEnrollment: {
    type: 'MANY_TO_ONE',
    from: 'certificate_views.enrollment_id',
    to: 'enrollments.id',
    onDelete: 'CASCADE',
    description: 'Certificate view/download record for a specific enrollment.',
  },

  videoProgressToStudent: {
    type: 'MANY_TO_ONE',
    from: 'video_progress.skf_id',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Cross-storage FK: Supabase video_progress → Sheets student.',
  },

  videoProgressToVideo: {
    type: 'MANY_TO_ONE',
    from: 'video_progress.video_id',
    to: 'videos.videoId',
    onDelete: 'RESTRICT',
    description: 'Cross-storage FK: Supabase video_progress → Sheets video. UNIQUE(skf_id, video_id).',
  },

  authSessionToStudent: {
    type: 'ONE_TO_ONE',
    from: 'auth_sessions.skf_id',
    to: 'students.skfId',
    onDelete: 'CASCADE',
    description: 'PIN auth session for a student. UNIQUE on skf_id.',
  },

  pointTransactionToStudent: {
    type: 'MANY_TO_ONE',
    from: 'point_transactions.skf_id',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Cross-storage FK: Supabase points → Sheets student.',
  },

  studentPointsToStudent: {
    type: 'ONE_TO_ONE',
    from: 'student_points.skf_id',
    to: 'students.skfId',
    onDelete: 'CASCADE',
    description: 'Aggregated point balance per student.',
  },

  pushSubscriptionToStudent: {
    type: 'ONE_TO_ONE',
    from: 'push_subscriptions.skf_id',
    to: 'students.skfId',
    onDelete: 'CASCADE',
    description: 'Web push subscription per student.',
  },

  /* ═══════ GOOGLE SHEETS RELATIONSHIPS ═══════ */

  feeToStudent: {
    type: 'MANY_TO_ONE',
    from: 'fees.skfId',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Monthly fee record per student. No DB constraint — enforced by Sheets column A.',
  },

  orderToStudent: {
    type: 'MANY_TO_ONE',
    from: 'orders.skfId',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Shop order placed by student.',
  },

  tournamentResultToStudent: {
    type: 'MANY_TO_ONE',
    from: 'tournaments.skfId',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Per-student tournament result record.',
  },

  attendanceToStudent: {
    type: 'MANY_TO_ONE',
    from: 'attendance.skfId',
    to: 'students.skfId',
    onDelete: 'RESTRICT',
    description: 'Daily attendance record per student.',
  },

  /* ═══════ CROSS-STORE: ATHLETE ↔ STUDENT ═══════ */

  athleteToStudent: {
    type: 'ONE_TO_ONE',
    from: 'athletes.registrationNumber',
    to: 'students.skfId',
    description: 'SAME PERSON in two stores. athlete.registrationNumber === student.skfId. Athlete has public profile/achievements; Student has identity/fees/auth.',
  },

  /* ═══════ PARENT/CHILD (Multi-Child Portal) ═══════ */

  parentToChildren: {
    type: 'ONE_TO_MANY',
    from: 'students.phone',
    to: 'students.phone',
    description: 'One parent phone → many children. Used by getStudentsByPhone() + ChildSwitcher component. Not a traditional FK — enforced by shared phone number.',
  },
}
