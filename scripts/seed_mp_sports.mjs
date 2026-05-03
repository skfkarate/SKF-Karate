import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

const students = [
  {
    id: 'SKF25MP001',
    skf_id: 'SKF25MP001',
    first_name: 'Neshu',
    last_name: 'Ram',
    date_of_birth: '2018-11-09',
    gender: 'female',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-17',
    status: 'active',
    parent_name: 'Sharathbabu',
    phone: '9591779191',
    email: 'sharathbabuhn@gmail.com',
  },
  {
    id: 'SKF25MP002',
    skf_id: 'SKF25MP002',
    first_name: 'Ganvith',
    last_name: 'Ishan',
    date_of_birth: '2019-03-04',
    gender: 'male',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-27',
    status: 'active',
    parent_name: 'Balaji',
    phone: '8123404357',
    email: 'balaji.mp111@gmail.com',
  },
  {
    id: 'SKF25MP004',
    skf_id: 'SKF25MP004',
    first_name: 'Duvan',
    last_name: 'Gowda',
    date_of_birth: '2019-12-06',
    gender: 'male',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-28',
    status: 'active',
    parent_name: 'Darshan B B',
    phone: '9886633051',
    email: 'imdrshngwda@gmail.com',
  },
  {
    id: 'SKF25MP005',
    skf_id: 'SKF25MP005',
    first_name: 'Viharika',
    last_name: 'S Gowda',
    date_of_birth: '2017-05-26',
    gender: 'female',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-28',
    status: 'active',
    parent_name: 'Siddaraju S',
    phone: '7019063688',
    email: 'Siddu.borntorule@gmail.com',
  },
  {
    id: 'SKF25MP006',
    skf_id: 'SKF25MP006',
    first_name: 'Samisha',
    last_name: 'K Gowda',
    date_of_birth: '2020-05-16',
    gender: 'female',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-31',
    status: 'inactive',
    parent_name: 'Kiran Kumar J',
    phone: '9611766327',
    email: 'jayaramyalinil@gmail.com',
  },
  {
    id: 'SKF25MP003',
    skf_id: 'SKF25MP003',
    first_name: 'Tharush',
    last_name: 'H Gowda',
    date_of_birth: '2020-10-08',
    gender: 'male',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-10-27',
    status: 'active',
    parent_name: 'Samatha',
    phone: '7619373844',
    email: 'samatharsha080@gmail.com',
  },
  {
    id: 'SKF25MP007',
    skf_id: 'SKF25MP007',
    first_name: 'Purvank',
    last_name: 'P',
    date_of_birth: '2021-03-29',
    gender: 'male',
    branch_name: 'M P Sports Club',
    current_belt: 'white',
    join_date: '2025-11-09',
    status: 'active',
    parent_name: 'Keerthana',
    phone: '8618404399',
    email: 'keerthanarasna@gmail.com',
  }
]

async function seed() {
  console.log('Starting insert...')
  const { error } = await supabase.from('athletes').upsert(students)
  if (error) {
    console.error('Error inserting:', error)
  } else {
    console.log('Successfully inserted', students.length, 'students')
  }
}

seed()
