-- Allow customers and admins to read the order item rows required by order pages.

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'order_items'
      AND policyname = 'Users can read own order items'
  ) THEN
    CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.orders
        WHERE orders.id = order_items.order_id
          AND orders.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'order_items'
      AND policyname = 'Admin full access order items'
  ) THEN
    CREATE POLICY "Admin full access order items" ON public.order_items FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
      )
    );
  END IF;
END;
$$;
