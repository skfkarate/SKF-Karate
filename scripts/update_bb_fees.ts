import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

import {
  BLACK_BELT_INSTALLMENT_AMOUNT,
  BLACK_BELT_INSTALLMENT_IDS,
  BLACK_BELT_INSTALLMENT_LABEL,
  BLACK_BELT_INSTALLMENT_SOURCE,
  BLACK_BELT_INSTALLMENT_YEAR,
} from '../lib/server/temporary-black-belt-override'

config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const MONTHS = [
  ['June', 6],
  ['July', 7],
  ['August', 8],
  ['September', 9],
  ['October', 10],
] as const

const MUTABLE_STATUSES = ['due', 'overdue', 'rejected', 'pending_verification']

async function main() {
  let updated = 0
  let inserted = 0

  for (const skfId of BLACK_BELT_INSTALLMENT_IDS) {
    for (const [month, monthNumber] of MONTHS) {
      const { data: existing, error: existingError } = await supabaseAdmin
        .from('fee_records')
        .select('id, amount, status, metadata')
        .eq('skf_id', skfId)
        .eq('fee_type', 'monthly')
        .eq('month', month)
        .eq('year', BLACK_BELT_INSTALLMENT_YEAR)
        .maybeSingle()
      if (existingError) throw existingError

      if (!existing) {
        const { error } = await supabaseAdmin
          .from('fee_records')
          .insert({
            skf_id: skfId,
            fee_type: 'monthly',
            month,
            year: BLACK_BELT_INSTALLMENT_YEAR,
            amount: BLACK_BELT_INSTALLMENT_AMOUNT,
            status: 'due',
            source_key: '',
            source_label: BLACK_BELT_INSTALLMENT_LABEL,
            due_date: `${BLACK_BELT_INSTALLMENT_YEAR}-${String(monthNumber).padStart(2, '0')}-01`,
            metadata: { temporaryOverride: BLACK_BELT_INSTALLMENT_SOURCE },
            updated_at: new Date().toISOString(),
          })
        if (error) throw error
        inserted += 1
        continue
      }

      if (!MUTABLE_STATUSES.includes(String(existing.status || ''))) continue

      const metadata = {
        ...((existing.metadata as Record<string, unknown> | null) || {}),
        temporaryOverride: BLACK_BELT_INSTALLMENT_SOURCE,
        baseAmountBeforeOverride: ((existing.metadata as Record<string, unknown> | null) || {}).baseAmountBeforeOverride ?? Number(existing.amount || 0),
      }

      const { error } = await supabaseAdmin
        .from('fee_records')
        .update({
          amount: BLACK_BELT_INSTALLMENT_AMOUNT,
          source_label: BLACK_BELT_INSTALLMENT_LABEL,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
      if (error) throw error
      updated += 1
    }
  }

  console.log(`Black Belt installment rows fixed. Inserted: ${inserted}, updated: ${updated}. Roshan/SKF13BL000 is excluded.`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
