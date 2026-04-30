-- Atomic points mutations.
-- Apply this migration before deploying lib/points/pointsService.ts changes.

CREATE OR REPLACE FUNCTION public.skf_points_tier(p_total_earned INTEGER)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_total_earned >= 40000 THEN 'black'
    WHEN p_total_earned >= 20000 THEN 'brown'
    WHEN p_total_earned >= 10000 THEN 'blue'
    WHEN p_total_earned >= 5000 THEN 'green'
    WHEN p_total_earned >= 2500 THEN 'orange'
    WHEN p_total_earned >= 1000 THEN 'yellow'
    ELSE 'white'
  END;
$$;

CREATE OR REPLACE FUNCTION public.award_points(
  p_skf_id TEXT,
  p_reason TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_total_earned INTEGER;
  v_new_balance INTEGER;
  v_new_total_earned INTEGER;
  v_new_tier TEXT;
BEGIN
  IF p_skf_id IS NULL OR btrim(p_skf_id) = '' THEN
    RAISE EXCEPTION 'SKF_ID_REQUIRED';
  END IF;

  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'POINTS_MUST_BE_POSITIVE';
  END IF;

  INSERT INTO student_points (skf_id, current_balance, total_earned, total_redeemed, tier)
  VALUES (upper(btrim(p_skf_id)), 0, 0, 0, 'white')
  ON CONFLICT (skf_id) DO NOTHING;

  SELECT current_balance, total_earned
  INTO v_current_balance, v_total_earned
  FROM student_points
  WHERE skf_id = upper(btrim(p_skf_id))
  FOR UPDATE;

  v_new_balance := COALESCE(v_current_balance, 0) + p_points;
  v_new_total_earned := COALESCE(v_total_earned, 0) + p_points;
  v_new_tier := skf_points_tier(v_new_total_earned);

  INSERT INTO point_transactions (
    skf_id,
    type,
    reason,
    points,
    balance_before,
    balance_after,
    metadata
  )
  VALUES (
    upper(btrim(p_skf_id)),
    'EARN',
    p_reason,
    p_points,
    COALESCE(v_current_balance, 0),
    v_new_balance,
    COALESCE(p_metadata, '{}'::JSONB)
  );

  UPDATE student_points
  SET
    current_balance = v_new_balance,
    total_earned = v_new_total_earned,
    tier = v_new_tier,
    updated_at = NOW()
  WHERE skf_id = upper(btrim(p_skf_id));

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'points_awarded', p_points,
    'tier', v_new_tier
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.redeem_points(
  p_skf_id TEXT,
  p_reason TEXT,
  p_points INTEGER,
  p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_total_redeemed INTEGER;
  v_new_balance INTEGER;
BEGIN
  IF p_skf_id IS NULL OR btrim(p_skf_id) = '' THEN
    RAISE EXCEPTION 'SKF_ID_REQUIRED';
  END IF;

  IF p_points IS NULL OR p_points <= 0 THEN
    RAISE EXCEPTION 'POINTS_MUST_BE_POSITIVE';
  END IF;

  SELECT current_balance, total_redeemed
  INTO v_current_balance, v_total_redeemed
  FROM student_points
  WHERE skf_id = upper(btrim(p_skf_id))
  FOR UPDATE;

  IF NOT FOUND OR COALESCE(v_current_balance, 0) < p_points THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  v_new_balance := COALESCE(v_current_balance, 0) - p_points;

  INSERT INTO point_transactions (
    skf_id,
    type,
    reason,
    points,
    balance_before,
    balance_after,
    metadata
  )
  VALUES (
    upper(btrim(p_skf_id)),
    'REDEEM',
    p_reason,
    -p_points,
    COALESCE(v_current_balance, 0),
    v_new_balance,
    COALESCE(p_metadata, '{}'::JSONB)
  );

  UPDATE student_points
  SET
    current_balance = v_new_balance,
    total_redeemed = COALESCE(v_total_redeemed, 0) + p_points,
    updated_at = NOW()
  WHERE skf_id = upper(btrim(p_skf_id));

  RETURN jsonb_build_object(
    'new_balance', v_new_balance,
    'points_redeemed', p_points
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.skf_points_tier(INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.award_points(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.redeem_points(TEXT, TEXT, INTEGER, JSONB) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.skf_points_tier(INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.award_points(TEXT, TEXT, INTEGER, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION public.redeem_points(TEXT, TEXT, INTEGER, JSONB) TO service_role;
