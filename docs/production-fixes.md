# Production Fixes Required

## 1. Herohalli Branch Not Showing Belt Exams
**Root cause:** `staff_accounts` table has `branch_scope` set to `'M P Sports Club'` for the FeeTrack staff account, filtering out Herohalli events.

**Fix — Run in Supabase SQL Editor:**
```sql
-- Check current branch_scope
SELECT username, branch_scope FROM staff_accounts;

-- Set to 'all' to see both branches
UPDATE staff_accounts SET branch_scope = 'all'
WHERE username = '<your-feetrack-username>';
```

## 2. Push Subscription Error (`audience` column missing)
**Root cause:** Migration `database/migrations/028_feetrack_staff_push_notifications.sql` never applied to production.

**Fix — Run entire migration file in Supabase SQL Editor:**
```sql
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```
(Full script in `database/migrations/028_feetrack_staff_push_notifications.sql`)

## 3. SKF25HE003 Monthly Fee → ₹400
The `students` table does not exist — FeeTrack billing uses `student_billing_profiles`, and the main app uses `athletes.monthly_fee`. The legacy seed has ₹500 in both.

**Run in Supabase SQL Editor:**
```sql
-- Update billing profile (used by FeeTrack)
UPDATE student_billing_profiles SET monthly_fee = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003';

-- Update athlete record (used by main app)
UPDATE athletes SET monthly_fee = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003';

-- Fix any existing fee_records that have 500 (they should reflect correct amount)
UPDATE fee_records SET amount = 400, updated_at = NOW()
WHERE skf_id = 'SKF25HE003' AND amount = 500;
```

## 4. Delete Temp Files After October 2026
When black belt exam is complete, delete these files:
- `SKF-FeeTrack/src/lib/temporary-black-belt-override.ts`
- `SKF-Karate/lib/server/temporary-black-belt-override.ts`
- Remove `getBlackBeltOverride` imports from:
  - `SKF-FeeTrack/src/app/students/[branch]/StudentList.tsx`
  - `SKF-Karate/app/portal/fees/FeesClient.tsx`
