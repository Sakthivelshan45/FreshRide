-- ============================================================
-- Migration 003: Add 8 new Fresh Ride products
-- Run in: Supabase Dashboard > SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================================

-- Add category and feature_tags columns if not present
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS feature_tags TEXT[] DEFAULT '{}';

-- ============================================================
-- SEED 8 NEW PRODUCTS (upsert on slug = no duplicates)
-- ============================================================
INSERT INTO public.products (name, slug, short_description, description, category, feature_tags, is_active)
VALUES
  (
    '3D Contoured Sleep Eye Mask',
    'sleep-eye-mask',
    'Blocks light for deep and comfortable sleep anywhere.',
    'The Fresh Ride Sleep Eye Mask features a 3D contoured design that blocks out all light without pressing on your eyes. Lightweight and adjustable for all head sizes. Perfect for travel, long flights, and sleeper bus journeys.',
    'Sleep',
    ARRAY['Comfortable','Lightweight','Adjustable'],
    false
  ),
  (
    'Disposable Foam Ear Plugs',
    'disposable-foam-ear-plugs',
    'Soft foam ear plugs reduce noise for peaceful sleep.',
    'Fresh Ride Disposable Foam Ear Plugs are made from soft, hypoallergenic foam that gently expands to fit your ear canal. Single-use and hygienically packed for safe travel. Significantly reduces ambient noise for better rest.',
    'Sleep',
    ARRAY['Noise Reduction','Disposable','Safe'],
    false
  ),
  (
    'Reusable Silicone Ear Plugs',
    'reusable-silicone-ear-plugs',
    'Washable, reusable and comfortable with a travel case.',
    'Fresh Ride Reusable Silicone Ear Plugs are soft, washable, and designed for long-term use. Comes with a compact travel case on a keychain so you never lose them. Ideal for frequent travellers.',
    'Sleep',
    ARRAY['Reusable','Washable','Travel Case'],
    false
  ),
  (
    'Inflatable Travel Neck Pillow',
    'inflatable-neck-pillow',
    'Ergonomic neck support for long journeys and better rest.',
    'The Fresh Ride Inflatable Neck Pillow provides ergonomic support for your neck during long bus, train, or flight journeys. Inflates in seconds and packs flat into a compact drawstring pouch. Lightweight and easy to carry.',
    'Comfort',
    ARRAY['Lightweight','Inflatable','Compact'],
    false
  ),
  (
    'Disposable Pillow Covers',
    'disposable-pillow-cover',
    'Hygienic single-use pillow covers for clean and safe travel.',
    'Fresh Ride Disposable Pillow Covers are individually sealed for hygiene and designed to fit standard travel and hotel pillows. Soft, breathable non-woven fabric ensures comfort. Use once and dispose — no washing required.',
    'Bedding',
    ARRAY['Disposable','Hygienic','Soft'],
    false
  ),
  (
    'Compact Travel Blanket',
    'compact-travel-blanket',
    'Lightweight blanket to keep you warm and comfortable.',
    'The Fresh Ride Compact Travel Blanket is a lightweight fleece blanket designed for overnight travel. Soft, warm, and packable into a small drawstring pouch. Perfect for sleeper buses, trains, and flights.',
    'Bedding',
    ARRAY['Warm','Soft','Easy to Carry'],
    false
  ),
  (
    'Travel Hygiene Kit',
    'travel-hygiene-kit',
    'All-in-one kit with travel essentials for personal hygiene.',
    'The Fresh Ride Travel Hygiene Kit contains everything you need for a fresh overnight journey — a small towel, toothbrush, toothpaste, comb, and essential toiletries in a clear zip travel bag. Stay fresh wherever you go.',
    'Hygiene',
    ARRAY['Complete','Hygienic','Travel Friendly'],
    false
  ),
  (
    'Disposable Travel Slippers',
    'disposable-travel-slippers',
    'Comfortable, hygienic slippers perfect for travel and stay.',
    'Fresh Ride Disposable Travel Slippers are soft, lightweight open-toe slippers sealed in hygienic individual pouches. Perfect for use in hotels, sleeper buses, spas, and guest rooms. Use once, dispose hygienically.',
    'Comfort',
    ARRAY['Hygienic','Lightweight','Disposable'],
    false
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED VARIANTS (price=0 placeholder, is_active=false)
-- Only inserts if the product has no variants yet
-- ============================================================
INSERT INTO public.product_variants (product_id, name, price, compare_price, pack_quantity, stock, is_active, sort_order)
SELECT p.id, 'Single Unit', 0, NULL, 1, 0, false, 1
FROM public.products p
WHERE p.slug IN (
  'sleep-eye-mask',
  'disposable-foam-ear-plugs',
  'reusable-silicone-ear-plugs',
  'inflatable-neck-pillow',
  'disposable-pillow-cover',
  'compact-travel-blanket',
  'travel-hygiene-kit',
  'disposable-travel-slippers'
)
AND NOT EXISTS (
  SELECT 1 FROM public.product_variants pv WHERE pv.product_id = p.id
);

-- ============================================================
-- SEED PRODUCT IMAGES (local path, is_primary=true)
-- Only inserts if no primary image exists yet
-- ============================================================
INSERT INTO public.product_images (product_id, url, alt, sort_order, is_primary)
SELECT
  p.id,
  '/products/' || p.slug || '.jpg',
  p.name || ' - Fresh Ride Travel Accessories',
  1,
  true
FROM public.products p
WHERE p.slug IN (
  'sleep-eye-mask',
  'disposable-foam-ear-plugs',
  'reusable-silicone-ear-plugs',
  'inflatable-neck-pillow',
  'disposable-pillow-cover',
  'compact-travel-blanket',
  'travel-hygiene-kit',
  'disposable-travel-slippers'
)
AND NOT EXISTS (
  SELECT 1 FROM public.product_images pi
  WHERE pi.product_id = p.id AND pi.is_primary = true
);
