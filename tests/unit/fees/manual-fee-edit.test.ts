import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  from: vi.fn(),
  update: vi.fn(),
  upsert: vi.fn(),
  is: vi.fn(),
}))

vi.mock('@/lib/server/supabase', () => ({
  isSupabaseReady: () => true,
  supabaseAdmin: {
    from: state.from,
  },
}))

import { ensureFeeRowsForStudent } from '@/lib/server/repositories/fee-records'

type Query = {
  select: ReturnType<typeof vi.fn>
  eq: ReturnType<typeof vi.fn>
  in?: ReturnType<typeof vi.fn>
  is?: ReturnType<typeof vi.fn>
  then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) => Promise<unknown>
}

function thenable(value: unknown) {
  return (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
    Promise.resolve(value).then(resolve, reject)
}

describe('manual monthly fee edits survive sync', () => {
  let existingMetadata: Record<string, unknown>

  beforeEach(() => {
    existingMetadata = { manualFeeEdit: { amount: 1800, editedAt: '2026-06-01T00:00:00.000Z' } }
    state.from.mockReset()
    state.update.mockReset()
    state.upsert.mockReset()
    state.is.mockReset()

    const selectQuery: Query = {
      select: vi.fn(() => selectQuery),
      eq: vi.fn(() => selectQuery),
      then: thenable({
        data: [
          {
            month: 'June',
            amount: 1800,
            status: 'due',
            source_key: '',
            get metadata() { return existingMetadata },
          },
        ],
        error: null,
      }) as Query['then'],
    }

    const updateQuery: Query = {
      select: vi.fn(() => updateQuery),
      eq: vi.fn(() => updateQuery),
      in: vi.fn(() => updateQuery),
      is: vi.fn((column: string, value: unknown) => {
        state.is(column, value)
        return updateQuery
      }),
      then: thenable({ error: null }) as Query['then'],
    }

    state.from.mockImplementation((table: string) => {
      if (table !== 'fee_records') throw new Error(`Unexpected table ${table}`)
      return {
        select: () => selectQuery,
        update: (payload: unknown) => {
          state.update(payload)
          return updateQuery
        },
        upsert: (payload: unknown, options: unknown) => {
          state.upsert(payload, options)
          return Promise.resolve({ error: null })
        },
      }
    })
  })

  it('does not overwrite an amount protected by manualFeeEdit', async () => {
    const result = await ensureFeeRowsForStudent('SKF26TEST001', {
      monthlyFee: 2500,
      year: 2026,
      enrolledDate: '2026-01-01',
      monthIndexes: [5],
      overwriteAmount: true,
    })

    expect(result).toEqual({ created: 0, updated: 0 })
    expect(state.update).not.toHaveBeenCalled()
    expect(state.upsert).not.toHaveBeenCalled()
  })

  it('guards the bulk amount update against rows edited after the read', async () => {
    existingMetadata = {}
    const result = await ensureFeeRowsForStudent('SKF26TEST001', {
      monthlyFee: 2500,
      year: 2026,
      enrolledDate: '2026-01-01',
      monthIndexes: [5],
      overwriteAmount: true,
    })

    expect(result).toEqual({ created: 0, updated: 1 })
    expect(state.is).toHaveBeenCalledWith('metadata->manualFeeEdit', null)
    expect(state.update).toHaveBeenCalled()
  })
})
