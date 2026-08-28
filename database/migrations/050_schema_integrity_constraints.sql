-- Migration 050: Schema integrity constraints
-- Adds updated_at triggers, CHECK constraints, and missing ON DELETE CASCADE.
-- Fully re-runnable: every operation is guarded by table/trigger/constraint
-- existence checks, so missing tables are skipped and re-runs are no-ops.

-- ============================================================
-- 0. Guard helpers
--    table_exists      -> is the table present?
--    ensure_constraint -> add a CHECK constraint if missing
-- ============================================================
CREATE OR REPLACE FUNCTION table_exists(tbl TEXT) RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = tbl
  );
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION ensure_constraint(tbl TEXT, con_name TEXT, con_def TEXT) RETURNS VOID AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = tbl
  ) THEN
    RAISE NOTICE 'Skipping constraint % on missing table %', con_name, tbl;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = con_name AND connamespace = 'public'::regnamespace
  ) THEN
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I %s', tbl, con_name, con_def);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 1. Universal updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to all present tables that have the column
DO $$
DECLARE
  tbl TEXT;
  tables_with_updated_at TEXT[] := ARRAY[
    'auth_sessions', 'programs', 'certificates', 'athletes',
    'fee_records', 'student_points', 'skf_products', 'skf_shop_orders',
    'portal_practice_folders', 'portal_videos', 'portal_practice_photos',
    'fee_credits', 'student_billing_profiles',
    'admission_applications', 'enrollments', 'bb_programs',
    'bb_candidates', 'events', 'event_fee_configs',
    'development_fund_expenses', 'fee_audit_logs', 'fee_receipts',
    'fee_payment_intents', 'ranking_snapshots', 'staff_accounts',
    'tournaments', 'blog_posts', 'gallery_photos', 'leads',
    'push_subscriptions', 'video_progress'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables_with_updated_at LOOP
    IF table_exists(tbl) THEN
      EXECUTE format('DROP TRIGGER IF EXISTS set_%I_updated_at ON %I', tbl, tbl);
      EXECUTE format(
        'CREATE TRIGGER set_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()',
        tbl, tbl
      );
    END IF;
  END LOOP;
END;
$$;

-- ============================================================
-- 2. Add updated_at to programs table (was missing)
-- ============================================================
DO $$
BEGIN
  IF table_exists('programs') THEN
    EXECUTE 'ALTER TABLE programs ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()';
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='programs' AND column_name='created_at') THEN
      EXECUTE 'UPDATE programs SET updated_at = created_at WHERE updated_at IS NULL';
    END IF;
  END IF;
END;
$$;

-- ============================================================
-- 3. Add ON DELETE CASCADE for certificate_events.enrollment_id
-- ============================================================
DO $$
BEGIN
  IF table_exists('certificate_events') AND table_exists('enrollments') THEN
    EXECUTE 'ALTER TABLE certificate_events DROP CONSTRAINT IF EXISTS certificate_events_enrollment_id_fkey';
    EXECUTE 'ALTER TABLE certificate_events ADD CONSTRAINT certificate_events_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE';
  END IF;
END;
$$;

-- ============================================================
-- 4. Financial amount CHECK constraints (non-negative)
-- ============================================================
SELECT ensure_constraint('fee_records', 'fee_records_amount_nonneg', 'CHECK (amount >= 0)');
SELECT ensure_constraint('event_fee_configs', 'event_fee_configs_amount_nonneg', 'CHECK (default_amount >= 0)');
SELECT ensure_constraint('event_fee_expenses', 'event_fee_expenses_amount_nonneg', 'CHECK (amount >= 0)');
SELECT ensure_constraint('event_fee_deposits', 'event_fee_deposits_amount_nonneg', 'CHECK (amount >= 0)');
SELECT ensure_constraint('fee_credits', 'fee_credits_amount_nonneg', 'CHECK (amount >= 0)');
SELECT ensure_constraint('development_fund_expenses', 'dev_fund_expenses_amount_nonneg', 'CHECK (amount >= 0)');
SELECT ensure_constraint('admission_branch_settings', 'admission_settings_monthly_fee_nonneg', 'CHECK (default_monthly_fee >= 0)');
SELECT ensure_constraint('admission_branch_settings', 'admission_settings_admission_fee_nonneg', 'CHECK (default_admission_fee >= 0)');
SELECT ensure_constraint('skf_shop_orders', 'shop_orders_total_nonneg', 'CHECK (total >= 0)');
SELECT ensure_constraint('skf_shop_orders', 'shop_orders_subtotal_nonneg', 'CHECK (subtotal >= 0)');
SELECT ensure_constraint('skf_shop_orders', 'shop_orders_shipping_nonneg', 'CHECK (shipping_fee >= 0)');

-- ============================================================
-- 5. Points integrity constraints
-- ============================================================
SELECT ensure_constraint('point_transactions', 'point_transactions_points_positive', 'CHECK (points > 0)');
SELECT ensure_constraint('student_points', 'student_points_balance_nonneg', 'CHECK (current_balance >= 0)');
SELECT ensure_constraint('point_transactions', 'point_transactions_balance_before_nonneg', 'CHECK (balance_before >= 0)');
SELECT ensure_constraint('point_transactions', 'point_transactions_balance_after_nonneg', 'CHECK (balance_after >= 0)');

-- ============================================================
-- 6. Status/type CHECK constraints
-- ============================================================
SELECT ensure_constraint('events', 'events_type_check', 'CHECK (type IN (''tournament'', ''selection_test'', ''grading'', ''camp'', ''expo'', ''office_event'', ''international_event'', ''other''))');
SELECT ensure_constraint('events', 'events_status_check', 'CHECK (status IN (''draft'', ''upcoming'', ''in_progress'', ''completed'', ''cancelled''))');
SELECT ensure_constraint('tournaments', 'tournaments_status_check', 'CHECK (status IN (''draft'', ''upcoming'', ''in_progress'', ''completed'', ''cancelled''))');
SELECT ensure_constraint('fee_records', 'fee_records_month_check', 'CHECK (month IN (''January'', ''February'', ''March'', ''April'', ''May'', ''June'', ''July'', ''August'', ''September'', ''October'', ''November'', ''December''))');

-- ============================================================
-- 7. Promo code discount validation
-- ============================================================
SELECT ensure_constraint('admission_promo_codes', 'promo_discount_value_positive', 'CHECK (discount_value > 0)');

-- ============================================================
-- 8. Add missing indexes
-- ============================================================
DO $$
BEGIN
  IF table_exists('portal_practice_folders') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_portal_practice_folders_parent ON portal_practice_folders(parent_folder_id)';
  END IF;
  IF table_exists('portal_videos') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_portal_videos_folder ON portal_videos(folder_id)';
  END IF;
END;
$$;

-- ============================================================
-- Cleanup: drop the guard helpers (not needed at runtime)
-- ============================================================
DROP FUNCTION IF EXISTS table_exists;
DROP FUNCTION IF EXISTS ensure_constraint;