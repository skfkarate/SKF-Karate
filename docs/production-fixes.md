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

**Fix — Run `database/migrations/032_fix_push_subscriptions_schema.sql` in Supabase SQL Editor.**
This migration is idempotent and adds all missing columns, indexes, and constraints. It is equivalent to 028 but written as a standalone fix.

```sql
ALTER TABLE public.push_subscriptions
  ADD COLUMN IF NOT EXISTS endpoint TEXT,
  ADD COLUMN IF NOT EXISTS audience TEXT NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS staff_id TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
```

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

## 4. Black Belt Page Not Visible (React error #418)
**Root cause:** Server/client hydration mismatch. `getCurrentMonth()` and `getDaysUntil()` used `Date.now()` inside `useMemo`, producing different values on the server (SSR) vs client (hydration). The month-level navigation caused completely different HTML trees to render, crashing hydration.

**Fix in code:**
- `app/portal/blackbelt/BlackBeltClient.tsx` — Moved date-based calculations from `useMemo` to `useEffect` + `useState` so they only run client-side after hydration.
- `app/portal/blackbelt/page.tsx` — Normalized athlete SKF ID before comparison and before passing to the client component, matching the `isActiveBBCandidate` pattern used by the nav layout.

## 5. Fee Payment Proof Photo Alert Timeout
**Root cause:** `sendTelegramPhoto()` called with `timeoutMs: 3000` (3 seconds) for uploading photos — too short for Telegram's file upload API.

**Fix in code:**
- `src/server/services/fee-operations.service.ts` — Photo timeout: 3000ms → 15000ms; fallback message timeouts: 3000ms → 10000ms.
- `app/portal/blackbelt/actions.ts` — Photo timeout: 5000ms → 15000ms.

## 6. SKF21HE003 — Revert Mistakenly Paid Monthly Fee
**Request:** June 2026 monthly fee was marked as paid by mistake. Revert to `due` status.

**Run in Supabase SQL Editor:**
```sql
-- First, check the current fee record
SELECT id, skf_id, fee_type, month, year, amount, status, paid_date, receipt_id
FROM fee_records
WHERE skf_id = 'SKF21HE003'
  AND fee_type = 'monthly'
  AND month = 'June'
  AND year = 2026;

-- Then revert the payment
UPDATE fee_records
SET status = 'due',
    paid_date = NULL,
    receipt_id = NULL,
    payment_method = NULL,
    verified_by = NULL,
    verified_at = NULL,
    updated_at = NOW()
WHERE skf_id = 'SKF21HE003'
  AND fee_type = 'monthly'
  AND month = 'June'
  AND year = 2026
  AND status = 'paid';
```
Verify by checking the record again after running.

## 7. Belt Exam Fee Button Visible for Wrong Students/Months
**Root cause in code:** The belt exam approval button in FeeTrack's StudentList was shown whenever a student had any unpaid belt_exam eventDue, regardless of which month was selected. This meant:
- Non-exam students who had a belt exam fee record saw the button in all months
- The button was not restricted to the exam's specific month

**Fix in code (`StudentList.tsx`):** Button now filters by `d.month === selectedMonthName`, so it only appears when viewing the exact month the belt exam fee is for.

**Data fix — Remove incorrect belt exam fee for SKF25MP007 (if needed in Supabase):**
```sql
SELECT id, skf_id, fee_type, month, year, amount, status
FROM fee_records
WHERE skf_id = 'SKF25MP007' AND fee_type = 'belt_exam';
-- If the student should NOT have this fee, revert it:
-- UPDATE fee_records SET status = 'due', paid_date = NULL ... WHERE id = '<id>';
```

## 8. Delete Temp Files After October 2026
When black belt exam is complete, delete these files:
- `SKF-FeeTrack/src/lib/temporary-black-belt-override.ts`
- `SKF-Karate/lib/server/temporary-black-belt-override.ts`
- Remove `getBlackBeltOverride` imports from:
  - `SKF-FeeTrack/src/app/students/[branch]/StudentList.tsx`
  - `SKF-Karate/app/portal/fees/FeesClient.tsx`
