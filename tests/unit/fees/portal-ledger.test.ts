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
      'May:overdue',
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

  it('uses billing profile monthly fee when generating upcoming portal months', async () => {
    vi.setSystemTime(new Date('2026-06-30T00:00:00.000Z'))
    state.billingProfile = {
      billing_status: 'active',
      monthly_fee: 0,
    }
    state.feeRows = []

    await FeeLedgerService.getPortalLedger('SKF26MP001', 2026)

    expect(state.ensureFeeRowsForStudent).toHaveBeenCalledWith('SKF26MP001', expect.objectContaining({
      monthlyFee: 0,
      year: 2026,
      monthIndexes: [5, 6],
    }))
  })

  it('shows the temporary black belt installment amount for assigned candidates', async () => {
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'))
    state.feeRows = [
      {
        ...monthlyFeeRow('June', 'due', 400),
        skfId: 'SKF20HE001',
      },
    ]

    const ledger = await FeeLedgerService.getPortalLedger('SKF20HE001', 2026)

    expect(ledger.entries[0]).toEqual(expect.objectContaining({
      amount: 2000,
      sourceLabel: 'Black Belt Exam Installment',
    }))
    expect(ledger.summary.totalDue).toBe(2000)
  })

  it('keeps Roshan on the regular monthly amount during black belt installment months', async () => {
    vi.setSystemTime(new Date('2026-10-10T00:00:00.000Z'))
    state.feeRows = [
      {
        ...monthlyFeeRow('October', 'due', 1000),
        skfId: 'SKF13BL000',
      },
    ]

    const ledger = await FeeLedgerService.getPortalLedger('SKF13BL000', 2026)

    expect(ledger.entries[0]).toEqual(expect.objectContaining({
      amount: 1000,
      sourceLabel: '',
    }))
    expect(ledger.summary.totalDue).toBe(1000)
  })

  it('keeps a historical paid monthly row at the paid amount and shows the black belt balance separately', async () => {
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'))
    state.feeRows = [
      {
        ...monthlyFeeRow('June', 'paid', 500),
        skfId: 'SKF21HE003',
      },
      {
        id: 'black-belt-balance',
        skfId: 'SKF21HE003',
        feeType: 'other',
        month: 'June',
        year: 2026,
        amount: 1500,
        status: 'due',
        sourceKey: 'black_belt_balance:SKF21HE003:2026:June',
        sourceLabel: 'Black Belt Exam Installment Balance',
        dueDate: '2026-06-01',
      },
    ]

    const ledger = await FeeLedgerService.getPortalLedger('SKF21HE003', 2026)

    expect(ledger.entries).toEqual(expect.arrayContaining([
      expect.objectContaining({
        feeType: 'monthly',
        month: 'June',
        status: 'paid',
        amount: 500,
      }),
      expect.objectContaining({
        feeType: 'other',
        month: 'June',
        status: 'overdue',
        amount: 1500,
        sourceLabel: 'Black Belt Exam Installment Balance',
      }),
    ]))
    expect(ledger.summary.totalExpected).toBe(2000)
    expect(ledger.summary.totalPaid).toBe(500)
    expect(ledger.summary.totalDue).toBe(1500)
  })
})
