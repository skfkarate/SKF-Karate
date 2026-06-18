import { config } from 'dotenv';
config({ path: '.env.local' });
import { supabaseAdmin } from '../lib/server/supabase';

async function main() {
  console.log('Fetching active Black Belt Candidates...');
  
  // 1. Get active program
  const { data: program } = await supabaseAdmin.from('black_belt_programs').select('id').eq('status', 'active').single();
  if (!program) {
    console.log('No active program found.');
    return;
  }
  
  // 2. Get candidates
  const { data: candidates } = await supabaseAdmin.from('black_belt_candidates').select('skf_id').eq('program_id', program.id).eq('status', 'active');
  if (!candidates || candidates.length === 0) {
    console.log('No active candidates found.');
    return;
  }
  
  const skfIds = candidates.map((c: { skf_id: string }) => c.skf_id);
  console.log(`Found ${skfIds.length} candidates:`, skfIds);
  
  // 3. Exclude Shri Roshan (SKF13BL000 or similar)
  const excludePattern = /SKF.*13.*BL.*000/i; // Just to be safe, or we find exactly Shri Roshan
  
  const { data: athletes } = await supabaseAdmin.from('athlete_records').select('skf_id, first_name, last_name').in('skf_id', skfIds);
  
  const toUpdate = [];
  const excluded = [];
  
  for (const athlete of athletes ?? []) {
    const fullName = `${athlete.first_name} ${athlete.last_name}`.toLowerCase();
    if (fullName.includes('roshan') || excludePattern.test(athlete.skf_id)) {
      excluded.push(athlete);
    } else {
      toUpdate.push(athlete);
    }
  }
  
  console.log('Excluded from 2000 fee update:', excluded);
  console.log('To update to 2000 fee:', toUpdate.map(a => a.skf_id));
  
  // 4. Update student_billing_profiles
  for (const athlete of toUpdate) {
    const { error } = await supabaseAdmin.from('student_billing_profiles')
      .update({ monthly_fee: 2000 })
      .eq('skf_id', athlete.skf_id);
      
    if (error) {
      console.error(`Failed to update ${athlete.skf_id}:`, error);
    } else {
      console.log(`Successfully updated monthly_fee to 2000 for ${athlete.skf_id} (${athlete.first_name})`);
    }
  }
}

main().catch(console.error);
