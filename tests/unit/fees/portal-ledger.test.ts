import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  athlete: {
    skfId: 'SKF26MP001',
    firstName: 'Asha',
    lastName: 'Kumar',
    branchName: 'M P Sports Club',
    monthlyFee: 1000,
    joinDate: '2026-01-10',
    status: 'active',
  },
  billingProfile: null as Record<string, unknown> | null,
  feeCredits: [] as Array<Record<string, unknown>>,
  feeRows: [] as Array<Record<string, unknown>>,
  ensureFeeRowsForStudent: vi.fn(),
  getFeesBySkfIdLive: vi.fn(),
  supabaseFrom: vi.fn(),
}))

vi.mock('@/lib/server/sheets', () => ({
  getStudentBySkfId: vi.fn(async () => null),
}))

vi.mock('@/lib/server/repositories/athletes-live', () => ({
  getAllAthletesLive: vi.fn(async () => [state.athlete]),
  getAthleteBySkfIdLive: vi.fn(async () => state.athlete),
}))

vi.mock('@/lib/server/repositories/fee-records', () => ({
  ensureFeeRowsForStudent: state.ensureFeeRowsForStudent,
  findFeeByReceiptIdLive: vi.fn(),
  getAllFeesLive: vi.fn(),
  getFeesBySkfIdLive: state.getFeesBySkfIdLive,
  markFeeAsPaid: vi.fn(),
  markFeeStatus: vi.fn(),
}))

vi.mock('@/lib/server/supabase', () => ({
  isSupabaseReady: () => true,
  supabaseAdmin: {
    from: state.supabaseFrom,
  },
}))

vi.mock('@/src/server/services/fee-receipts.service', () => ({
  FeeReceiptsService: {
    ensureReceipt: vi.fn(),
    getReceiptForStudent: vi.fn(),
    voidReceipt: vi.fn(),
  },
}))

import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

function monthlyFeeRow(month: string, status: string, amount = 1000) {
  return {
    id: `${month}-${status}`,
    skfId: 'SKF26MP001',
    feeType: 'monthly',
    month,
    year: 2026,
    amount,
    status,
    paidDate: status === 'paid' ? '2026-01-08T00:00:00.000Z' : '',
    receiptId: status === 'paid' ? `receipt-${month}` : '',
    paymentMethod: status === 'paid' ? 'manual' : '',
  }
}

function setupSupabaseMock() {
  state.supabaseFrom.mockImplementation((table: string) => {
    if (table === 'fee_credits') {
      return {
        select: () => ({
          eq: () => ({
            in: () => ({
              order: async () => ({
                data: state.feeCredits,
                error: null,
              }),
            }),
          }),
        }),
      }
    }

    if (table !== 'student_billing_profiles') {
      throw new Error(`Unexpected table ${table}`)
    }

    return {
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: state.billingProfile,
            error: null,
          }),
        }),
      }),
    }
  })
}

describe('portal fee ledger', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T00:00:00.000Z'))
    state.billingProfile = null
    state.feeCredits = []
    state.feeRows = []
    state.ensureFeeRowsForStudent.mockReset()
    state.ensureFeeRowsForStudent.mockResolvedValue({ created: 0, updated: 0 })
    state.getFeesBySkfIdLive.mockReset()
    state.getFeesBySkfIdLive.mockImplementation(async () => state.feeRows)
    state.supabaseFrom.mockReset()
    setupSupabaseMock()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('hides break and waived months from portal totals and history', async () => {
    state.feeRows = [
      monthlyFeeRow('January', 'paid'),
      monthlyFeeRow('February', 'break'),
      monthlyFeeRow('March', 'due'),
      monthlyFeeRow('April', 'waived'),
      monthlyFeeRow('May', 'due'),
    ]

    const ledger = await FeeLedgerService.getPortalLedger('skf26mp001', 2026)

    expect(ledger.entries.map((entry) => `${entry.month}:${entry.status}`)).toEqual([
      'May:due',
      'March:overdue',
      'January:paid',
    ])
    expect(ledger.summary.totalExpected).toBe(3000)
    expect(ledger.summary.totalDue).toBe(2000)
    expect(ledger.summary.dueCount).toBe(2)
  })

  it('does not create or show unpaid months after a discontinued billing end period', async () => {
    state.billingProfile = {
      billing_status: 'discontinued',
      billing_end_date: '2026-04-30',
    }
    state.feeRows = [
      monthlyFeeRow('March', 'paid'),
      monthlyFeeRow('April', 'due'),
      monthlyFeeRow('May', 'due'),
    ]

    const ledger = await FeeLedgerService.getPortalLedger('SKF26MP001', 2026)

    expect(state.ensureFeeRowsForStudent).not.toHaveBeenCalled()
    expect(ledger.entries).toEqual([
      expect.objectContaining({ month: 'March', status: 'paid' }),
    ])
    expect(ledger.summary.totalDue).toBe(0)
    expect(ledger.nextDue).toBeNull()
  })
})
