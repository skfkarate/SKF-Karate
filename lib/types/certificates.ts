// Shared TypeScript interfaces for the SKF Karate Certificate System
// These types mirror the Supabase database schema defined in database/supabase_certificates.sql

export type ProgramType = 'camp' | 'belt_exam' | 'training' | 'tournament'
export type EnrollmentStatus = 'enrolled' | 'completed' | 'revoked'
export type BeltLevel = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'brown' | 'black'
export type FieldAlignment = 'left' | 'center' | 'right'
export type DownloadFormat = 'pdf' | 'png'

export interface Program {
  id: string
  name: string
  type: ProgramType
  branch?: string | null
  has_belt_subtypes: boolean
  is_active: boolean
  created_at: string
}

export interface TemplateFieldConfig {
  id: string
  label: string
  value: string
  x: number          // percentage 0-100
  y: number          // percentage 0-100
  fontSize: number   // base size at 1240px width
  fontFamily: string
  color: string      // hex
  align: FieldAlignment
  bold: boolean
}

export interface CertificateTemplate {
  id: string
  program_id: string
  belt_level: BeltLevel | null
  template_image_url: string
  fields: TemplateFieldConfig[]
  use_qr_code: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  skf_id: string
  program_id: string
  belt_level: string | null
  status: EnrollmentStatus
  completion_date: string | null
  issuer_name: string | null
  certificate_unlocked: boolean
  notification_sent: boolean
  enrolled_at: string
  updated_at: string
  // Joined fields
  programs?: Pick<Program, 'name' | 'type'> | null
}

export interface CertificateView {
  id: string
  skf_id: string
  enrollment_id: string
  viewed_at: string
  downloaded_at: string | null
  download_format: DownloadFormat | null
}

// Belt color constants for UI accents
export const BELT_COLORS: Record<string, string> = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  orange: '#FF8C00',
  green: '#228B22',
  blue: '#1E3A8A',
  purple: '#9B59B6',
  brown: '#8B4513',
  black: '#1a1a1a',
}

// Belt color accent for border/badge in UI components
export function getBeltAccentColor(belt: string | null | undefined): string {
  if (!belt) return 'rgba(255, 255, 255, 0.1)'
  const normalized = belt.toLowerCase()
  return BELT_COLORS[normalized] || 'rgba(255, 255, 255, 0.1)'
}
