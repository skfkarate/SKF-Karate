import { config } from 'dotenv';
config({ path: '.env.local' });
import { supabaseAdmin } from '../lib/server/supabase';

async function main() {
  console.log('Fixing SKF ID in bb_candidates table...');
  
  const { error } = await supabaseAdmin
    .from('bb_candidates')
    .update({ skf_id: 'SKF13BL000' })
    .in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00']);

  if (error) {
    console.error('Error updating bb_candidates:', error);
  } else {
    console.log('Successfully updated bb_candidates.');
  }

  // Also check if they are in student_billing_profiles with the wrong ID
  const { error: billingError } = await supabaseAdmin
    .from('student_billing_profiles')
    .update({ skf_id: 'SKF13BL000' })
    .in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00']);

  if (billingError) {
    console.error('Error updating student_billing_profiles:', billingError);
  } else {
    console.log('Successfully updated student_billing_profiles.');
  }

  // Also update fee_payment_proofs if any
  const { error: proofsError } = await supabaseAdmin
    .from('fee_payment_proofs')
    .update({ skf_id: 'SKF13BL000' })
    .in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00']);

  if (proofsError) {
    console.error('Error updating fee_payment_proofs:', proofsError);
  } else {
    console.log('Successfully updated fee_payment_proofs.');
  }
}

main().catch(console.error);
