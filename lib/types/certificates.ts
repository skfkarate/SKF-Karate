/**
 * Certificate System Types — Re-exported from data/types/
 * DO NOT define new types here. Add them to /data/types/index.ts instead.
 */
export type {
  ProgramType,
  EnrollmentStatus,
  BeltLevel,
  FieldAlignment,
  DownloadFormat,
  Program,
  TemplateFieldConfig,
  CertificateTemplate,
  Enrollment,
  CertificateView,
} from '@/data/types'

// Belt color constants for UI accents — keep here since this is UI-specific rendering logic
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
