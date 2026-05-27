import { existsSync, readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'fee-payment-proofs'
const REVIEWED_STATUSES = ['approved', 'rejected']
const PAGE_SIZE = 500
const DELETE_BATCH_SIZE = 100

function loadEnvFile(path) {
  if (!existsSync(path)) return

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!process.env[key] && value) {
      process.env[key] = value.replace(/\\n/g, '\n')
    }
  }
}

function chunk(values, size) {
  const chunks = []
  for (let index = 0; index < values.length; index += size) {
    chunks.push(values.slice(index, index + size))
  }
  return chunks
}

function splitStoragePath(path) {
  const normalized = String(path || '').replace(/^\/+/, '').trim()
  const lastSlash = normalized.lastIndexOf('/')
  if (lastSlash === -1) return { directory: '', filename: normalized }
  return {
    directory: normalized.slice(0, lastSlash),
    filename: normalized.slice(lastSlash + 1),
  }
}

async function listReviewedProofs(supabase) {
  const rows = []
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('fee_payment_proofs')
      .select('id, skf_id, fee_record_id, status, proof_path, submitted_at, reviewed_at')
      .in('status', REVIEWED_STATUSES)
      .not('proof_path', 'is', null)
      .neq('proof_path', '')
      .order('reviewed_at', { ascending: true, nullsFirst: true })
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) throw error
    rows.push(...(data || []))
    if (!data || data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return rows
}

async function listDirectoryNames(supabase, directory) {
  const names = new Set()
  let offset = 0

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(directory, {
      limit: 1000,
      offset,
    })
    if (error) throw error

    for (const entry of data || []) {
      if (entry?.name) names.add(entry.name)
    }

    if (!data || data.length < 1000) break
    offset += 1000
  }

  return names
}

async function existingStoragePaths(supabase, proofPaths) {
  const grouped = new Map()
  for (const proofPath of proofPaths) {
    const { directory, filename } = splitStoragePath(proofPath)
    if (!filename) continue
    const group = grouped.get(directory) || []
    group.push({ proofPath, filename })
    grouped.set(directory, group)
  }

  const existing = []
  for (const [directory, entries] of grouped.entries()) {
    const names = await listDirectoryNames(supabase, directory)
    for (const entry of entries) {
      if (names.has(entry.filename)) existing.push(entry.proofPath)
    }
  }

  return existing
}

async function main() {
  loadEnvFile('.env')
  loadEnvFile('.env.local')

  const apply = process.argv.includes('--apply')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const reviewedProofs = await listReviewedProofs(supabase)
  const proofPaths = [...new Set(reviewedProofs.map((row) => String(row.proof_path || '').trim()).filter(Boolean))]
  const existingProofPaths = await existingStoragePaths(supabase, proofPaths)

  console.log(`Mode: ${apply ? 'apply' : 'dry-run'}`)
  console.log(`Bucket: ${BUCKET}`)
  console.log(`Reviewed proof rows with storage paths: ${reviewedProofs.length}`)
  console.log(`Existing storage paths to remove: ${existingProofPaths.length}`)

  const existingPathSet = new Set(existingProofPaths)
  const existingRows = reviewedProofs.filter((row) => existingPathSet.has(String(row.proof_path || '').trim()))
  for (const row of existingRows.slice(0, 10)) {
    console.log(`- ${row.status} ${row.skf_id} ${row.proof_path}`)
  }
  if (existingRows.length > 10) {
    console.log(`... ${existingRows.length - 10} more rows`)
  }

  if (!apply || existingProofPaths.length === 0) {
    if (!apply) console.log('Dry run only. Re-run with --apply to delete these storage files.')
    return
  }

  let removed = 0
  for (const batch of chunk(existingProofPaths, DELETE_BATCH_SIZE)) {
    const { data, error } = await supabase.storage.from(BUCKET).remove(batch)
    if (error) throw error
    removed += data?.length || batch.length
  }

  console.log(`Removed storage objects: ${removed}`)
  console.log('Database proof rows were kept for audit history.')
}

main().catch((error) => {
  console.error('[cleanup-reviewed-fee-proofs] Failed:', error)
  process.exit(1)
})
