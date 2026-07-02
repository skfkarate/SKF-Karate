import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  feeRows: [] as Array<Record<string, unknown>>,
  from: vi.fn(),
  insert: vi.fn(),
}))

vi.mock('@/lib/server/repositories/athletes-live', () => ({
  getAllAthletesLive: vi.fn(async () => []),
  getAthleteBySkfIdLive: vi.fn(async () => ({
    skfId: 'SKF21HE001',
    firstName: 'Ishaan',
    lastName: 'Gowda',
    branchName: 'Herohalli',
    parentName: 'Parent',
    phone: '9876543210',
    monthlyFee: 400,
    joinDate: '2021-01-01',
    status: 'active',
  })),
}))

vi.mock('@/lib/server/repositories/fee-records', () => ({
  ensureFeeRowsForStudent: vi.fn(),
}))

vi.mock('@/lib/server/profile-photos', () => ({
  getLocalProfilePhotoFile: vi.fn(() => null),
  resolveServerAthleteProfilePhoto: vi.fn(() => ''),
}))

vi.mock('@/lib/server/supabase', () => ({
  isSupabaseReady: () => true,
  supabaseAdmin: {
    from: state.from,
  },
}))

vi.mock('@/src/server/config/env', () => ({
  env: {
    NEXT_PUBLIC_SITE_URL: 'https://www.skfkarate.org',
  },
}))

vi.mock('@/src/server/services/telegram.service', () => ({
  hasTelegramChannel: vi.fn(() => false),
  sendTelegramMessage: vi.fn(),
  sendTelegramPhoto: vi.fn(),
}))

vi.mock('@/src/server/services/fee-receipts.service', () => ({
  FeeReceiptsService: {
    ensureReceipt: vi.fn(),
    getReceiptForStudent: vi.fn(),
    voidReceipt: vi.fn(),
  },
}))

import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

function createSelectQuery(rows: Array<Record<string, unknown>>) {
  const query = {
    select: () => query,
    eq: () => query,
    in: () => query,
    order: () => query,
    then: (
      resolve: (value: { data: Array<Record<string, unknown>>; error: null }) => unknown,
      reject?: (reason?: unknown) => unknown
    ) => Promise.resolve({ data: rows, error: null }).then(resolve, reject),
  }
  return query
}

describe('fee reminder messages', () => {
  beforeEach(() => {
    state.insert.mockReset()
    state.from.mockReset()
    state.feeRows = [
      {
        id: '11111111-1111-4111-8111-111111111111',
        skf_id: 'SKF21HE001',
        fee_type: 'monthly',
        month: 'June',
        year: 2026,
        amount: 400,
        status: 'due',
        source_key: '',
        source_label: 'Monthly Fee',
        metadata: {},
      },
      {
        id: '22222222-2222-4222-8222-222222222222',
        skf_id: 'SKF21HE001',
        fee_type: 'belt_exam',
        month: 'October',
        year: 2026,
        amount: 5000,
        status: 'due',
        source_key: 'bb-exam-2026',
        source_label: 'Black Belt Examination 2026',
        metadata: {},
      },
    ]
    state.from.mockImplementation((table: string) => {
      if (table !== 'fee_records') throw new Error(`Unexpected table ${table}`)
      return createSelectQuery(state.feeRows)
    })
  })

  it('previews one message for selected monthly and belt examination dues without logging', async () => {
    const result = await FeeOperationsService.sendReminders({
      user: {
        id: 'staff-1',
        name: 'Sensei',
        role: 'admin',
        branchScope: 'all',
      },
    } as never, {
      channel: 'whatsapp',
      templateKey: 'selected_pending_fees',
      previewOnly: true,
      markFollowup: false,
      targets: [{
        skfId: 'SKF21HE001',
        feeRecordIds: [
          '11111111-1111-4111-8111-111111111111',
          '22222222-2222-4222-8222-222222222222',
        ],
      }],
    })

    expect(result.preparedCount).toBe(1)
    expect(result.failureCount).toBe(0)
    expect(state.insert).not.toHaveBeenCalled()
    expect(result.results[0]).toEqual(expect.objectContaining({
      success: true,
      status: 'prepared',
    }))
    expect(result.results[0].message).toContain('Black Belt Exam Installment - June 2026: ₹2,000')
    expect(result.results[0].message).toContain('Black Belt Examination 2026 - October 2026: ₹5,000')
    expect(result.results[0].message).toContain('Total pending: ₹7,000.')
    expect(result.results[0].selectedFees).toContainEqual(expect.objectContaining({
      feeRecordId: '11111111-1111-4111-8111-111111111111',
      amount: 2000,
      label: 'Black Belt Exam Installment',
    }))
    expect(result.results[0].messageUrl).toContain('https://wa.me/919876543210')
  })
})
