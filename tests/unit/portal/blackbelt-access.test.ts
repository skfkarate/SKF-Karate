import { beforeEach, describe, expect, it, vi } from 'vitest'

type Row = Record<string, unknown>

const supabaseState = vi.hoisted(() => ({
  programs: [] as Row[],
  candidates: [] as Row[],
  progressEntries: [] as Row[],
  from: vi.fn(),
}))

vi.mock('@/lib/server/supabase', () => ({
  supabaseAdmin: {
    from: supabaseState.from,
  },
}))

vi.mock('@/src/server/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}))

const BLACK_BELT_CANDIDATES = [
  ['SKF13BL000', 'Shri Roshan P'],
  ['SKF20HE001', 'Sanjana S'],
  ['SKF20HE002', 'Tejashree S'],
  ['SKF20HE003', 'Ayush Kashyap G'],
  ['SKF21HE001', 'Ishaan Gowda B S'],
  ['SKF21HE003', 'Shashank R'],
] as const

function applyFilters(rows: Row[], filters: { column: string; value: unknown }[]) {
  return rows.filter(row => filters.every(filter => row[filter.column] === filter.value))
}

function sortRows(rows: Row[], orderBy: { column: string; ascending: boolean } | null) {
  if (!orderBy) return rows

  return [...rows].sort((a, b) => {
    const left = String(a[orderBy.column] ?? '')
    const right = String(b[orderBy.column] ?? '')
    if (left === right) return 0
    const result = left > right ? 1 : -1
    return orderBy.ascending ? result : -result
  })
}

function createSelectQuery(rows: Row[]) {
  const filters: { column: string; value: unknown }[] = []
  let orderBy: { column: string; ascending: boolean } | null = null
  let rowLimit: number | null = null

  const execute = () => {
    const filteredRows = sortRows(applyFilters(rows, filters), orderBy)
    return rowLimit === null ? filteredRows : filteredRows.slice(0, rowLimit)
  }

  const query = {
    select: () => query,
    eq: (column: string, value: unknown) => {
      filters.push({ column, value })
      return query
    },
    order: (column: string, options?: { ascending?: boolean }) => {
      orderBy = { column, ascending: options?.ascending !== false }
      return query
    },
    limit: (count: number) => {
      rowLimit = count
      return query
    },
    maybeSingle: async () => ({
      data: execute()[0] || null,
      error: null,
    }),
    then: (
      resolve: (value: { data: Row[]; error: null }) => unknown,
      reject?: (reason?: unknown) => unknown
    ) => Promise.resolve({ data: execute(), error: null }).then(resolve, reject),
  }

  return query
}

function setupSupabaseMock() {
  supabaseState.from.mockImplementation((table: string) => {
    if (table === 'bb_programs') return createSelectQuery(supabaseState.programs)
    if (table === 'bb_candidates') return createSelectQuery(supabaseState.candidates)
    if (table === 'bb_progress_entries') return createSelectQuery(supabaseState.progressEntries)
    throw new Error(`Unexpected table ${table}`)
  })
}

function program(overrides: Partial<Row> = {}) {
  return {
    id: 'program_completed',
    title: 'Black Belt Examination 2026',
    slug: 'bb-exam-2026',
    tagline: 'SKF Karate Black Belt Examination Program',
    exam_date: '2026-10-19',
    program_start: '2026-05-19',
    program_end: '2026-10-19',
    status: 'completed',
    exam_components: [],
    wkf_documents: [],
    config: {},
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

function candidate(overrides: Partial<Row> = {}) {
  return {
    id: 'candidate_sanjana',
    program_id: 'program_completed',
    skf_id: 'SKF20HE001',
    display_name: 'Sanjana S',
    display_code: 'BB-02',
    sort_order: 2,
    created_at: '2026-05-01T00:00:00.000Z',
    updated_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('black belt portal access', () => {
  beforeEach(() => {
    vi.resetModules()
    supabaseState.programs = []
    supabaseState.candidates = []
    supabaseState.progressEntries = []
    supabaseState.from.mockReset()
    setupSupabaseMock()
  })

  it.each(BLACK_BELT_CANDIDATES)(
    'keeps the portal link visible for %s when the assigned program is completed',
    async (skfId, displayName) => {
      supabaseState.programs = [program({ status: 'completed' })]
      supabaseState.candidates = [
        candidate({
          id: `candidate_${skfId}`,
          skf_id: skfId,
          display_name: displayName,
        }),
      ]

      const { isBBCandidate } = await import('@/lib/server/repositories/blackbelt-live')

      await expect(isBBCandidate(skfId.toLowerCase())).resolves.toBe(true)
    }
  )

  it('keeps the legacy active-candidate export aligned with candidate enrollment', async () => {
    supabaseState.programs = [program({ status: 'completed' })]
    supabaseState.candidates = [candidate()]

    const { isActiveBBCandidate } = await import('@/lib/server/repositories/blackbelt-live')

    await expect(isActiveBBCandidate('skf20he001')).resolves.toBe(true)
  })

  it('loads the candidate program by enrollment row instead of active status', async () => {
    supabaseState.programs = [program({ status: 'archived' })]
    supabaseState.candidates = [candidate()]

    const { getBBProgramForPortal } = await import('@/lib/server/repositories/blackbelt-live')

    const data = await getBBProgramForPortal('SKF20HE001')

    expect(data?.program.status).toBe('archived')
    expect(data?.candidates.map(row => row.skf_id)).toEqual(['SKF20HE001'])
  })

  it('normalizes stored and requested SKF IDs before denying access', async () => {
    supabaseState.programs = [program({ status: 'completed' })]
    supabaseState.candidates = [candidate({ skf_id: 'skf20he001' })]

    const { getBBProgramForPortal, isBBCandidate } = await import('@/lib/server/repositories/blackbelt-live')

    await expect(isBBCandidate('SKF20HE001')).resolves.toBe(true)

    const data = await getBBProgramForPortal('SKF20HE001')
    expect(data?.candidates.some(row => String(row.skf_id).toUpperCase() === 'SKF20HE001')).toBe(true)
  })

  it('hides the portal link only when the candidate enrollment row is gone', async () => {
    supabaseState.programs = [program({ status: 'active' })]
    supabaseState.candidates = []

    const { isBBCandidate } = await import('@/lib/server/repositories/blackbelt-live')

    await expect(isBBCandidate('SKF20HE001')).resolves.toBe(false)
  })

  it('keeps the shared nav allowlist limited to the six assigned candidates', async () => {
    const {
      BLACK_BELT_2026_CANDIDATE_IDS,
      isOfficialBlackBeltCandidateId,
    } = await import('@/data/constants/blackbelt')

    expect(BLACK_BELT_2026_CANDIDATE_IDS).toHaveLength(6)
    expect(isOfficialBlackBeltCandidateId('skf20he001')).toBe(true)
    expect(isOfficialBlackBeltCandidateId('SKF25MP001')).toBe(false)
  })
})
