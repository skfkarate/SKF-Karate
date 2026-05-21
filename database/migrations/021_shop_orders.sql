-- Shop order persistence used by /admin/shop, /shop/orders, and checkout.
-- Safe to rerun.

CREATE TABLE IF NOT EXISTS public.skf_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('uniforms', 'belts', 'gear', 'merchandise')),
  price INTEGER NOT NULL DEFAULT 0,
  images JSONB DEFAULT '[]'::jsonb,
  variants JSONB DEFAULT '[]'::jsonb,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  requires_belt TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.skf_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_products" ON public.skf_products;
CREATE POLICY "public_read_products" ON public.skf_products
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "service_role_full_products" ON public.skf_products;
CREATE POLICY "service_role_full_products" ON public.skf_products
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.skf_shop_orders (
  order_id TEXT PRIMARY KEY,
  skf_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('athlete', 'guest')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  points_used INTEGER NOT NULL DEFAULT 0,
  promo_code TEXT,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (
    status IN (
      'processing',
      'payment-pending',
      'pending-approval',
      'approved',
      'shipped',
      'delivered',
      'cancelled'
    )
  ),
  fulfillment_method TEXT NOT NULL DEFAULT 'shipping' CHECK (
    fulfillment_method IN ('shipping', 'dojo-pickup')
  ),
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skf_shop_orders_customer
  ON public.skf_shop_orders(skf_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_skf_shop_orders_status
  ON public.skf_shop_orders(status, created_at DESC);

ALTER TABLE public.skf_shop_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_full_shop_orders" ON public.skf_shop_orders;
CREATE POLICY "service_role_full_shop_orders" ON public.skf_shop_orders
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE OR REPLACE FUNCTION public.place_shop_order(
  p_order_id TEXT,
  p_skf_id TEXT,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_type TEXT,
  p_items JSONB,
  p_subtotal INTEGER,
  p_shipping_fee INTEGER,
  p_total INTEGER,
  p_discount INTEGER,
  p_points_used INTEGER,
  p_promo_code TEXT,
  p_status TEXT,
  p_fulfillment_method TEXT,
  p_address JSONB
)
RETURNS public.skf_shop_orders
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requested_item JSONB;
  current_product RECORD;
  current_variant JSONB;
  next_variants JSONB;
  variant_found BOOLEAN;
  requested_quantity INTEGER;
  created_order public.skf_shop_orders;
BEGIN
  FOR requested_item IN
    SELECT value FROM jsonb_array_elements(COALESCE(p_items, '[]'::jsonb))
  LOOP
    requested_quantity := COALESCE((requested_item->>'quantity')::INTEGER, 0);

    IF requested_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity supplied for shop order.';
    END IF;

    SELECT id, variants
    INTO current_product
    FROM public.skf_products
    WHERE id = requested_item->>'productId'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Shop product % was not found.', requested_item->>'productId';
    END IF;

    next_variants := '[]'::jsonb;
    variant_found := FALSE;

    FOR current_variant IN
      SELECT value FROM jsonb_array_elements(COALESCE(current_product.variants, '[]'::jsonb))
    LOOP
      IF current_variant->>'id' = requested_item->>'variantId' THEN
        variant_found := TRUE;

        IF COALESCE((current_variant->>'stock')::INTEGER, 0) < requested_quantity THEN
          RAISE EXCEPTION 'Insufficient stock for variant %.', requested_item->>'variantId';
        END IF;

        current_variant := jsonb_set(
          current_variant,
          '{stock}',
          to_jsonb(COALESCE((current_variant->>'stock')::INTEGER, 0) - requested_quantity)
        );
      END IF;

      next_variants := next_variants || jsonb_build_array(current_variant);
    END LOOP;

    IF NOT variant_found THEN
      RAISE EXCEPTION 'Shop variant % was not found.', requested_item->>'variantId';
    END IF;

    UPDATE public.skf_products
    SET
      variants = next_variants,
      updated_at = NOW()
    WHERE id = current_product.id;
  END LOOP;

  INSERT INTO public.skf_shop_orders (
    order_id,
    skf_id,
    customer_name,
    customer_phone,
    customer_type,
    items,
    subtotal,
    shipping_fee,
    total,
    discount,
    points_used,
    promo_code,
    status,
    fulfillment_method,
    address,
    created_at,
    updated_at
  ) VALUES (
    p_order_id,
    NULLIF(p_skf_id, ''),
    p_customer_name,
    p_customer_phone,
    p_customer_type,
    COALESCE(p_items, '[]'::jsonb),
    COALESCE(p_subtotal, 0),
    COALESCE(p_shipping_fee, 0),
    COALESCE(p_total, 0),
    COALESCE(p_discount, 0),
    COALESCE(p_points_used, 0),
    NULLIF(p_promo_code, ''),
    p_status,
    p_fulfillment_method,
    COALESCE(p_address, '{}'::jsonb),
    NOW(),
    NOW()
  )
  RETURNING * INTO created_order;

  RETURN created_order;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM PUBLIC;

REVOKE EXECUTE ON FUNCTION public.place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM anon;

REVOKE EXECUTE ON FUNCTION public.place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.place_shop_order(
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  TEXT,
  JSONB,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  INTEGER,
  TEXT,
  TEXT,
  TEXT,
  JSONB
) TO service_role;
