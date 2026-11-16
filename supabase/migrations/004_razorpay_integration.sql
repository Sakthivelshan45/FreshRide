-- ============================================================
-- Migration 004: Add razorpay_order_id to orders + RLS for service role
-- Run in: Supabase Dashboard > SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- Add razorpay_order_id to orders for direct Razorpay lookup
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create unique index so a Razorpay order can't be linked twice
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'orders'
      AND indexname = 'orders_razorpay_order_id_key'
  ) THEN
    CREATE UNIQUE INDEX orders_razorpay_order_id_key
      ON public.orders (razorpay_order_id)
      WHERE razorpay_order_id IS NOT NULL;
  END IF;
END;
$$;

-- Add razorpay_payment_id to orders for quick payment lookup
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Order writes are performed through server routes using the service-role
-- client. Never create client-accessible write policies for orders/payments.
