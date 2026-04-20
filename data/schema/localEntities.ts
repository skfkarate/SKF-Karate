import type { EntitySchema } from './types'

/**
 * Schema: product (local JSON seed data)
 * Source: data/seed/products.ts
 */
export const productSchema: EntitySchema = {
  entity: 'Product',
  tableName: 'products',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:          { type: 'string',  required: true, unique: true },
    name:        { type: 'string',  required: true },
    slug:        { type: 'string',  required: true, unique: true },
    description: { type: 'string',  required: true },
    price:       { type: 'number',  required: true },
    category:    { type: 'string',  required: true, description: 'From PRODUCT_CATEGORIES' },
    imageUrl:    { type: 'string',  required: false },
    images:      { type: 'array',   required: false },
    sizes:       { type: 'array',   required: false },
    inStock:     { type: 'boolean', required: true, default: true },
    rating:      { type: 'number',  required: false },
    reviewCount: { type: 'number',  required: false },
    isFeatured:  { type: 'boolean', required: false, default: false },
  },
  notes: 'Seed data in data/seed/products.ts. Used by shop checkout and orders.',
}

/**
 * Schema: testimonial (local JSON seed data)
 * Source: data/seed/testimonials.ts
 */
export const testimonialSchema: EntitySchema = {
  entity: 'Testimonial',
  tableName: 'testimonials',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:       { type: 'string', required: true, unique: true },
    name:     { type: 'string', required: true },
    role:     { type: 'string', required: true },
    branch:   { type: 'string', required: true, references: 'dojos.id' },
    content:  { type: 'string', required: true },
    rating:   { type: 'number', required: true },
    photoUrl: { type: 'string', required: false },
  },
  notes: 'Seed data in data/seed/testimonials.ts.',
}

/**
 * Schema: galleryPhoto (local JSON seed data)
 * Source: data/seed/gallery.ts
 */
export const galleryPhotoSchema: EntitySchema = {
  entity: 'GalleryPhoto',
  tableName: 'gallery',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:       { type: 'string', required: true, unique: true },
    src:      { type: 'string', required: true },
    alt:      { type: 'string', required: true },
    cat:      { type: 'string', required: true, description: 'From GALLERY_CATEGORIES' },
    featured: { type: 'boolean', required: false, default: false },
  },
  notes: 'Seed data in data/seed/gallery.ts.',
}

/**
 * Schema: kyuBelt (local JSON seed data)
 * Source: data/seed/kyuBelts.ts
 */
export const kyuBeltSchema: EntitySchema = {
  entity: 'KyuBelt',
  tableName: 'kyuBelts',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:          { type: 'string', required: true, unique: true },
    name:        { type: 'string', required: true },
    japanese:    { type: 'string', required: true },
    rank:        { type: 'number', required: true },
    color:       { type: 'string', required: true },
    description: { type: 'string', required: true },
    requirements: { type: 'array', required: false },
  },
  notes: 'Reference table for kyu belt descriptions.',
}

/**
 * Schema: danGrade (local JSON seed data)
 * Source: data/seed/danGrades.ts
 */
export const danGradeSchema: EntitySchema = {
  entity: 'DanGrade',
  tableName: 'danGrades',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:          { type: 'string', required: true, unique: true },
    name:        { type: 'string', required: true },
    japanese:    { type: 'string', required: true },
    rank:        { type: 'number', required: true },
    description: { type: 'string', required: true },
    minYears:    { type: 'number', required: false },
  },
  notes: 'Reference table for dan grade descriptions.',
}

/**
 * Schema: beltExamination (local JSON seed data)
 * Source: data/seed/beltExaminations.ts
 */
export const beltExaminationSchema: EntitySchema = {
  entity: 'BeltExamination',
  tableName: 'beltExaminations',
  primaryKey: 'id',
  storage: 'local',
  fields: {
    id:          { type: 'string', required: true, unique: true },
    athleteId:   { type: 'string', required: false, references: 'athletes.id', description: 'FK → athlete taking the exam' },
    name:        { type: 'string', required: true },
    date:        { type: 'date',   required: true },
    beltLevel:   { type: 'string', required: true },
    status:      { type: 'enum',   required: true, enumValues: ['Passed', 'Scheduled', 'Failed'] },
    examiner:    { type: 'string', required: false },
    notes:       { type: 'string', required: false },
  },
  notes: 'Seed data in data/seed/beltExaminations.ts.',
}
