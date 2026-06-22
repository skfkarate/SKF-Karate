import { config } from 'dotenv'
config({ path: '.env.local', override: true })
config({ path: '.env', override: true })

async function generateExistingBeltExamFees() {
  const { normaliseSkfId } = await import('@/lib/utils/registration')
  const { isSupabaseReady, supabaseAdmin } = await import('@/lib/server/supabase')
  const { kyuBelts } = await import('@/data/seed/kyuBelts')

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

  function monthNameFromDate(dateStr: string | undefined | null) {
    if (!dateStr) return MONTHS[new Date().getMonth()]
    return MONTHS[new Date(dateStr).getMonth()]
  }

  function yearFromDate(dateStr: string | undefined | null) {
    if (!dateStr) return new Date().getFullYear()
    return new Date(dateStr).getFullYear()
  }

  function normalizeKey(value: string) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').trim()
  }

  // Build belt aliases following event-fees.service.ts BELT_SEQUENCE logic
  const BELT_SEQUENCE = kyuBelts.map((belt) => {
    const label = belt.belt
    const compact = label.toLowerCase().replace(/\bbelt\b/g, '').trim()
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

  function normalizeBelt(value?: string | null) {
    const key = String(value || '').trim().toLowerCase().replace(/\bbelt\b/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()
    if (!key) return null
    for (const belt of BELT_SEQUENCE) {
      if (belt.aliases.has(key) || belt.aliases.has(key.replace(/\s+/g, '-')) || belt.aliases.has(key.replace(/\s+/g, ''))) {
        return belt
      }
    }
    if (key === 'green') return BELT_SEQUENCE.find((b) => b.key === 'green-ii') || null
    if (key === 'brown') return BELT_SEQUENCE.find((b) => b.key === 'brown-iii') || null
    return null
  }

  function targetBeltKey(currentBelt: string | undefined | null) {
    const current = normalizeBelt(currentBelt)
    if (!current) return null
    const idx = BELT_SEQUENCE.findIndex((b) => b.key === current.key)
    if (idx < 0 || idx >= BELT_SEQUENCE.length - 1) return null
    return BELT_SEQUENCE[idx + 1].key
  }

  function targetBeltLabel(currentBelt: string | undefined | null) {
    const current = normalizeBelt(currentBelt)
    if (!current) return null
    const idx = BELT_SEQUENCE.findIndex((b) => b.key === current.key)
    if (idx < 0 || idx >= BELT_SEQUENCE.length - 1) return null
    return BELT_SEQUENCE[idx + 1].label
  }

  function priceLookup(priceMap: Record<string, number>, ...keys: string[]) {
    for (const key of keys) {
      const value = priceMap[key]
      if (value !== undefined && value !== null) return Number(value)
    }
    return null
  }

  function calculateAmount(beltPrices: Record<string, number>, defaultAmount: number, targetKey: string | null) {
    if (targetKey) {
      const price = priceLookup(beltPrices, targetKey)
      if (price !== null) return price
    }
    return defaultAmount
  }

  console.log('Checking Supabase connection...')
  if (!isSupabaseReady()) {
    console.error('Supabase is not configured.')
    console.error('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET')
    console.error('Supabase service key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET')
    process.exit(1)
  }
  console.log('Supabase connected.\n')

  // Check what belt exam events exist
  const { data: beltEvents, error: beltEventsError } = await supabaseAdmin
    .from('events')
    .select('id, name, type, date')
    .or('type.ilike.%belt%,type.ilike.%grading%,name.ilike.%belt%,name.ilike.%exam%')
    .limit(20)

  if (!beltEventsError && beltEvents?.length) {
    console.log(`Found ${beltEvents.length} potential belt exam events:`)
    for (const ev of beltEvents) {
      const participantsArr = (ev as Record<string, unknown>).participants
      const pCount = Array.isArray(participantsArr) ? participantsArr.length : '?'
      console.log(`  - ${ev.id}: ${ev.name || 'Unnamed'} [participants: ${pCount}]`)
    }
    console.log('')
  }

  const { data: configs, error } = await supabaseAdmin
    .from('event_fee_configs')
    .select('*')
    .eq('fee_category', 'belt_exam')

  if (error) {
    console.error('Failed to query event_fee_configs:', error)
    process.exit(1)
  }

  const BELT_PRICES: Record<string, number> = {
    yellow: 1000,
    orange: 1100,
    'green-ii': 1200,
    'green-i': 1300,
    blue: 1400,
    purple: 1500,
    'brown-iii': 1750,
    'brown-ii': 2000,
    'brown-i': 2500,
  }

  // Find belt exam events that need fee configs
  const { data: examEvents, error: examEventsError } = await supabaseAdmin
    .from('events')
    .select('id, name, date')
    .in('id', ['evt_b3733e10-56c2-41b2-87bf-ce7c18a21168', 'evt_5aabf5af-3191-4f88-8e24-bd79c713bf7a'])

  if (examEventsError) {
    console.error('Failed to query belt exam events:', examEventsError)
    process.exit(1)
  }

  if (!examEvents?.length) {
    console.log('Belt exam events not found.')
    return
  }

  // Create or update fee configs for belt exam events
  const rawConfigs = (configs || []) as { event_id: string }[]
  const configuredEventIds = new Set(rawConfigs.map((c) => c.event_id))
  let configsToUse = configs || []

  for (const event of examEvents) {
    if (configuredEventIds.has(event.id)) {
      console.log(`Fee config already exists for ${event.id} (${event.name})`)
      continue
    }

    const now = new Date().toISOString()
    const { error: upsertError } = await supabaseAdmin
      .from('event_fee_configs')
      .insert({
        event_id: event.id,
        event_name: event.name || '',
        event_type: 'grading',
        event_date: event.date || null,
        fee_category: 'belt_exam',
        status: 'active',
        targeting_mode: 'participants_only',
        pricing_mode: 'belt',
        default_amount: 0,
        belt_prices: BELT_PRICES,
        branch_belt_prices: {},
        branch_prices: {},
        branch_scope: [],
        belt_scope: Object.keys(BELT_PRICES),
        due_date: event.date || null,
        student_overrides: [],
        notes: 'Auto-configured by fee generation script.',
        created_by: 'system',
        updated_by: 'system',
        created_at: now,
        updated_at: now,
      })

    if (upsertError) {
      console.error(`  ERR creating fee config for ${event.id}: ${upsertError.message}`)
      continue
    }
    console.log(`  Fee config created for ${event.id} (${event.name})`)
  }

  // Re-fetch configs to include newly created ones
  const { data: updatedConfigs, error: refetchError } = await supabaseAdmin
    .from('event_fee_configs')
    .select('*')
    .eq('fee_category', 'belt_exam')
  if (refetchError) {
    console.error('Re-fetch error:', refetchError)
  }
  console.log(`Re-fetched ${updatedConfigs?.length || 0} belt exam fee configs from DB`)
  configsToUse = updatedConfigs || []

  console.log(`Found ${configsToUse.length} belt exam fee configs.\n`)
  let totalCreated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const config of configsToUse) {
    console.log(`--- Event: ${config.event_id} ---`)

    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, name, date, participants')
      .eq('id', config.event_id)
      .maybeSingle()

    if (eventError || !event) {
      console.log(`  Event not found, skipping.\n`)
      totalSkipped += 1
      continue
    }

    const participants = (event.participants || []) as Array<{ skfId?: string; belt?: string; branchName?: string }>
    if (participants.length === 0) {
      console.log(`  No participants, skipping.\n`)
      totalSkipped += 1
      continue
    }

    console.log(`  Event: ${event.name || 'Unnamed'}`)
    console.log(`  Participants: ${participants.length}`)

    const month = monthNameFromDate(config.due_date || event.date)
    const year = yearFromDate(config.due_date || event.date)
    const sourceKey = `event:${event.id}`
    const sourceLabel = `Belt Examination - ${event.name || ''}`
    const beltPrices = (config.belt_prices || {}) as Record<string, number>
    const defaultAmount = Number(config.default_amount || 0)
    let created = 0
    let skipped = 0
    let errors = 0

    for (const participant of participants) {
      const skfId = normaliseSkfId(String(participant.skfId || ''))
      if (!skfId) { skipped += 1; continue }

      const tKey = targetBeltKey(participant.belt)
      const tLabel = targetBeltLabel(participant.belt)
      const amount = calculateAmount(beltPrices, defaultAmount, tKey)
      if (amount <= 0) {
        console.log(`  SKIP ${skfId} (${participant.belt || '?'} -> ${tLabel || '?'}): fee not configured`)
        skipped += 1
        continue
      }

      const { error: rpcError } = await supabaseAdmin.rpc('ensure_fee_record', {
        p_skf_id: skfId,
        p_fee_type: 'belt_exam',
        p_month: month,
        p_year: year,
        p_amount: amount,
        p_metadata: {
          eventId: event.id,
          eventName: event.name || '',
          eventDate: event.date || null,
          feeCategory: 'belt_exam',
          currentBelt: participant.belt || '',
          currentBeltKey: normalizeKey(participant.belt || ''),
          targetBelt: tLabel || '',
          targetBeltKey: tKey || '',
          receiptEligible: false,
        },
        p_source_key: sourceKey,
        p_source_type: 'event',
        p_source_id: event.id,
        p_source_label: sourceLabel,
        p_due_date: config.due_date || event.date || null,
        p_branch_snapshot: participant.branchName || '',
      })

      if (rpcError) {
        console.error(`  ERR  ${skfId}: ${rpcError.message}`)
        errors += 1
      } else {
        console.log(`  OK   ${skfId} (${participant.belt || '?'} -> ${tLabel || '?'}): INR ${amount}`)
        created += 1
      }
    }

    console.log(`  Result: ${created} created, ${skipped} skipped, ${errors} errors\n`)
    totalCreated += created
    totalSkipped += skipped
    totalErrors += errors
  }

  console.log('=== SUMMARY ===')
  console.log(`Total fee records created: ${totalCreated}`)
  console.log(`Total skipped: ${totalSkipped}`)
  console.log(`Total errors: ${totalErrors}`)
  console.log('')
  if (totalCreated > 0) {
    console.log('Done. Belt exam fees should now be visible in the athlete portal.')
  }
}

generateExistingBeltExamFees().catch(console.error)
