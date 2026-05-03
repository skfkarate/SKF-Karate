import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

type AthletePayload = Record<string, unknown>

const supabaseState = vi.hoisted(() => ({
  inserts: [] as AthletePayload[],
  updates: [] as AthletePayload[],
  from: vi.fn(),
}))

vi.mock('@/lib/server/supabase', () => ({
  isSupabaseReady: () => true,
  supabaseAdmin: {
    from: supabaseState.from,
  },
}))

function missingSkfIdColumnError() {
  return {
    code: 'PGRST204',
    message: "Could not find the 'skf_id' column of 'athletes' in the schema cache",
  }
}

function athleteRow(payload: AthletePayload) {
  return {
    id: String(payload.id || 'athlete_test'),
    registration_number: String(payload.registration_number || payload.skf_id || 'SKF26MP001'),
    first_name: String(payload.first_name || 'Asha'),
    last_name: String(payload.last_name || 'Kumar'),
    date_of_birth: String(payload.date_of_birth || '2012-01-10'),
    gender: String(payload.gender || 'female'),
    branch_name: String(payload.branch_name || 'M P Sports Club'),
    current_belt: String(payload.current_belt || 'white'),
    join_date: String(payload.join_date || '2026-01-10'),
    status: String(payload.status || 'active'),
    achievements: Array.isArray(payload.achievements) ? payload.achievements : [],
    created_at: String(payload.created_at || '2026-01-10T00:00:00.000Z'),
    updated_at: String(payload.updated_at || '2026-01-10T00:00:00.000Z'),
  }
}

function setupSupabaseMock(existingRows: AthletePayload[] = []) {
  supabaseState.from.mockImplementation((table: string) => {
    if (table !== 'athletes') throw new Error(`Unexpected table ${table}`)

    return {
      select: () => ({
        order: async () => ({
          data: existingRows,
          error: null,
        }),
        eq: () => ({
          single: async () => ({
            data: existingRows[0] || null,
            error: existingRows[0] ? null : { code: 'PGRST116' },
          }),
        }),
      }),
      insert: (payload: AthletePayload) => {
        supabaseState.inserts.push(payload)

        return {
          select: () => ({
            single: async () => {
              if ('skf_id' in payload) {
                return { data: null, error: missingSkfIdColumnError() }
              }

              return { data: athleteRow(payload), error: null }
            },
          }),
        }
      },
      update: (payload: AthletePayload) => {
        supabaseState.updates.push(payload)

        return {
          eq: () => ({
            select: () => ({
              single: async () => {
                if ('skf_id' in payload) {
                  return { data: null, error: missingSkfIdColumnError() }
                }

                return { data: athleteRow(payload), error: null }
              },
            }),
          }),
        }
      },
    }
  })
}

describe('athletes live schema compatibility', () => {
  beforeEach(() => {
    vi.resetModules()
    supabaseState.inserts = []
    supabaseState.updates = []
    supabaseState.from.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates athletes through registration_number when live Supabase has not migrated to skf_id', async () => {
    setupSupabaseMock()

    const { createAthleteLive } = await import('@/lib/server/repositories/athletes-live')

    const athlete = await createAthleteLive({
      skfId: 'SKF26MP001',
      firstName: 'Asha',
      lastName: 'Kumar',
      dateOfBirth: '2012-01-10',
      gender: 'female',
      branchName: 'M P Sports Club',
      joinDate: '2026-01-10',
      currentBelt: 'white',
    })

    expect(supabaseState.inserts).toHaveLength(2)
    expect(supabaseState.inserts[0]).toEqual(expect.objectContaining({ skf_id: 'SKF26MP001' }))
    expect(supabaseState.inserts[1]).toEqual(
      expect.objectContaining({ registration_number: 'SKF26MP001' })
    )
    expect(supabaseState.inserts[1]).not.toHaveProperty('skf_id')
    expect(athlete.skfId).toBe('SKF26MP001')
  })

  it('updates athletes through registration_number when live Supabase has not migrated to skf_id', async () => {
    setupSupabaseMock([
      athleteRow({
        id: 'athlete_existing',
        registration_number: 'SKF26MP002',
        first_name: 'Asha',
        last_name: 'Kumar',
      }),
    ])

    const { updateAthleteLive } = await import('@/lib/server/repositories/athletes-live')

    const athlete = await updateAthleteLive('athlete_existing', {
      firstName: 'Anika',
      skfId: 'SKF26MP002',
    })

    expect(supabaseState.updates).toHaveLength(2)
    expect(supabaseState.updates[0]).toEqual(expect.objectContaining({ skf_id: 'SKF26MP002' }))
    expect(supabaseState.updates[1]).toEqual(
      expect.objectContaining({
        registration_number: 'SKF26MP002',
        first_name: 'Anika',
      })
    )
    expect(supabaseState.updates[1]).not.toHaveProperty('skf_id')
    expect(athlete?.skfId).toBe('SKF26MP002')
  })
})
