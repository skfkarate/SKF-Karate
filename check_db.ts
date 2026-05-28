import { supabaseAdmin } from './lib/server/supabase'

async function run() {
  const { data, error } = await supabaseAdmin.from('athlete_gradings').select('*').limit(1)
  console.info('athlete_gradings check:', { error: error?.message, data })
  
  const { data: athletes, error: athleteError } = await supabaseAdmin.from('athletes').select('skf_id, achievements, current_belt').eq('skf_id', 'SKF21HE001').single()
  console.info('athlete check:', { error: athleteError?.message, data: athletes })
}
run()
