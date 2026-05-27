import type { Session } from 'next-auth'

import { kyuBelts } from '@/data/seed/kyuBelts'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { getAllEventsAdminLive, getEventByIdAdminLive } from '@/lib/server/repositories/events-live'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { normaliseSkfId } from '@/lib/utils/registration'
import type {
  EventFeeConfigInput,
  EventFeeDepositInput,
  EventFeeExpenseInput,
  EventFeeGenerateInput,
  EventFeePreviewInput,
} from '@/src/server/api/validators/fees.validator'
import { AuthorizationError, ExternalServiceError, NotFoundError } from '@/src/server/lib/errors'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const WRITE_ROLES = new Set(['admin', 'instructor', 'fee_manager'])

type AthleteRecord = {
  skfId?: string | null
  firstName?: string | null
  lastName?: string | null
  branchName?: string | null
  currentBelt?: string | null
  status?: string | null
}

type EventLike = {
  id: string
  name: string
  type?: string
  date?: string
  hostingBranch?: string
  status?: string
  isPublished?: boolean
  participants?: Array<{ skfId?: string | null }>
}

type EventFeeConfig = EventFeeConfigInput & {
  eventName: string
  eventType: string
  eventDate: string
  status: string
}

type ExistingFeeRow = {
  id: string
  skf_id: string
  fee_type: string
  amount: number
  status: string
  receipt_id?: string | null
  branch_snapshot?: string | null
  source_id?: string | null
}

const BELT_SEQUENCE = kyuBelts.map((belt) => {
  const label = belt.belt
  const compact = label
    .toLowerCase()
    .replace(/\bbelt\b/g, '')
    .trim()
  const key = compact.replace(/\s+/g, '-')
  return {
    key,
    label,
    kyu: belt.kyu,
    aliases: new Set([
      key,
      label.toLowerCase(),
      compact,
      compact.replace(/\s+/g, ''),
      compact.replace(/\s+/g, '-'),
    ]),
  }
})

function requireFeeDatabase() {
  if (!isSupabaseReady()) {
    throw new ExternalServiceError('Fee database is not configured.')
  }
}

function throwEventFeeDatabaseError(error: unknown): never {
  const details = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  throw new ExternalServiceError(
    'Event fee database schema is not ready. Run database/migrations/023_event_fee_collections.sql in Supabase, then reload FeeTrack.',
    {
      code: details.code,
      message: details.message,
      hint: details.hint,
    }
  )
}

function actorRole(session: Session) {
  return String(session.user?.role || 'fee_viewer')
}

function actorName(session: Session) {
  return String(session.user?.name || session.user?.email || session.user?.id || 'FeeTrack Staff')
}

function assertWrite(session: Session) {
  if (!WRITE_ROLES.has(actorRole(session))) {
    throw new AuthorizationError('Fee viewer access is read-only.')
  }
}

function branchScope(session: Session) {
  return String((session.user as { branchScope?: string } | undefined)?.branchScope || 'all').trim()
}

function normalizeKey(value?: string | null) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canSeeBranch(session: Session, branch?: string | null) {
  const scope = normalizeKey(branchScope(session))
  if (!scope || scope === 'all') return true
  return normalizeKey(branch) === scope
}

function branchMatchesFilter(branch?: string | null, filter?: string | null) {
  const normalized = normalizeKey(filter)
  if (!normalized || normalized === 'overall' || normalized === 'all' || normalized === 'both') return true
  return normalizeKey(branch) === normalized
}

function normalizeAmount(value: unknown) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function athleteName(athlete?: AthleteRecord | null) {
  return [athlete?.firstName, athlete?.lastName].filter(Boolean).join(' ').trim() || 'SKF Athlete'
}

function monthNameFromDate(date?: string | null) {
  const parsed = date ? new Date(`${String(date).split('T')[0]}T00:00:00.000Z`) : null
  if (!parsed || !Number.isFinite(parsed.getTime())) return MONTHS[new Date().getMonth()]
  return MONTHS[parsed.getUTCMonth()]
}

function yearFromDate(date?: string | null) {
  const parsed = date ? new Date(`${String(date).split('T')[0]}T00:00:00.000Z`) : null
  if (!parsed || !Number.isFinite(parsed.getTime())) return new Date().getFullYear()
  return parsed.getUTCFullYear()
}

function dateOnly(value?: string | null, fallback?: string | null) {
  const raw = String(value || fallback || '').trim()
  if (!raw) return null
  const parsed = new Date(raw)
  if (!Number.isFinite(parsed.getTime())) return null
  return parsed.toISOString().slice(0, 10)
}

function feeCategoryForEvent(event: EventLike, explicit?: string): EventFeeConfig['feeCategory'] {
  if (explicit === 'belt_exam' || explicit === 'tournament' || explicit === 'event' || explicit === 'other') return explicit
  const type = normalizeKey(event.type)
  if (type.includes('belt') || type.includes('grading')) return 'belt_exam'
  if (type.includes('tournament')) return 'tournament'
  return 'event'
}

function eventFeeLabel(event: EventLike, config: EventFeeConfig) {
  if (config.feeCategory === 'belt_exam') return `${event.name} Belt Examination`
  if (config.feeCategory === 'tournament') return `${event.name} Tournament Fee`
  return `${event.name} Fee`
}

function normalizeBelt(value?: string | null) {
  const key = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\bbelt\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!key) return null

  for (const belt of BELT_SEQUENCE) {
    if (belt.aliases.has(key) || belt.aliases.has(key.replace(/\s+/g, '-')) || belt.aliases.has(key.replace(/\s+/g, ''))) {
      return belt
    }
  }

  if (key === 'green') return BELT_SEQUENCE.find((belt) => belt.key === 'green-ii') || null
  if (key === 'brown') return BELT_SEQUENCE.find((belt) => belt.key === 'brown-iii') || null
  return null
}

function nextBelt(value?: string | null) {
  const current = normalizeBelt(value)
  if (!current) return null
  const index = BELT_SEQUENCE.findIndex((belt) => belt.key === current.key)
  return index >= 0 ? BELT_SEQUENCE[index + 1] || null : null
}

function scopeList(input?: string[]) {
  return (Array.isArray(input) ? input : [])
    .map((item) => String(item || '').trim())
    .filter(Boolean)
}

function priceLookup(prices: Record<string, unknown>, ...keys: Array<string | null | undefined>) {
  for (const key of keys) {
    if (!key) continue
    const direct = prices[key]
    if (direct !== undefined) return normalizeAmount(direct)
    const normalizedKey = normalizeKey(key)
    const foundKey = Object.keys(prices || {}).find((candidate) => normalizeKey(candidate) === normalizedKey)
    if (foundKey) return normalizeAmount(prices[foundKey])
  }
  return null
}

function readOverrideMap(overrides: EventFeeConfigInput['studentOverrides'] = []) {
  return new Map(overrides.map((override) => [normaliseSkfId(override.skfId), override]))
}

function mapConfig(row: Record<string, unknown>, event?: EventLike | null): EventFeeConfig {
  return {
    eventId: String(row.event_id || event?.id || ''),
    eventName: String(row.event_name || event?.name || ''),
    eventType: String(row.event_type || event?.type || ''),
    eventDate: String(row.event_date || event?.date || ''),
    feeCategory: feeCategoryForEvent(event || { id: '', name: '' }, String(row.fee_category || 'event')),
    targetingMode: String(row.targeting_mode || 'branch_and_eligibility') as EventFeeConfig['targetingMode'],
    pricingMode: String(row.pricing_mode || 'fixed') as EventFeeConfig['pricingMode'],
    defaultAmount: normalizeAmount(row.default_amount),
    dueDate: String(row.due_date || ''),
    branchScope: scopeList(row.branch_scope as string[]),
    beltScope: scopeList(row.belt_scope as string[]),
    branchPrices: (row.branch_prices || {}) as Record<string, number>,
    beltPrices: (row.belt_prices || {}) as Record<string, number>,
    branchBeltPrices: (row.branch_belt_prices || {}) as Record<string, number>,
    studentOverrides: Array.isArray(row.student_overrides) ? row.student_overrides as EventFeeConfigInput['studentOverrides'] : [],
    notes: String(row.notes || ''),
    status: String(row.status || 'draft'),
  }
}

async function getStoredConfig(event: EventLike) {
  const { data, error } = await supabaseAdmin
    .from('event_fee_configs')
    .select('*')
    .eq('event_id', event.id)
    .maybeSingle()
  if (error) throwEventFeeDatabaseError(error)
  if (data) return mapConfig(data, event)

  return mapConfig({
    event_id: event.id,
    event_name: event.name,
    event_type: event.type || '',
    event_date: event.date || null,
    fee_category: feeCategoryForEvent(event),
    default_amount: 0,
    due_date: event.date || null,
    branch_scope: event.hostingBranch ? [event.hostingBranch] : [],
  }, event)
}

function mergeConfig(event: EventLike, base: EventFeeConfig, partial?: Partial<EventFeeConfigInput>): EventFeeConfig {
  const merged: EventFeeConfig = {
    ...base,
    ...partial,
    eventId: event.id,
    eventName: event.name,
    eventType: event.type || '',
    eventDate: event.date || '',
    feeCategory: feeCategoryForEvent(event, partial?.feeCategory || base.feeCategory),
    defaultAmount: normalizeAmount(partial?.defaultAmount ?? base.defaultAmount),
    dueDate: dateOnly(partial?.dueDate, base.dueDate || event.date) || '',
    branchScope: scopeList(partial?.branchScope ?? base.branchScope),
    beltScope: scopeList(partial?.beltScope ?? base.beltScope),
    branchPrices: partial?.branchPrices || base.branchPrices || {},
    beltPrices: partial?.beltPrices || base.beltPrices || {},
    branchBeltPrices: partial?.branchBeltPrices || base.branchBeltPrices || {},
    studentOverrides: partial?.studentOverrides || base.studentOverrides || [],
  }
  return merged
}

async function eventById(eventId: string) {
  const event = await getEventByIdAdminLive(eventId) as EventLike | null
  if (!event) throw new NotFoundError('Event')
  return event
}

async function existingEventFeeRows(eventId: string) {
  const { data, error } = await supabaseAdmin
    .from('fee_records')
    .select('id, skf_id, fee_type, amount, status, receipt_id, branch_snapshot, source_id')
    .eq('source_type', 'event')
    .eq('source_id', eventId)
  if (error) throwEventFeeDatabaseError(error)
  return (data || []) as ExistingFeeRow[]
}

function calculateAmount(config: EventFeeConfig, athlete: AthleteRecord, target: ReturnType<typeof nextBelt>, override?: EventFeeConfigInput['studentOverrides'][number]) {
  if (override?.amount !== undefined) return normalizeAmount(override.amount)
  const branch = String(athlete.branchName || '').trim()
  const targetKey = target?.key || ''
  const targetLabel = target?.label || ''
  const branchBelt = priceLookup(
    config.branchBeltPrices || {},
    `${branch}::${targetKey}`,
    `${branch}::${targetLabel}`,
    `${normalizeKey(branch)}::${targetKey}`
  )
  if (branchBelt !== null) return branchBelt
  const branchPrice = priceLookup(config.branchPrices || {}, branch, normalizeKey(branch))
  if (branchPrice !== null) return branchPrice
  const beltPrice = priceLookup(config.beltPrices || {}, targetKey, targetLabel)
  if (beltPrice !== null) return beltPrice
  return normalizeAmount(config.defaultAmount)
}

async function buildPreview(session: Session, event: EventLike, config: EventFeeConfig) {
  const [athletes, existingRows] = await Promise.all([
    getAllAthletesLive() as Promise<AthleteRecord[]>,
    existingEventFeeRows(event.id),
  ])
  const existingBySkfId = new Map(existingRows.map((row) => [normaliseSkfId(row.skf_id), row]))
  const participantSkfIds = new Set((event.participants || []).map((p) => normaliseSkfId(String(p.skfId || ''))).filter(Boolean))
  const branchScopeValues = config.branchScope.length ? config.branchScope : event.hostingBranch ? [event.hostingBranch] : []
  const branchScopeKeys = new Set(branchScopeValues.map(normalizeKey))
  const beltScopeKeys = new Set(config.beltScope.map((belt) => normalizeKey(belt)))
  const overrideBySkfId = readOverrideMap(config.studentOverrides)

  const candidates = athletes
    .filter((athlete) => String(athlete.status || 'active').toLowerCase() === 'active')
    .filter((athlete) => canSeeBranch(session, athlete.branchName))
    .filter((athlete) => {
      const skfId = normaliseSkfId(String(athlete.skfId || ''))
      const override = overrideBySkfId.get(skfId)
      if (override && !override.excluded) return true
      if (config.targetingMode === 'manual_selection') return false
      if (config.targetingMode === 'participants_only') return participantSkfIds.has(skfId)
      if (!branchScopeKeys.size) return true
      return branchScopeKeys.has(normalizeKey(athlete.branchName))
    })

  return candidates.map((athlete) => {
    const skfId = normaliseSkfId(String(athlete.skfId || ''))
    const override = overrideBySkfId.get(skfId)
    const current = normalizeBelt(athlete.currentBelt)
    const target = config.feeCategory === 'belt_exam' ? nextBelt(athlete.currentBelt) : null
    const existing = existingBySkfId.get(skfId)
    const branch = String(athlete.branchName || 'Unknown').trim()
    const amount = calculateAmount(config, athlete, target, override)
    const beltAllowed = !beltScopeKeys.size || (
      target && (beltScopeKeys.has(normalizeKey(target.key)) || beltScopeKeys.has(normalizeKey(target.label)))
    )
    const needsReview = config.feeCategory === 'belt_exam' && (!current || !target)
    const excluded = Boolean(override?.excluded)
    const waived = Boolean(override?.waived)

    return {
      skfId,
      studentName: athleteName(athlete),
      branch,
      currentBelt: current?.label || String(athlete.currentBelt || ''),
      currentBeltKey: current?.key || '',
      targetBelt: target?.label || '',
      targetBeltKey: target?.key || '',
      amount,
      finalAmount: waived ? 0 : amount,
      status: excluded
        ? 'excluded'
        : needsReview || !beltAllowed
          ? 'needs_review'
          : waived
            ? 'waived'
            : 'ready',
      reason: override?.reason || (needsReview ? 'Current belt needs review.' : !beltAllowed ? 'Target belt is outside this event scope.' : ''),
      existingFeeRecordId: existing?.id || null,
      existingStatus: existing?.status || null,
      receiptId: existing?.receipt_id || null,
    }
  })
}

function aggregateRows(rows: ExistingFeeRow[]) {
  const summary = {
    chargedCount: rows.length,
    expected: 0,
    collected: 0,
    pending: 0,
    waived: 0,
    proofSubmitted: 0,
    paidCount: 0,
    pendingCount: 0,
    waivedCount: 0,
  }

  for (const row of rows) {
    const amount = normalizeAmount(row.amount)
    if (row.status === 'paid') {
      summary.collected += amount
      summary.paidCount += 1
    } else if (row.status === 'waived') {
      summary.waived += amount
      summary.waivedCount += 1
    } else if (row.status === 'pending_verification') {
      summary.pending += amount
      summary.proofSubmitted += 1
    } else {
      summary.pending += amount
      summary.pendingCount += 1
    }
    if (row.status !== 'waived') summary.expected += amount
  }

  return summary
}

export class EventFeesService {
  static beltSequence = BELT_SEQUENCE.map((belt) => ({ key: belt.key, label: belt.label, kyu: belt.kyu }))

  static async list(session: Session, query: { year?: number; branch?: string } = {}) {
    requireFeeDatabase()
    const targetYear = Number(query.year || new Date().getFullYear())
    const events = (await getAllEventsAdminLive()) as EventLike[]
    const relevantEvents = events.filter((event) => !event.date || yearFromDate(event.date) === targetYear)
    const eventIds = relevantEvents.map((event) => event.id)

    const [{ data: configs, error: configError }, rows, { data: expenses, error: expenseError }, { data: deposits, error: depositError }] = await Promise.all([
      supabaseAdmin.from('event_fee_configs').select('*').in('event_id', eventIds.length ? eventIds : ['__none__']),
      eventIds.length
        ? supabaseAdmin
          .from('fee_records')
          .select('id, skf_id, fee_type, amount, status, receipt_id, branch_snapshot, source_id')
          .eq('source_type', 'event')
          .in('source_id', eventIds)
        : Promise.resolve({ data: [], error: null }),
      supabaseAdmin.from('event_fee_expenses').select('*').is('deleted_at', null),
      supabaseAdmin.from('event_fee_deposits').select('*').is('deleted_at', null),
    ])
    if (configError) throwEventFeeDatabaseError(configError)
    if (rows.error) throwEventFeeDatabaseError(rows.error)
    if (expenseError) throwEventFeeDatabaseError(expenseError)
    if (depositError) throwEventFeeDatabaseError(depositError)

    const configByEventId = new Map((configs || []).map((row) => [String(row.event_id), row]))
    const rowsByEventId = new Map<string, ExistingFeeRow[]>()
    for (const row of (rows.data || []) as ExistingFeeRow[]) {
      const eventId = String(row.source_id || '')
      const list = rowsByEventId.get(eventId) || []
      list.push(row)
      rowsByEventId.set(eventId, list)
    }

    const expenseByEventId = new Map<string, Record<string, unknown>[]>()
    for (const expense of expenses || []) {
      const eventId = String(expense.event_id || '')
      const list = expenseByEventId.get(eventId) || []
      list.push(expense)
      expenseByEventId.set(eventId, list)
    }

    const depositByEventId = new Map<string, Record<string, unknown>[]>()
    for (const deposit of deposits || []) {
      const eventId = String(deposit.event_id || '')
      const list = depositByEventId.get(eventId) || []
      list.push(deposit)
      depositByEventId.set(eventId, list)
    }

    const eventSummaries = relevantEvents
      .filter((event) => canSeeBranch(session, event.hostingBranch))
      .filter((event) => branchMatchesFilter(event.hostingBranch, query.branch) || (rowsByEventId.get(event.id) || []).some((row) => branchMatchesFilter(row.branch_snapshot, query.branch)))
      .map((event) => {
        const config = configByEventId.has(event.id)
          ? mapConfig(configByEventId.get(event.id) as Record<string, unknown>, event)
          : null
        const eventRows = rowsByEventId.get(event.id) || []
        const eventExpenses = expenseByEventId.get(event.id) || []
        const eventDeposits = depositByEventId.get(event.id) || []
        const collection = aggregateRows(eventRows)
        const spent = eventExpenses.reduce((sum, expense) => sum + normalizeAmount(expense.amount), 0)
        const deposited = eventDeposits.reduce((sum, deposit) => sum + normalizeAmount(deposit.amount), 0)
        const surplus = collection.collected - spent

        return {
          event: {
            id: event.id,
            name: event.name,
            type: event.type || '',
            date: event.date || '',
            status: event.status || '',
            hostingBranch: event.hostingBranch || '',
            isPublished: Boolean(event.isPublished),
          },
          config,
          collection,
          finance: {
            spent,
            surplus,
            savings: Math.max(0, normalizeAmount(config?.defaultAmount) * collection.chargedCount - spent),
            deposited,
            pendingDeposit: Math.max(0, surplus - deposited),
          },
          expenses: eventExpenses,
          deposits: eventDeposits,
        }
      })

    const totals = eventSummaries.reduce(
      (sum, item) => ({
        expected: sum.expected + item.collection.expected,
        collected: sum.collected + item.collection.collected,
        pending: sum.pending + item.collection.pending,
        spent: sum.spent + item.finance.spent,
        surplus: sum.surplus + item.finance.surplus,
        deposited: sum.deposited + item.finance.deposited,
        pendingDeposit: sum.pendingDeposit + item.finance.pendingDeposit,
      }),
      { expected: 0, collected: 0, pending: 0, spent: 0, surplus: 0, deposited: 0, pendingDeposit: 0 }
    )

    return {
      year: targetYear,
      beltSequence: this.beltSequence,
      events: eventSummaries,
      totals,
    }
  }

  static async upsertConfig(session: Session, input: EventFeeConfigInput) {
    assertWrite(session)
    requireFeeDatabase()
    const event = await eventById(input.eventId)
    if (!canSeeBranch(session, event.hostingBranch)) {
      throw new AuthorizationError('This event is outside your branch scope.')
    }
    const base = await getStoredConfig(event)
    const config = mergeConfig(event, base, input)
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from('event_fee_configs')
      .upsert({
        event_id: event.id,
        event_name: event.name,
        event_type: event.type || '',
        event_date: dateOnly(event.date),
        fee_category: config.feeCategory,
        status: 'active',
        targeting_mode: config.targetingMode,
        pricing_mode: config.pricingMode,
        default_amount: config.defaultAmount,
        due_date: dateOnly(config.dueDate, event.date),
        branch_scope: config.branchScope,
        belt_scope: config.beltScope,
        branch_prices: config.branchPrices,
        belt_prices: config.beltPrices,
        branch_belt_prices: config.branchBeltPrices,
        student_overrides: config.studentOverrides,
        notes: config.notes || null,
        created_by: actorName(session),
        updated_by: actorName(session),
        updated_at: now,
      }, { onConflict: 'event_id' })
      .select('*')
      .single()
    if (error) throwEventFeeDatabaseError(error)

    return { success: true, config: mapConfig(data, event) }
  }

  static async preview(session: Session, input: EventFeePreviewInput) {
    requireFeeDatabase()
    const event = await eventById(input.eventId)
    if (!canSeeBranch(session, event.hostingBranch)) {
      throw new AuthorizationError('This event is outside your branch scope.')
    }
    const stored = await getStoredConfig(event)
    const config = mergeConfig(event, stored, input.config)
    const rows = await buildPreview(session, event, config)
    return {
      success: true,
      event: { id: event.id, name: event.name, type: event.type || '', date: event.date || '', hostingBranch: event.hostingBranch || '' },
      config,
      rows,
      summary: {
        ready: rows.filter((row) => row.status === 'ready').length,
        waived: rows.filter((row) => row.status === 'waived').length,
        excluded: rows.filter((row) => row.status === 'excluded').length,
        needsReview: rows.filter((row) => row.status === 'needs_review').length,
        totalAmount: rows.filter((row) => row.status === 'ready').reduce((sum, row) => sum + row.finalAmount, 0),
      },
    }
  }

  static async generate(session: Session, input: EventFeeGenerateInput) {
    assertWrite(session)
    requireFeeDatabase()
    const event = await eventById(input.eventId)
    const stored = await getStoredConfig(event)
    const config = mergeConfig(event, stored, {
      studentOverrides: input.overrides.length ? input.overrides : stored.studentOverrides,
    })
    await this.upsertConfig(session, config)
    const preview = await buildPreview(session, event, config)
    const month = monthNameFromDate(config.dueDate || event.date)
    const year = yearFromDate(config.dueDate || event.date)
    const sourceKey = `event:${event.id}`
    const sourceLabel = eventFeeLabel(event, config)
    let createdOrUpdated = 0
    let waived = 0
    let skipped = 0
    const results = []

    for (const row of preview) {
      if (row.status === 'excluded' || row.status === 'needs_review') {
        skipped += 1
        continue
      }

      const { data, error } = await supabaseAdmin.rpc('ensure_fee_record', {
        p_skf_id: row.skfId,
        p_fee_type: config.feeCategory,
        p_month: month,
        p_year: year,
        p_amount: row.finalAmount,
        p_metadata: {
          eventId: event.id,
          eventName: event.name,
          eventDate: event.date || null,
          feeCategory: config.feeCategory,
          currentBelt: row.currentBelt,
          currentBeltKey: row.currentBeltKey,
          targetBelt: row.targetBelt,
          targetBeltKey: row.targetBeltKey,
          overrideReason: row.reason,
        },
        p_source_key: sourceKey,
        p_source_type: 'event',
        p_source_id: event.id,
        p_source_label: sourceLabel,
        p_due_date: dateOnly(config.dueDate, event.date),
        p_branch_snapshot: row.branch,
      })
      if (error) throwEventFeeDatabaseError(error)

      const feeRow = Array.isArray(data) ? data[0] : data
      if (row.status === 'waived') {
        const { error: waiveError } = await supabaseAdmin
          .from('fee_records')
          .update({
            status: 'waived',
            amount: 0,
            notes: row.reason || 'Waived during event fee generation.',
            updated_at: new Date().toISOString(),
          })
          .eq('id', feeRow.id)
          .not('status', 'in', '(paid,pending_verification)')
        if (waiveError) throwEventFeeDatabaseError(waiveError)
        waived += 1
      } else {
        createdOrUpdated += 1
      }
      results.push(feeRow)
    }

    await supabaseAdmin
      .from('event_fee_configs')
      .update({
        last_generated_at: new Date().toISOString(),
        last_generated_by: actorName(session),
        student_overrides: config.studentOverrides,
        updated_by: actorName(session),
        updated_at: new Date().toISOString(),
      })
      .eq('event_id', event.id)

    return {
      success: true,
      eventId: event.id,
      createdOrUpdated,
      waived,
      skipped,
      rows: results,
    }
  }

  static async createExpense(session: Session, input: EventFeeExpenseInput) {
    assertWrite(session)
    requireFeeDatabase()
    await eventById(input.eventId)
    const { data, error } = await supabaseAdmin
      .from('event_fee_expenses')
      .insert({
        event_id: input.eventId,
        title: input.title,
        category: input.category || 'event_expense',
        amount: input.amount,
        expense_date: dateOnly(input.expenseDate) || new Date().toISOString().slice(0, 10),
        branch_scope: input.branchScope || 'Both',
        allocation_method: input.allocationMethod || 'student_branch',
        allocations: input.allocations || {},
        payment_method: input.paymentMethod || null,
        vendor: input.vendor || null,
        notes: input.notes || null,
        proof_url: input.proofUrl || null,
        created_by: actorName(session),
      })
      .select('*')
      .single()
    if (error) throwEventFeeDatabaseError(error)
    return { success: true, expense: data }
  }

  static async createDeposit(session: Session, input: EventFeeDepositInput) {
    assertWrite(session)
    requireFeeDatabase()
    await eventById(input.eventId)
    const { data, error } = await supabaseAdmin
      .from('event_fee_deposits')
      .insert({
        event_id: input.eventId,
        amount: input.amount,
        deposit_date: dateOnly(input.depositDate) || new Date().toISOString().slice(0, 10),
        branch_scope: input.branchScope || 'Both',
        method: input.method || 'bank_deposit',
        reference: input.reference || null,
        notes: input.notes || null,
        created_by: actorName(session),
      })
      .select('*')
      .single()
    if (error) throwEventFeeDatabaseError(error)
    return { success: true, deposit: data }
  }
}
