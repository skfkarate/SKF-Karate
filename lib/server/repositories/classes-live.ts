import { type Branch, type City, type School, cities as staticCities } from '@/lib/classesData'
import type { SenseiSummary } from '@/lib/types/sensei'
import { cache } from 'react'

import { ApiError } from '../api'
import { isSupabaseReady, supabaseAdmin } from '../supabase'
import { buildStaticSenseiDataset } from './senseis-live'
import { logger } from '@/src/server/lib/logger'

type SchoolRecord = School & { id: string; sortOrder?: number }

type CityRow = {
  slug: string
  name: string
  state: string
  photo_url: string | null
  sort_order: number | null
}

type BranchRow = {
  slug: string
  city_slug: string
  lead_sensei_id: string | null
  name: string
  is_hq: boolean | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  sensei: string | null
  sensei_dan: string | null
  class_days: unknown
  class_time: string | null
  map_url: string | null
  photos: unknown
  description: string | null
  sort_order: number | null
}

type SenseiSummaryRow = {
  id: string
  slug: string
  name: string
  title: string | null
  dan: string | null
  role: string | null
  specialty: string | null
  description: string | null
  image_url: string | null
  accent_color: string | null
  is_public: boolean | null
  is_active: boolean | null
  is_assignable: boolean | null
}

type SchoolRow = {
  id: string
  city_slug: string
  name: string
  city: string | null
  sort_order: number | null
}

type DatabaseWriteError = {
  code?: string
  message?: string
}

function cloneData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function ensureSupabaseForClassesAdmin() {
  if (!isSupabaseReady()) {
    throw new ApiError(
      500,
      'Classes admin requires Supabase to be configured.'
    )
  }
}

function normalizeText(value: unknown, label: string, options: { required?: boolean; max?: number } = {}) {
  const normalized = String(value ?? '').trim()
  const max = options.max ?? 500

  if (!normalized) {
    if (options.required) {
      throw new ApiError(400, `${label} is required.`)
    }
    return ''
  }

  if (normalized.length > max) {
    throw new ApiError(400, `${label} is too long.`)
  }

  return normalized
}

function normalizeOptionalText(value: unknown, max = 500) {
  const normalized = String(value ?? '').trim()
  if (!normalized) return ''
  if (normalized.length > max) {
    throw new ApiError(400, 'Value is too long.')
  }
  return normalized
}

function normalizeSlug(value: unknown, fallback: string, label: string) {
  const normalized = slugify(String(value ?? '') || fallback)
  if (!normalized) {
    throw new ApiError(400, `${label} is required.`)
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(normalized)) {
    throw new ApiError(400, `${label} is invalid.`)
  }

  return normalized
}

function normalizeSortOrder(value: unknown, fallback = 0) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.max(0, Math.trunc(parsed))
}

function normalizeClassDays(value: unknown) {
  const source = Array.isArray(value)
    ? value
    : String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

  const normalized = source
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6)

  return [...new Set(normalized)].sort((a, b) => a - b)
}

function normalizePhotos(value: unknown) {
  const source = Array.isArray(value)
    ? value
    : String(value ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)

  return source.map((photo) => String(photo).trim()).filter(Boolean)
}

function mapSenseiRowToSummary(row: SenseiSummaryRow): SenseiSummary {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title || row.role || 'Lead Instructor',
    dan: row.dan || 'Lead Instructor',
    role: row.role || row.title || 'Lead Instructor',
    specialty: row.specialty || 'Karate Instruction',
    description: row.description || `${row.name} serves in the SKF Karate coaching team.`,
    imageUrl: row.image_url || '/no-profile/no profile male.png',
    hidePhoto: row.image_url ? (row.image_url.includes('/no-profile/') || row.image_url.includes('no profile')) : true,
    accent: row.accent_color === 'crimson' || row.accent_color === 'blue' || row.accent_color === 'neutral'
      ? row.accent_color
      : 'gold',
    isPublic: row.is_public !== false,
    isActive: row.is_active !== false,
    isAssignable: row.is_assignable !== false,
  }
}

function mapBranchRowToRecord(
  row: BranchRow,
  senseiMap: Map<string, SenseiSummary>
): Branch {
  const linkedSensei =
    row.lead_sensei_id && senseiMap.has(row.lead_sensei_id)
      ? senseiMap.get(row.lead_sensei_id) || null
      : null

  return {
    slug: row.slug,
    name: row.name,
    isHQ: Boolean(row.is_hq),
    city: row.city_slug,
    address: row.address || '',
    phone: row.phone || '',
    whatsapp: row.whatsapp || '',
    sensei: linkedSensei?.name || row.sensei || 'Sensei to be announced',
    senseiDan: linkedSensei?.dan || row.sensei_dan || 'Lead Instructor',
    classDays: Array.isArray(row.class_days)
      ? row.class_days.map((entry) => Number(entry)).filter((entry) => Number.isInteger(entry))
      : [],
    classTime: row.class_time || '',
    mapUrl: row.map_url || undefined,
    photos: Array.isArray(row.photos) ? row.photos.map((entry) => String(entry)) : [],
    description: row.description || '',
    senseiId: linkedSensei?.id || row.lead_sensei_id || null,
    senseiSlug: linkedSensei?.slug || null,
    senseiProfile: linkedSensei,
  }
}

function mapSchoolRowToRecord(row: SchoolRow): SchoolRecord {
  return {
    id: row.id,
    name: row.name,
    city: row.city || row.city_slug,
    sortOrder: row.sort_order || 0,
  }
}

function mapCityRowsToRecords(
  cityRows: CityRow[],
  branchRows: BranchRow[],
  schoolRows: SchoolRow[],
  senseiRows: SenseiSummaryRow[]
): City[] {
  const senseiMap = new Map(senseiRows.map((row) => [row.id, mapSenseiRowToSummary(row)]))

  return cityRows.map((cityRow) => ({
    slug: cityRow.slug,
    name: cityRow.name,
    state: cityRow.state,
    photo: cityRow.photo_url || '/gallery/In Dojo.jpeg',
    branches: branchRows
      .filter((branch) => branch.city_slug === cityRow.slug)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name))
      .map((branch) => mapBranchRowToRecord(branch, senseiMap)),
    schools: schoolRows
      .filter((school) => school.city_slug === cityRow.slug)
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || a.name.localeCompare(b.name))
      .map(mapSchoolRowToRecord),
  }))
}

async function readAllCitiesFromDatabase(): Promise<City[]> {
  const [
    { data: cityRows, error: cityError },
    { data: branchRows, error: branchError },
    { data: schoolRows, error: schoolError },
    { data: senseiRows, error: senseiError },
  ] =
    await Promise.all([
      supabaseAdmin.from('class_cities').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      supabaseAdmin.from('class_branches').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      supabaseAdmin.from('class_schools').select('*').order('sort_order', { ascending: true }).order('name', { ascending: true }),
      supabaseAdmin
        .from('senseis')
        .select('id,slug,name,title,dan,role,specialty,description,image_url,accent_color,is_public,is_active,is_assignable')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true }),
    ])

  if (cityError) throw cityError
  if (branchError) throw branchError
  if (schoolError) throw schoolError
  if (senseiError && senseiError.code !== 'PGRST205') throw senseiError

  return mapCityRowsToRecords(
    (cityRows || []) as CityRow[],
    (branchRows || []) as BranchRow[],
    (schoolRows || []) as SchoolRow[],
    (senseiRows || []) as SenseiSummaryRow[]
  )
}

function getStaticCityDataset() {
  return cloneData(staticCities)
}

function handleClassesWriteError(error: DatabaseWriteError, entityLabel: string): never {
  if (error?.code === 'PGRST205') {
    throw new ApiError(
      500,
      `Supabase schema is incomplete: missing classes tables. Run database/schema.sql in the connected Supabase project.`
    )
  }

  if (error?.code === '23505') {
    throw new ApiError(409, `${entityLabel} already exists.`)
  }

  throw new ApiError(500, error?.message || `Unable to persist the ${entityLabel.toLowerCase()}.`)
}

async function getSenseiSummaryById(id: string): Promise<SenseiSummary | null> {
  const normalized = normalizeOptionalText(id, 120)
  if (!normalized) return null

  const { data, error } = await supabaseAdmin
    .from('senseis')
    .select('id,slug,name,title,dan,role,specialty,description,image_url,accent_color,is_public,is_active,is_assignable')
    .eq('id', normalized)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) {
    handleClassesWriteError(error, 'Sensei')
  }

  return mapSenseiRowToSummary(data as SenseiSummaryRow)
}

async function resolveBranchSenseiPayload(
  input: Partial<Branch>,
  existing?: BranchRow
) {
  const requestedSenseiId = normalizeOptionalText(input.senseiId ?? existing?.lead_sensei_id, 120)

  if (requestedSenseiId) {
    const sensei = await getSenseiSummaryById(requestedSenseiId)
    if (!sensei) {
      throw new ApiError(400, 'Selected Sensei was not found.')
    }

    return {
      lead_sensei_id: sensei.id,
      sensei: sensei.name,
      sensei_dan: sensei.dan || sensei.title || 'Lead Instructor',
    }
  }

  return {
    lead_sensei_id: null,
    sensei:
      normalizeText(input.sensei ?? existing?.sensei ?? 'Sensei to be announced', 'Sensei', {
        required: true,
        max: 160,
      }) || 'Sensei to be announced',
    sensei_dan:
      normalizeText(input.senseiDan ?? existing?.sensei_dan ?? 'Lead Instructor', 'Sensei rank', {
        required: true,
        max: 120,
      }) || 'Lead Instructor',
  }
}

export const getAllCitiesLive = cache(async function getAllCitiesLive() {
  if (!isSupabaseReady()) {
    return getStaticCityDataset()
  }

  try {
    return cloneData(await readAllCitiesFromDatabase())
  } catch (error) {
    logger.warn('classes_live.static_fallback', { error })
    return getStaticCityDataset()
  }
})

export async function getCityBySlugLive(slug: string) {
  const cities = await getAllCitiesLive()
  return cities.find((city) => city.slug === slug) || null
}

export async function getBranchBySlugsLive(citySlug: string, branchSlug: string) {
  const city = await getCityBySlugLive(citySlug)
  if (!city) return null
  return city.branches.find((branch) => branch.slug === branchSlug) || null
}

export async function getAllBranchesLive() {
  const cities = await getAllCitiesLive()
  return cities.flatMap((city) =>
    city.branches.map((branch) => ({
      ...branch,
      cityName: city.name,
      state: city.state,
    }))
  )
}

export async function createCityLive(input: Partial<City> & { sortOrder?: number }) {
  ensureSupabaseForClassesAdmin()

  const name = normalizeText(input.name, 'City name', { required: true, max: 120 })
  const slug = normalizeSlug(input.slug, name, 'City slug')
  const state = normalizeText(input.state || 'Karnataka', 'State', { required: true, max: 120 })
  const photo = normalizeText(input.photo || '/gallery/In Dojo.jpeg', 'Photo', { max: 500 })
  const sortOrder = normalizeSortOrder(input.sortOrder, 0)

  const { error } = await supabaseAdmin.from('class_cities').insert({
    slug,
    name,
    state,
    photo_url: photo,
    sort_order: sortOrder,
  })

  if (error) {
    handleClassesWriteError(error, 'City')
  }

  return getCityBySlugLive(slug)
}

export async function updateCityLive(slug: string, input: Partial<City> & { sortOrder?: number }) {
  ensureSupabaseForClassesAdmin()
  const existing = await getCityBySlugLive(slug)
  if (!existing) return null

  const nextName = normalizeText(input.name ?? existing.name, 'City name', { required: true, max: 120 })
  const nextSlug = normalizeSlug(input.slug ?? slug, nextName, 'City slug')
  const nextState = normalizeText(input.state ?? existing.state, 'State', { required: true, max: 120 })
  const nextPhoto = normalizeText(input.photo ?? existing.photo, 'Photo', { max: 500 }) || '/gallery/In Dojo.jpeg'
  const sortOrder = normalizeSortOrder(input.sortOrder, 0)

  const { error } = await supabaseAdmin
    .from('class_cities')
    .update({
      slug: nextSlug,
      name: nextName,
      state: nextState,
      photo_url: nextPhoto,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)

  if (error) {
    handleClassesWriteError(error, 'City')
  }

  if (nextSlug !== slug) {
    await supabaseAdmin
      .from('class_branches')
      .update({ city_slug: nextSlug })
      .eq('city_slug', slug)
    await supabaseAdmin
      .from('class_schools')
      .update({ city_slug: nextSlug, city: nextSlug })
      .eq('city_slug', slug)
  }

  return getCityBySlugLive(nextSlug)
}

export async function deleteCityLive(slug: string) {
  ensureSupabaseForClassesAdmin()
  const { error } = await supabaseAdmin.from('class_cities').delete().eq('slug', slug)

  if (error) {
    handleClassesWriteError(error, 'City')
  }

  return true
}

export async function createBranchLive(input: Partial<Branch> & { sortOrder?: number }) {
  ensureSupabaseForClassesAdmin()

  const citySlug = normalizeText(input.city, 'City slug', { required: true, max: 120 })
  const name = normalizeText(input.name, 'Training centre name', { required: true, max: 160 })
  const slug = normalizeSlug(input.slug, name, 'Training centre slug')
  const sortOrder = normalizeSortOrder(input.sortOrder, 0)
  const senseiPayload = await resolveBranchSenseiPayload(input)

  const { error } = await supabaseAdmin.from('class_branches').insert({
    slug,
    city_slug: citySlug,
    lead_sensei_id: senseiPayload.lead_sensei_id,
    name,
    is_hq: Boolean(input.isHQ),
    address: normalizeText(input.address, 'Address', { required: true, max: 500 }),
    phone: normalizeText(input.phone, 'Phone', { required: true, max: 40 }),
    whatsapp: normalizeText(input.whatsapp, 'WhatsApp', { required: true, max: 40 }),
    sensei: senseiPayload.sensei,
    sensei_dan: senseiPayload.sensei_dan,
    class_days: normalizeClassDays(input.classDays),
    class_time: normalizeText(input.classTime, 'Class time', { required: true, max: 120 }),
    map_url: normalizeText(input.mapUrl, 'Map URL', { max: 500 }) || null,
    photos: normalizePhotos(input.photos),
    description: normalizeText(input.description, 'Description', { required: true, max: 2000 }),
    sort_order: sortOrder,
  })

  if (error) {
    handleClassesWriteError(error, 'Training centre')
  }

  return getBranchBySlugsLive(citySlug, slug)
}

export async function updateBranchLive(slug: string, input: Partial<Branch> & { sortOrder?: number }) {
  ensureSupabaseForClassesAdmin()

  const { data: branchRow, error: branchError } = await supabaseAdmin
    .from('class_branches')
    .select('*')
    .eq('slug', slug)
    .single()

  if (branchError?.code === 'PGRST116') return null
  if (branchError) handleClassesWriteError(branchError, 'Training centre')

  const existing = branchRow as BranchRow
  const nextCitySlug = normalizeText(input.city ?? existing.city_slug, 'City slug', { required: true, max: 120 })
  const nextName = normalizeText(input.name ?? existing.name, 'Training centre name', { required: true, max: 160 })
  const nextSlug = normalizeSlug(input.slug ?? existing.slug, nextName, 'Training centre slug')
  const sortOrder = normalizeSortOrder(input.sortOrder, existing.sort_order || 0)
  const senseiPayload = await resolveBranchSenseiPayload(input, existing)

  const { error } = await supabaseAdmin
    .from('class_branches')
    .update({
      slug: nextSlug,
      city_slug: nextCitySlug,
      lead_sensei_id: senseiPayload.lead_sensei_id,
      name: nextName,
      is_hq: typeof input.isHQ === 'boolean' ? input.isHQ : Boolean(existing.is_hq),
      address: normalizeText(input.address ?? existing.address, 'Address', { required: true, max: 500 }),
      phone: normalizeText(input.phone ?? existing.phone, 'Phone', { required: true, max: 40 }),
      whatsapp: normalizeText(input.whatsapp ?? existing.whatsapp, 'WhatsApp', { required: true, max: 40 }),
      sensei: senseiPayload.sensei,
      sensei_dan: senseiPayload.sensei_dan,
      class_days: normalizeClassDays(input.classDays ?? existing.class_days),
      class_time: normalizeText(input.classTime ?? existing.class_time, 'Class time', { required: true, max: 120 }),
      map_url: normalizeText(input.mapUrl ?? existing.map_url, 'Map URL', { max: 500 }) || null,
      photos: normalizePhotos(input.photos ?? existing.photos),
      description: normalizeText(input.description ?? existing.description, 'Description', { required: true, max: 2000 }),
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', slug)

  if (error) {
    handleClassesWriteError(error, 'Training centre')
  }

  return getBranchBySlugsLive(nextCitySlug, nextSlug)
}

export async function deleteBranchLive(slug: string) {
  ensureSupabaseForClassesAdmin()
  const { error } = await supabaseAdmin.from('class_branches').delete().eq('slug', slug)

  if (error) {
    handleClassesWriteError(error, 'Training centre')
  }

  return true
}

export async function createSchoolLive(input: Partial<SchoolRecord>) {
  ensureSupabaseForClassesAdmin()

  const citySlug = normalizeText(input.city, 'City slug', { required: true, max: 120 })
  const name = normalizeText(input.name, 'School name', { required: true, max: 200 })
  const id = normalizeSlug(input.id, `${citySlug}-${name}`, 'School id')
  const sortOrder = normalizeSortOrder(input.sortOrder, 0)

  const { error } = await supabaseAdmin.from('class_schools').insert({
    id,
    city_slug: citySlug,
    city: citySlug,
    name,
    sort_order: sortOrder,
  })

  if (error) {
    handleClassesWriteError(error, 'School')
  }

  const city = await getCityBySlugLive(citySlug)
  return city?.schools.find((school) => school.id === id) || null
}

export async function updateSchoolLive(id: string, input: Partial<SchoolRecord>) {
  ensureSupabaseForClassesAdmin()

  const { data: schoolRow, error: schoolError } = await supabaseAdmin
    .from('class_schools')
    .select('*')
    .eq('id', id)
    .single()

  if (schoolError?.code === 'PGRST116') return null
  if (schoolError) handleClassesWriteError(schoolError, 'School')

  const existing = schoolRow as SchoolRow
  const nextCitySlug = normalizeText(input.city ?? existing.city_slug, 'City slug', { required: true, max: 120 })
  const nextName = normalizeText(input.name ?? existing.name, 'School name', { required: true, max: 200 })
  const nextId = normalizeSlug(input.id ?? existing.id, `${nextCitySlug}-${nextName}`, 'School id')
  const sortOrder = normalizeSortOrder(input.sortOrder, existing.sort_order || 0)

  const { error } = await supabaseAdmin
    .from('class_schools')
    .update({
      id: nextId,
      city_slug: nextCitySlug,
      city: nextCitySlug,
      name: nextName,
      sort_order: sortOrder,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    handleClassesWriteError(error, 'School')
  }

  const city = await getCityBySlugLive(nextCitySlug)
  return city?.schools.find((school) => school.id === nextId) || null
}

export async function deleteSchoolLive(id: string) {
  ensureSupabaseForClassesAdmin()
  const { error } = await supabaseAdmin.from('class_schools').delete().eq('id', id)

  if (error) {
    handleClassesWriteError(error, 'School')
  }

  return true
}

export async function syncStaticClassesToLive(options: { replace?: boolean } = {}) {
  ensureSupabaseForClassesAdmin()

  const replace = Boolean(options.replace)
  const staticSenseis = buildStaticSenseiDataset()
  const senseiByName = new Map(
    staticSenseis.map((sensei) => [
      String(sensei.name || '').trim().toLowerCase(),
      sensei,
    ])
  )
  const cityRows = staticCities.map((city, index) => ({
    slug: city.slug,
    name: city.name,
    state: city.state,
    photo_url: city.photo,
    sort_order: index,
  }))
  const branchRows = staticCities.flatMap((city, cityIndex) =>
    city.branches.map((branch, branchIndex) => ({
      slug: branch.slug,
      city_slug: city.slug,
      lead_sensei_id: senseiByName.get(String(branch.sensei || '').trim().toLowerCase())?.id || null,
      name: branch.name,
      is_hq: Boolean(branch.isHQ),
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      sensei: senseiByName.get(String(branch.sensei || '').trim().toLowerCase())?.name || branch.sensei,
      sensei_dan:
        senseiByName.get(String(branch.sensei || '').trim().toLowerCase())?.dan ||
        branch.senseiDan,
      class_days: branch.classDays,
      class_time: branch.classTime,
      map_url: branch.mapUrl || null,
      photos: branch.photos,
      description: branch.description,
      sort_order: cityIndex * 100 + branchIndex,
    }))
  )
  const schoolRows = staticCities.flatMap((city, cityIndex) =>
    city.schools.map((school, schoolIndex) => ({
      id: slugify(`${city.slug}-${school.name}`),
      city_slug: city.slug,
      city: city.slug,
      name: school.name,
      sort_order: cityIndex * 100 + schoolIndex,
    }))
  )

  const { error: cityError } = await supabaseAdmin
    .from('class_cities')
    .upsert(cityRows, { onConflict: 'slug' })
  if (cityError) handleClassesWriteError(cityError, 'City')

  const { error: senseiError } = await supabaseAdmin
    .from('senseis')
    .upsert(
      staticSenseis.map((sensei) => ({
        id: sensei.id,
        slug: sensei.slug,
        name: sensei.name,
        title: sensei.title,
        dan: sensei.dan,
        role: sensei.role,
        specialty: sensei.specialty,
        experience: sensei.experience,
        description: sensei.description,
        full_bio: sensei.fullBio,
        achievements: sensei.achievements,
        quote: sensei.quote,
        image_url: sensei.imageUrl,
        accent_color: sensei.accent,
        is_founder: sensei.isFounder,
        is_executive_committee: sensei.isExecutiveCommittee,
        is_public: sensei.isPublic,
        is_active: sensei.isActive,
        is_assignable: sensei.isAssignable,
        sort_order: sensei.sortOrder,
      })),
      { onConflict: 'id' }
    )
  if (senseiError) handleClassesWriteError(senseiError, 'Sensei')

  const { error: branchError } = await supabaseAdmin
    .from('class_branches')
    .upsert(branchRows, { onConflict: 'slug' })
  if (branchError) handleClassesWriteError(branchError, 'Training centre')

  const { error: schoolError } = await supabaseAdmin
    .from('class_schools')
    .upsert(schoolRows, { onConflict: 'id' })
  if (schoolError) handleClassesWriteError(schoolError, 'School')

  if (replace) {
    const citySlugs = cityRows.map((city) => city.slug)
    const branchSlugs = branchRows.map((branch) => branch.slug)
    const schoolIds = schoolRows.map((school) => school.id)

    await supabaseAdmin.from('class_schools').delete().not('id', 'in', `(${schoolIds.map((id) => `"${id}"`).join(',')})`)
    await supabaseAdmin.from('class_branches').delete().not('slug', 'in', `(${branchSlugs.map((slug) => `"${slug}"`).join(',')})`)
    await supabaseAdmin.from('class_cities').delete().not('slug', 'in', `(${citySlugs.map((slug) => `"${slug}"`).join(',')})`)
  }

  return getAllCitiesLive()
}
