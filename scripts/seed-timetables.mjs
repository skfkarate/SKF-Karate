import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'

function loadEnv() {
  const path = '.env.local'
  if (!existsSync(path)) return

  const content = readFileSync(path, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue

    const index = trimmed.indexOf('=')
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
})

const TIMETABLES = [
  {
    branch_slug: 'herohalli',
    title: 'Official Timetable - May 2026',
    drive_url: '/timetables/herohalli.jpg',
    image_url: '/timetables/herohalli.jpg',
    month_label: 'May 2026',
    effective_from: '2026-05-01',
    effective_to: '2026-05-31',
    is_active: true,
    notes: 'Belt Grading Month. Timing - 6:00 am to 7:00 am.'
  },
  {
    branch_slug: 'mp-sports-club',
    title: 'Official Timetable - May 2026',
    drive_url: '/timetables/mp-sports-club.jpg',
    image_url: '/timetables/mp-sports-club.jpg',
    month_label: 'May 2026',
    effective_from: '2026-05-01',
    effective_to: '2026-05-31',
    is_active: true,
    notes: 'Belt Grading Preparation. Timing - 5:30 pm to 6:30 pm.'
  }
]

async function run() {
  console.log('Upserting branch timetables...')
  
  for (const t of TIMETABLES) {
    // Check if one already exists for this branch and month
    const { data: existing, error: selectErr } = await supabase
      .from('branch_timetables')
      .select('id')
      .eq('branch_slug', t.branch_slug)
      .eq('month_label', t.month_label)
      .limit(1)

    if (selectErr) {
      console.error(`Error checking existing for ${t.branch_slug}:`, selectErr)
      continue
    }

    if (existing && existing.length > 0) {
      const { error: updateErr } = await supabase
        .from('branch_timetables')
        .update({
          title: t.title,
          drive_url: t.drive_url,
          image_url: t.image_url,
          effective_from: t.effective_from,
          effective_to: t.effective_to,
          is_active: t.is_active,
          notes: t.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing[0].id)

      if (updateErr) {
        console.error(`Error updating timetable for ${t.branch_slug}:`, updateErr)
      } else {
        console.log(`✅ Updated timetable for ${t.branch_slug}`)
      }
    } else {
      const { error: insertErr } = await supabase
        .from('branch_timetables')
        .insert({
          branch_slug: t.branch_slug,
          title: t.title,
          drive_url: t.drive_url,
          image_url: t.image_url,
          month_label: t.month_label,
          effective_from: t.effective_from,
          effective_to: t.effective_to,
          is_active: t.is_active,
          notes: t.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (insertErr) {
        console.error(`Error inserting timetable for ${t.branch_slug}:`, insertErr)
      } else {
        console.log(`✅ Inserted timetable for ${t.branch_slug}`)
      }
    }
  }

  console.log('Done.')
}

run()
