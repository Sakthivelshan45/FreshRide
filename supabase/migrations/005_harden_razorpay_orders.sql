-- Align the existing order model with Razorpay while preserving COD and
-- fulfillment statuses used elsewhere in the application.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'status'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'fulfillment_status'
  ) THEN
    ALTER TABLE public.orders RENAME COLUMN status TO fulfillment_status;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.orders RENAME COLUMN payment_status TO status;
  END IF;
END;
$$;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS amount NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

UPDATE public.orders
SET amount = total
WHERE amount IS NULL;

ALTER TABLE public.orders
  ALTER COLUMN amount SET NOT NULL;

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;

UPDATE public.orders
SET status = CASE
  WHEN status IN ('paid', 'failed') THEN status
  WHEN status = 'refunded' THEN 'paid'
  ELSE 'created'
END;

ALTER TABLE public.orders
  ALTER COLUMN status SET DEFAULT 'created',
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('created', 'paid', 'failed'));

ALTER TABLE public.orders
  ADD CONSTRAINT orders_fulfillment_status_check
  CHECK (fulfillment_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- Razorpay order IDs are unique whenever present (NULL is retained for COD
-- orders and historical orders that predate the integration).
CREATE UNIQUE INDEX IF NOT EXISTS orders_razorpay_order_id_key
  ON public.orders (razorpay_order_id)
  WHERE razorpay_order_id IS NOT NULL;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Browser/authenticated clients may read only their own orders and items.
-- Server API routes use the service-role client for all writes.
DROP POLICY IF EXISTS "Allow order creation" ON public.orders;
DROP POLICY IF EXISTS "Allow order updates" ON public.orders;
DROP POLICY IF EXISTS "Admin full access orders" ON public.orders;
DROP POLICY IF EXISTS "Allow order items creation" ON public.order_items;
DROP POLICY IF EXISTS "Admin full access order items" ON public.order_items;
DROP POLICY IF EXISTS "Allow payment creation" ON public.payments;
DROP POLICY IF EXISTS "Allow payment updates" ON public.payments;

DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can read all orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can read all order items" ON public.order_items;
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );
