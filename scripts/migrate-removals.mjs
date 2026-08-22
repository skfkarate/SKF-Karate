#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv() {
  const env = { ...process.env }
  try {
    const localPath = resolve(__dirname, '..', '.env.local')
    for (const line of readFileSync(localPath, 'utf-8').split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eq = trimmed.indexOf('=')
      if (eq === -1) continue
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
  } catch { /* ignore */ }
  return env
}

const env = loadEnv()
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const MONTH_MAP = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr',
  May: 'May', June: 'Jun', July: 'Jul', August: 'Aug',
  September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
}

async function main() {
  // First, ensure the fee_removals table exists
  console.log('Creating fee_removals table if not exists...')
  const createSQL = `
    CREATE TABLE IF NOT EXISTS fee_removals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      removal_code TEXT UNIQUE NOT NULL,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      scope TEXT NOT NULL DEFAULT 'Both',
      amount NUMERIC NOT NULL DEFAULT 0,
      created_by TEXT,
      deleted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_fee_removals_period ON fee_removals (year, month);
    ALTER TABLE fee_removals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "service_role_full_fee_removals" ON fee_removals;
    CREATE POLICY "service_role_full_fee_removals"
      ON fee_removals
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  `

  try {
    const resp = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Prefer': 'params=single-object',
      },
      body: JSON.stringify({ query: createSQL }),
    })
    console.log('Table creation response:', resp.status, resp.statusText)
  } catch (e) {
    console.log('Table may already exist or creation method not available:', e.message)
  }

  // Check if table exists by querying it
  const { error: checkError } = await supabase.from('fee_removals').select('id').limit(1)
  if (checkError) {
    console.error('fee_removals table still not accessible:', checkError.message)
    console.log('Please apply the migration SQL from database/migrations/041_fee_removals.sql manually via Supabase SQL editor.')
    process.exit(1)
  }

  // 1. Find the specific records by title
  const titlesToFind = [
    'Sai Weapon',
    'Shashank Kumite Kit',
    'Mrithika Belt Exam Fee',
    'Jnanavi Deeksha payment to appa',
  ]

  const { data: expenses, error } = await supabase
    .from('development_fund_expenses')
    .select('*')
    .in('title', titlesToFind)
    .is('deleted_at', null)

  if (error) {
    console.error('Query error:', error)
    process.exit(1)
  }

  if (expenses.length === 0) {
    console.log('No matching records found.')
    // Show all expenses
    const { data: all } = await supabase.from('development_fund_expenses').select('*').is('deleted_at', null)
    console.log('All development fund expenses:')
    for (const e of all || []) {
      console.log(`  ${e.expense_code}: "${e.title}" | ₹${e.amount} | ${e.month} ${e.year} | scope: ${e.scope}`)
    }
    return
  }

  console.log(`Found ${expenses.length} matching records:`)
  for (const e of expenses) {
    console.log(`  ${e.expense_code}: "${e.title}" | ${e.description || ''} | ₹${e.amount} | ${e.month} ${e.year} | scope: ${e.scope}`)
  }

  // 2. Insert into fee_removals
  const inserts = []
  for (const e of expenses) {
    const monthShort = MONTH_MAP[e.month] || e.month
    const codeNum = e.expense_code.replace('DEV_', '').replace('DEV-', '')
    const removalCode = `RMV-${codeNum}`
    let amount = Number(e.amount)
    let title = e.title

    // Correct Sai Weapon amount
    if (e.title === 'Sai Weapon') {
      amount = 1700
      console.log(`  Correcting Sai Weapon amount from ${e.amount} to 1700`)
    }

    inserts.push({
      removal_code: removalCode,
      month: monthShort,
      year: e.year,
      title: title,
      description: e.description || null,
      scope: e.scope,
      amount,
      created_by: e.created_by,
      created_at: e.created_at,
      updated_at: new Date().toISOString(),
    })
  }

  const { data: inserted, error: insertError } = await supabase
    .from('fee_removals')
    .insert(inserts)
    .select()

  if (insertError) {
    console.error('Insert error:', insertError)
    process.exit(1)
  }

  console.log(`\nInserted ${inserted.length} records into fee_removals:`)
  for (const r of inserted) {
    console.log(`  ${r.removal_code}: "${r.title}" | ₹${r.amount} | ${r.month} ${r.year} | scope: ${r.scope}`)
  }

  // 3. Soft-delete from development_fund_expenses
  const idsToDelete = expenses.map(e => e.id)
  const { error: deleteError } = await supabase
    .from('development_fund_expenses')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', idsToDelete)

  if (deleteError) {
    console.error('Soft-delete error:', deleteError)
    process.exit(1)
  }

  console.log(`\nSoft-deleted ${idsToDelete.length} records from development_fund_expenses:`)
  for (const e of expenses) {
    console.log(`  ${e.expense_code}: "${e.title}"`)
  }

  console.log('\nMigration complete!')
}

main().catch(console.error)
