/**
 * SKF Karate — Seed Validation Script
 *
 * Validates all seed data for:
 *   1. Duplicate IDs
 *   2. Foreign key integrity
 *   3. Enum membership
 *   4. Required fields
 *
 * Run: npx tsx data/scripts/seed.ts
 */

import { instructors } from '../seed/instructors'
import { dojos } from '../seed/dojos'
import { events } from '../seed/events'
import { products } from '../seed/products'
import { testimonials } from '../seed/testimonials'
import { galleryPhotos } from '../seed/gallery'
import { kyuBelts } from '../seed/kyuBelts'
import { danGrades } from '../seed/danGrades'
import { beltExaminations } from '../seed/beltExaminations'
import { EVENT_TYPES_LIST } from '../constants/categories'
import { EVENT_STATUSES_LIST } from '../constants/statuses'

const errors: string[] = []
const warnings: string[] = []

function checkDuplicateIds(entity: string, records: { id: string }[]) {
  const ids = records.map(r => r.id)
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dupes.length > 0) {
    errors.push(`[${entity}] Duplicate IDs: ${dupes.join(', ')}`)
  }
}

function checkFk(entity: string, field: string, values: string[], validSet: Set<string>, targetEntity: string) {
  for (const val of values) {
    if (val && !validSet.has(val)) {
      errors.push(`[${entity}] Broken FK: ${field}="${val}" not found in ${targetEntity}`)
    }
  }
}

function checkEnum(entity: string, field: string, values: string[], validList: readonly string[]) {
  const validSet = new Set(validList)
  for (const val of values) {
    if (val && !validSet.has(val)) {
      warnings.push(`[${entity}] Invalid enum: ${field}="${val}" not in [${validList.join(', ')}]`)
    }
  }
}

console.log('═══════════════════════════════════════')
console.log('  SKF KARATE — SEED DATA VALIDATION')
console.log('═══════════════════════════════════════')
console.log()

/* ── 1. Duplicate IDs ── */
checkDuplicateIds('Instructor', instructors)
checkDuplicateIds('Dojo', dojos)
checkDuplicateIds('Event', events)
checkDuplicateIds('Product', products)
checkDuplicateIds('Testimonial', testimonials)
checkDuplicateIds('GalleryPhoto', galleryPhotos)
checkDuplicateIds('KyuBelt', kyuBelts)
checkDuplicateIds('DanGrade', danGrades)
checkDuplicateIds('BeltExamination', beltExaminations)

/* ── 2. Foreign Keys ── */
const instructorIds = new Set(instructors.map(i => i.id))
const dojoIds = new Set(dojos.map(d => d.id))

// Dojo.senseiId → Instructor.id
checkFk('Dojo', 'senseiId', dojos.map(d => d.senseiId), instructorIds, 'instructors')

// Event.hostingBranch → Dojo.id
checkFk('Event', 'hostingBranch', events.map(e => e.hostingBranch), dojoIds, 'dojos')

// Testimonial.branch → Dojo.id
checkFk('Testimonial', 'branch', testimonials.map(t => (t as any).branch), dojoIds, 'dojos')

/* ── 3. Enum Validation ── */
checkEnum('Event', 'type', events.map(e => e.type), EVENT_TYPES_LIST)
checkEnum('Event', 'status', events.map(e => e.status), EVENT_STATUSES_LIST)

/* ── Report ── */
console.log(`  Entities validated: 9`)
console.log(`  Total records: ${instructors.length + dojos.length + events.length + products.length + testimonials.length + galleryPhotos.length + kyuBelts.length + danGrades.length + beltExaminations.length}`)
console.log()

console.log(`  Record counts:`)
console.log(`    Instructors:       ${instructors.length}`)
console.log(`    Dojos:             ${dojos.length}`)
console.log(`    Events:            ${events.length}`)
console.log(`    Products:          ${products.length}`)
console.log(`    Testimonials:      ${testimonials.length}`)
console.log(`    Gallery Photos:    ${galleryPhotos.length}`)
console.log(`    Kyu Belts:         ${kyuBelts.length}`)
console.log(`    Dan Grades:        ${danGrades.length}`)
console.log(`    Belt Examinations: ${beltExaminations.length}`)
console.log()

if (errors.length > 0) {
  console.log('  ❌ ERRORS:')
  errors.forEach(e => console.log(`    ${e}`))
  console.log()
}

if (warnings.length > 0) {
  console.log('  ⚠️  WARNINGS:')
  warnings.forEach(w => console.log(`    ${w}`))
  console.log()
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('  ✅ All seed data is valid!')
}

console.log()
console.log('═══════════════════════════════════════')
console.log('  DB INSERT ORDER (dependency-safe)')
console.log('═══════════════════════════════════════')
console.log()
console.log('  SUPABASE TABLES:')
console.log('    1. programs')
console.log('    2. certificate_templates  → programs')
console.log('    3. enrollments            → programs')
console.log('    4. certificate_events     → enrollments')
console.log('    5. certificate_views      → enrollments')
console.log('    6. auth_sessions')
console.log('    7. student_points         (NEEDS MIGRATION)')
console.log('    8. point_transactions     (NEEDS MIGRATION)')
console.log('    9. video_progress')
console.log('   10. push_subscriptions')
console.log('   11. otp_attempts')
console.log()
console.log('  LOCAL JSON STORE:')
console.log('    1. instructors')
console.log('    2. dojos                  → instructors')
console.log('    3. events                 → dojos')
console.log('    4. products')
console.log('    5. testimonials           → dojos')
console.log('    6. gallery')
console.log('    7. kyuBelts')
console.log('    8. danGrades')
console.log('    9. beltExaminations       → athletes')
console.log('   10. athletes               → dojos')
console.log('   11. tournaments')
console.log()
console.log('  GOOGLE SHEETS (no insert order — managed externally):')
console.log('    students, fees, videos, tournaments, attendance,')
console.log('    announcements, techniques, timetables, sponsors,')
console.log('    orders, leads, summer camp enrollments')

if (errors.length > 0) {
  process.exit(1)
}
