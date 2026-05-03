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

const SENSEIS = [
  {
    id: 'sen_krishna',
    slug: 'krishna-c',
    name: 'Krishna C',
    title: 'Sensei',
    dan: 'Black Belt',
    role: 'Executive Committee',
    description: 'Executive Committee Member',
    full_bio: 'Sensei Krishna C is an Executive Committee Member of the association and leads the Herohalli branch.',
    is_executive_committee: true,
    is_assignable: true,
    is_public: true,
    is_active: true,
    sort_order: 10
  },
  {
    id: 'sen_usha',
    slug: 'usha-c',
    name: 'Usha C',
    title: 'Sensei',
    dan: 'Black Belt',
    role: 'Instructor',
    description: 'Lead Instructor at MP Sports Club',
    full_bio: 'Sensei Usha C leads the MP Sports Club branch in Bangalore.',
    is_executive_committee: false,
    is_assignable: true,
    is_public: true,
    is_active: true,
    sort_order: 11
  }
]

const CITIES = [
  { slug: 'bangalore', name: 'Bangalore', state: 'Karnataka', sort_order: 1 },
  { slug: 'kunigal', name: 'Kunigal', state: 'Karnataka', sort_order: 2 },
  { slug: 'tumkur', name: 'Tumkur', state: 'Karnataka', sort_order: 3 },
  { slug: 'udupi', name: 'Udupi', state: 'Karnataka', sort_order: 4 },
]

const BRANCHES = [
  {
    slug: 'mp-sports-club',
    city_slug: 'bangalore',
    lead_sensei_id: 'sen_usha',
    name: 'MP Sports Club',
    is_hq: true,
    address: 'Mallathahalli, Bangalore',
    phone: '',
    whatsapp: '',
    sensei: 'Usha C',
    sensei_dan: 'Black Belt',
    class_days: [2, 3, 5],
    class_time: '5:00 PM - 6:30 PM',
    map_url: 'https://maps.app.goo.gl/kKwL2wSJtHypZQW76',
    photos: ['https://lh3.googleusercontent.com/gps-cs-s/APNQkAHIVXzPW1wkwN7gkY_VuTe2Z2Ydg8DEcQ2FUB0uomRzOBwmsZk0rdmTSU4GZ4DkBBCCYir7NcuEbNjVh3c9897-Ni-hlbQv-z_6dcdoE20FeO-4REK1OTjepOkfqEKfosMtrrDh=s1360-w1360-h1020-rw'],
    description: 'MP Sports Club Branch - 1 Batch',
    sort_order: 1
  },
  {
    slug: 'herohalli',
    city_slug: 'bangalore',
    lead_sensei_id: 'sen_krishna',
    name: 'Herohalli',
    is_hq: false,
    address: 'Herohalli, Bangalore',
    phone: '',
    whatsapp: '',
    sensei: 'Krishna C',
    sensei_dan: 'Black Belt',
    class_days: [2, 3, 5],
    class_time: '6:00 AM - 7:00 AM',
    map_url: 'https://maps.app.goo.gl/kSwX8a1hN4JYLUpa8',
    photos: ['https://lh3.googleusercontent.com/p/AF1QipMC2mNGhAwgrTUqfNlXki6WsbRmIhJYzur2lJad=s1360-w1360-h1020-rw'],
    description: 'Herohalli Branch - 1 Batch',
    sort_order: 2
  }
]

const SCHOOLS = [
  { id: 'sch_1', city_slug: 'bangalore', city: 'Bangalore', name: 'Maria Sadan Public School', sort_order: 1 },
  { id: 'sch_2', city_slug: 'bangalore', city: 'Bangalore', name: 'New Baldwin', sort_order: 2 },
  { id: 'sch_3', city_slug: 'bangalore', city: 'Bangalore', name: 'S S Public School', sort_order: 3 },
  { id: 'sch_4', city_slug: 'bangalore', city: 'Bangalore', name: 'Shree Soundrya Vidyamanya Vidya Kendra', sort_order: 4 },
]

async function run() {
  console.log('Upserting senseis...')
  const { error: senseiErr } = await supabase.from('senseis').upsert(SENSEIS)
  if (senseiErr) console.error('Senseis Error:', senseiErr)

  console.log('Upserting cities...')
  const { error: cityErr } = await supabase.from('class_cities').upsert(CITIES)
  if (cityErr) console.error('Cities Error:', cityErr)

  console.log('Upserting branches...')
  const { error: branchErr } = await supabase.from('class_branches').upsert(BRANCHES)
  if (branchErr) console.error('Branches Error:', branchErr)

  console.log('Upserting schools...')
  const { error: schoolErr } = await supabase.from('class_schools').upsert(SCHOOLS)
  if (schoolErr) console.error('Schools Error:', schoolErr)

  console.log('Done.')
}

run()
