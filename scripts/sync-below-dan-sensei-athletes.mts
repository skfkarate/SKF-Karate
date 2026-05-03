import fs from 'node:fs'

import { createClient } from '@supabase/supabase-js'

function readEnvFile(path: string) {
  if (!fs.existsSync(path)) return {}

  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .filter((line) => !line.startsWith('#'))
      .map((line) => {
        const separatorIndex = line.indexOf('=')
        return [
          line.slice(0, separatorIndex),
          line.slice(separatorIndex + 1).replace(/^"|"$/g, '').replace(/\\n/g, '\n'),
        ]
      })
  )
}

const env = {
  ...readEnvFile('.env'),
  ...readEnvFile('.env.local'),
  ...process.env,
}

const supabase = createClient(
  String(env.NEXT_PUBLIC_SUPABASE_URL || ''),
  String(env.SUPABASE_SERVICE_ROLE_KEY || '')
)

function normalizeSenseiName(value: string) {
  return String(value || '')
    .trim()
    .replace(/^sensei\s+/i, '')
    .replace(/^renshi\s+/i, '')
    .replace(/\s+/g, ' ')
}

function splitName(name: string) {
  const normalized = normalizeSenseiName(name)
  const parts = normalized.split(/\s+/).filter(Boolean)

  if (parts.length === 0) return { firstName: 'SKF', lastName: 'Sensei' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function parseDanOrder(dan: string) {
  const normalized = String(dan || '').trim().toLowerCase()

  if (!normalized) return null
  if (normalized.includes('5th') || normalized.includes('godan')) return 5
  if (normalized.includes('4th') || normalized.includes('yondan')) return 4
  if (normalized.includes('3rd') || normalized.includes('sandan')) return 3
  if (normalized.includes('2nd') || normalized.includes('nidan')) return 2
  if (normalized.includes('1st') || normalized.includes('shodan')) return 1
  if (normalized.includes('black belt')) return 0

  return null
}

function mapSenseiDanToBelt(dan: string) {
  const order = parseDanOrder(dan)
  if (order === 2) return 'black-2nd-dan'
  if (order === 1 || order === 0) return 'black-1st-dan'
  return null
}

function inferJoinDate(experience: string) {
  const yearsMatch = String(experience || '').match(/(\d+)\s*\+?\s*years?/i)
  if (!yearsMatch) return '2018-01-01'

  const date = new Date()
  date.setFullYear(date.getFullYear() - Number.parseInt(yearsMatch[1] || '0', 10))
  return date.toISOString().split('T')[0]
}

const BRANCH_CODES: Record<string, string> = {
  sunkadakatte: 'SK',
  rajajinagar: 'RJ',
  malleshwaram: 'ML',
  'm p sports club': 'MP',
  'mp sports club': 'MP',
  herohalli: 'HE',
  kunigal: 'KG',
  tumkur: 'TK',
  udupi: 'UD',
}

function getBranchCode(branchName: string) {
  const normalized = String(branchName || '').toLowerCase().trim()
  return BRANCH_CODES[normalized] || normalized.replace(/[^a-z]/g, '').slice(0, 2).toUpperCase() || 'MP'
}

function normalizeSkfId(input: string, branchName = 'MP') {
  const raw = String(input || '').trim()
  const cleaned = raw.toUpperCase().replace(/\s+/g, '').replace(/-/g, '')

  const current = cleaned.match(/^SKF(\d{2})([A-Z]{2})(\d{1,})$/)
  if (current) return `SKF${current[1]}${current[2]}${current[3].padStart(3, '0')}`

  const branchFirst = cleaned.match(/^([A-Z]{2})(\d{2})(\d{1,})$/)
  if (branchFirst) return `SKF${branchFirst[2]}${branchFirst[1]}${branchFirst[3].padStart(3, '0')}`

  const legacy = cleaned.match(/^SKF(\d{4})(\d{1,})$/)
  if (legacy) {
    return `SKF${legacy[1].slice(-2)}${getBranchCode(branchName)}${String(Number(legacy[2])).padStart(3, '0')}`
  }

  return raw.toUpperCase()
}

function generateSkfId(year: number, branchName: string, sequence: number) {
  return `SKF${String(year).slice(-2)}${getBranchCode(branchName)}${String(sequence).padStart(3, '0')}`
}

async function getNextSequence(year: number, branchName: string) {
  const prefix = `SKF${String(year).slice(-2)}${getBranchCode(branchName)}`
  const { data, error } = await supabase
    .from('athletes')
    .select('skf_id')
    .like('skf_id', `${prefix}%`)

  if (error) throw error

  const sequences = ((data || []) as Array<{ skf_id?: string | null }>)
    .map((entry) => Number.parseInt(normalizeSkfId(String(entry.skf_id || ''), branchName).slice(prefix.length), 10))
    .filter((value) => Number.isFinite(value))

  return sequences.length > 0 ? Math.max(...sequences) + 1 : 1
}

async function main() {
  const { data: senseis, error: senseiError } = await supabase
    .from('senseis')
    .select('id,name,dan,experience,image_url,is_public,is_active')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (senseiError) throw senseiError

  const { data: branches, error: branchError } = await supabase
    .from('class_branches')
    .select('name,lead_sensei_id')

  if (branchError) throw branchError

  const branchBySenseiId = new Map<string, string>()
  for (const branch of branches || []) {
    if (branch.lead_sensei_id && !branchBySenseiId.has(branch.lead_sensei_id)) {
      branchBySenseiId.set(branch.lead_sensei_id, String(branch.name || 'SKF Karate'))
    }
  }

  const currentYear = new Date().getFullYear()
  const nextSequenceByBranch = new Map<string, number>()
  const synced: string[] = []

  for (const sensei of senseis || []) {
    const danOrder = parseDanOrder(String(sensei.dan || ''))
    if (danOrder === null || danOrder >= 3 || sensei.is_public === false || sensei.is_active === false) {
      continue
    }

    const id = `athlete_sensei_${sensei.id}`
    const belt = mapSenseiDanToBelt(String(sensei.dan || ''))
    if (!belt) continue

    const { data: existing, error: existingError } = await supabase
      .from('athletes')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (existingError) throw existingError

    const { firstName, lastName } = splitName(String(sensei.name || ''))
    const joinDate = existing?.join_date || inferJoinDate(String(sensei.experience || ''))
    const branchName = branchBySenseiId.get(String(sensei.id)) || existing?.branch_name || 'SKF Karate'
    const sequenceKey = `${currentYear}:${getBranchCode(branchName)}`
    if (!nextSequenceByBranch.has(sequenceKey)) {
      nextSequenceByBranch.set(sequenceKey, await getNextSequence(currentYear, branchName))
    }
    const nextSequence = nextSequenceByBranch.get(sequenceKey) || 1
    const skfId =
      existing?.skf_id
        ? normalizeSkfId(existing.skf_id, branchName)
        : generateSkfId(currentYear, branchName, nextSequence)
    nextSequenceByBranch.set(sequenceKey, nextSequence + 1)

    const payload = {
      id,
      skf_id: skfId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: existing?.date_of_birth || '1990-01-01',
      gender: existing?.gender || 'other',
      photo_url: sensei.image_url || existing?.photo_url || null,
      branch_name: branchName,
      current_belt: belt,
      join_date: joinDate,
      status: 'active',
      parent_name: existing?.parent_name || null,
      phone: existing?.phone || null,
      email: existing?.email || null,
      is_public: existing?.is_public ?? true,
      is_featured: existing?.is_featured ?? false,
      achievements:
        existing?.achievements && Array.isArray(existing.achievements) && existing.achievements.length > 0
          ? existing.achievements
          : [
              {
                id: `ach_${sensei.id}_belt_sync`,
                type: 'belt-grading',
                date: joinDate,
                title: `${sensei.dan} profile synced from Sensei directory`,
                description: 'Initial Sensei mirror record for public athlete profile visibility.',
                beltEarned: belt,
                pointsAwarded: 0,
                awardedBy: 'SKF Sensei Directory',
              },
            ],
      points_history: existing?.points_history || [],
      points_balance: existing?.points_balance || 0,
      points_lifetime: existing?.points_lifetime || 0,
      attendance_rate: existing?.attendance_rate || null,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error: upsertError } = await supabase.from('athletes').upsert(payload, {
      onConflict: 'id',
    })

    if (upsertError) throw upsertError
    synced.push(skfId)
  }

  console.log(
    JSON.stringify(
      {
        syncedCount: synced.length,
        skfIds: synced,
      },
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
