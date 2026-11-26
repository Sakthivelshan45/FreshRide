ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS hover_image_url TEXT;
