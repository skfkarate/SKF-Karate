import type { Session } from 'next-auth'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  expenses: [] as Array<Record<string, unknown>>,
  incomes: [] as Array<Record<string, unknown>>,
  supabaseFrom: vi.fn(),
}))

vi.mock('@/lib/server/supabase', () => ({
  isSupabaseReady: () => true,
  supabaseAdmin: {
    from: state.supabaseFrom,
  },
}))

vi.mock('@/lib/server/repositories/athletes-live', () => ({
  getAllAthletesLive: vi.fn(async () => []),
  getAthleteBySkfIdLive: vi.fn(async () => null),
}))

vi.mock('@/lib/server/repositories/fee-records', () => ({
  ensureFeeRowsForStudent: vi.fn(),
}))

vi.mock('@/src/server/services/fee-receipts.service', () => ({
  FeeReceiptsService: {
    ensureReceipt: vi.fn(),
    getReceiptForStudent: vi.fn(),
    voidReceipt: vi.fn(),
  },
}))

vi.mock('@/src/server/services/telegram.service', () => ({
  hasTelegramChannel: () => false,
  sendTelegramMessage: vi.fn(),
}))

import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const adminSession = {
  expires: new Date('2026-05-20T00:00:00.000Z').toISOString(),
  user: {
    id: 'admin',
    name: 'Admin',
    role: 'admin',
    branchScope: 'all',
  },
} as unknown as Session

function feeEntry(feeType: string, amount: number, metadata: Record<string, unknown> = {}) {
  return {
    id: `${feeType}-${amount}`,
    key: `${feeType}-${amount}`,
    skfId: 'SKF26MP001',
    athleteName: 'Asha Kumar',
    branch: 'M P Sports Club',
    feeType,
    month: 'March',
    monthIndex: 2,
    year: 2026,
    amount,
    status: 'paid',
    metadata,
  }
}

function setupSupabaseMock() {
  state.supabaseFrom.mockImplementation((table: string) => {
    if (table !== 'development_fund_expenses' && table !== 'fee_extra_incomes') {
      throw new Error(`Unexpected table ${table}`)
    }
    const rows = table === 'development_fund_expenses' ? state.expenses : state.incomes

    return {
      select: () => ({
        eq: () => ({
          is: () => ({
            order: async () => ({
              data: rows,
              error: null,
            }),
          }),
        }),
      }),
    }
  })
}

describe('fee finance calculations', () => {
  beforeEach(() => {
    state.expenses = []
    state.incomes = []
    state.supabaseFrom.mockReset()
    setupSupabaseMock()
    vi.spyOn(FeeOperationsService, 'getDataQuality').mockResolvedValue({ groups: [] } as never)
  })

  it('subtracts dress losses from gross income, bank movement, and development allocation', async () => {
    vi.spyOn(FeeOperationsService, 'getLedger').mockResolvedValue({
      entries: [
        feeEntry('monthly', 1000),
        feeEntry('credit_adjustment', 200),
        feeEntry('admission', 500),
        feeEntry('dress', 300, { dressCost: 800 }),
      ],
      citySummary: [],
      branchSummary: [],
      summary: {},
    } as never)
    state.expenses = [{ month: 'March', year: 2026, amount: 100, scope: 'Both' }]

    const finance = await FeeOperationsService.getFinance(adminSession, {
      year: 2026,
      month: 'March',
      city: 'bangalore',
    })

    const march = finance.monthlyBreakdown.find((row) => row.month === 'March')

    expect(march).toMatchObject({
      monthlyCollected: 1000,
      creditsApplied: 200,
      monthlyCash: 800,
      admissionCollected: 500,
      dressRevenue: 300,
      dressCost: 800,
      dressProfit: -500,
      grossIncome: 800,
      developmentAllocation: 240,
      developmentExpenses: 100,
      bankMovement: 700,
    })
    expect(finance.bankPosition).toMatchObject({
      grossIncome: 800,
      developmentAllocation: 240,
      developmentExpenses: 100,
      calculatedBankPosition: 700,
      actualBankBalance: 30700,
      developmentFundBalance: 140,
    })
  })

  it('does not create a negative development fund contribution when gross income is negative', async () => {
    vi.spyOn(FeeOperationsService, 'getLedger').mockResolvedValue({
      entries: [feeEntry('dress', 100, { dressCost: 600 })],
      citySummary: [],
      branchSummary: [],
      summary: {},
    } as never)

    const finance = await FeeOperationsService.getFinance(adminSession, {
      year: 2026,
      month: 'March',
      city: 'bangalore',
    })

    const march = finance.monthlyBreakdown.find((row) => row.month === 'March')

    expect(march).toMatchObject({
      dressProfit: -500,
      grossIncome: -500,
      developmentAllocation: 0,
      bankMovement: -500,
    })
    expect(finance.bankPosition).toMatchObject({
      grossIncome: -500,
      developmentAllocation: 0,
      calculatedBankPosition: -500,
      actualBankBalance: 29500,
      developmentFundBalance: 0,
    })
  })

  it('includes extra income in gross income and development allocation', async () => {
    vi.spyOn(FeeOperationsService, 'getLedger').mockResolvedValue({
      entries: [feeEntry('monthly', 1000)],
      citySummary: [],
      branchSummary: [],
      summary: {},
    } as never)
    state.incomes = [{ month: 'March', year: 2026, amount: 400, scope: 'Both' }]

    const finance = await FeeOperationsService.getFinance(adminSession, {
      year: 2026,
      month: 'March',
      city: 'bangalore',
    })

    const march = finance.monthlyBreakdown.find((row) => row.month === 'March')

    expect(march).toMatchObject({
      monthlyCollected: 1000,
      monthlyCash: 1000,
      extraIncome: 400,
      grossIncome: 1400,
      developmentAllocation: 420,
      bankMovement: 1400,
    })
    expect(finance.bankPosition).toMatchObject({
      grossIncome: 1400,
      developmentAllocation: 420,
      calculatedBankPosition: 1400,
      actualBankBalance: 31400,
      developmentFundBalance: 420,
    })
  })
})
