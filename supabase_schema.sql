-- ═══════════════════════════════════════════════════════════════════════
-- SOLYNÉ — Fix Migration (IDEMPOTENT, run in Supabase SQL Editor)
-- Fixes infinite recursion in RLS policies by using a security definer
-- function that bypasses RLS when checking the user's role.
-- ═══════════════════════════════════════════════════════════════════════


-- 1. Security Definer helper — reads profiles WITHOUT triggering RLS
--    This breaks the infinite recursion loop.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER   -- runs as the function owner, bypasses caller's RLS
AS $$
  SELECT role::TEXT FROM public.profiles WHERE id = auth.uid();
$$;


-- 2. Add missing columns to existing products table
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS discount_price NUMERIC,
  ADD COLUMN IF NOT EXISTS stock          INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_on_sale     BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sizes          TEXT[]  NOT NULL DEFAULT '{}';


-- 3. Fix Products policies (replace subquery with get_my_role())
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.get_my_role() = 'admin');


-- 4. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  total_amount     NUMERIC     NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'pending',
  shipping_address TEXT,
  contact_number   TEXT,
  payment_method   TEXT        DEFAULT 'COD',
  transaction_id   TEXT,
  delivery_info    TEXT,
  admin_notes      TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders"  ON public.orders;
DROP POLICY IF EXISTS "Users can create orders"    ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders"   ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE USING (public.get_my_role() = 'admin');


-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id                UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID    NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id        UUID    REFERENCES public.products(id) ON DELETE SET NULL,
  quantity          INTEGER NOT NULL,
  price_at_purchase NUMERIC NOT NULL,
  selected_size     TEXT,
  selected_color    TEXT
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items"  ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items"    ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert order items"
  ON public.order_items FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT USING (public.get_my_role() = 'admin');


-- 6. Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read for product images"                ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images"              ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images"              ON storage.objects;

CREATE POLICY "Public read for product images"
  ON storage.objects FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');


-- ═══════════════════════════════════════════════════════════════════════
-- REMINDER: Grant yourself admin access:
--
--   UPDATE public.profiles
--   SET role = 'admin'
--   WHERE email = 'your-email@example.com';
--
-- ═══════════════════════════════════════════════════════════════════════
