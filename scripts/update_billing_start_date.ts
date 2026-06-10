import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function main() {
  const skfId = "SKF26MP001";
  const newDate = "2026-06-01";

  console.log(`Updating billing_start_date for ${skfId} to ${newDate}...`);

  // We should also check athlete_profiles table since joinDate is synced there
  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("athlete_profiles")
    .select("id, skf_id, join_date")
    .eq("skf_id", skfId)
    .single();

  if (profileErr) {
    console.warn("Could not find athlete profile:", profileErr.message);
  } else {
    console.log("Current join_date in athlete_profiles:", profile.join_date);
    // Update join_date as well just in case
    const { error: updateProfileErr } = await supabaseAdmin
      .from("athlete_profiles")
      .update({ join_date: newDate })
      .eq("skf_id", skfId);
    if (updateProfileErr) console.error("Failed to update athlete_profiles:", updateProfileErr.message);
    else console.log("Successfully updated join_date in athlete_profiles.");
  }

  const { data, error } = await supabaseAdmin
    .from("student_billing_profiles")
    .upsert({ skf_id: skfId, billing_start_date: newDate }, { onConflict: "skf_id" })
    .select()
    .single();

  if (error) {
    console.error("Error updating billing profile:", error.message);
  } else {
    console.log("Successfully updated student_billing_profiles:", data);
  }
}

main().catch(console.error);
