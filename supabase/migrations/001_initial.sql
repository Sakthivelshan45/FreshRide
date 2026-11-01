-- ============================================================
-- Butterfly Fresh Ride — Supabase Database Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT VARIANTS
-- ============================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),
  pack_quantity INTEGER NOT NULL DEFAULT 1,
  stock INTEGER NOT NULL DEFAULT 0,
  sku TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  payment_method TEXT NOT NULL DEFAULT 'razorpay'
    CHECK (payment_method IN ('razorpay','cod')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal NUMERIC(10,2) NOT NULL,
  discount NUMERIC(10,2) DEFAULT 0,
  shipping NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  notes TEXT,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id),
  variant_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  razorpay_signature TEXT,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','refunded')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL DEFAULT 'percent' CHECK (type IN ('percent','fixed')),
  value NUMERIC(10,2) NOT NULL,
  min_order NUMERIC(10,2),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT TRUE,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FAQS
-- ============================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUSINESS ENQUIRIES
-- ============================================================
CREATE TABLE IF NOT EXISTS business_enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT NOT NULL,
  quantity TEXT NOT NULL,
  location TEXT NOT NULL,
  requirements TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','quoted','converted','closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Addresses
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow order creation" ON orders FOR INSERT WITH CHECK (true);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow payment creation" ON payments FOR INSERT WITH CHECK (true);

-- Order items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow order items creation" ON order_items FOR INSERT WITH CHECK (true);

-- Public read for products, faqs, testimonials
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public read images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public read FAQs" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read testimonials" ON testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow enquiry creation" ON business_enquiries FOR INSERT WITH CHECK (true);

-- Admin full access
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admin full access enquiries" ON business_enquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed product
INSERT INTO products (id, name, slug, description, short_description, is_active) VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'Butterfly Fresh Ride Disposable Travel Bedding Kit',
  'fresh-ride-kit',
  'The Butterfly Fresh Ride disposable travel bedding kit is your complete all-in-one bedding solution for overnight journeys. Designed for convenience and hygiene, each kit includes a soft bedsheet, pillow cover and blanket — everything you need for a fresh, comfortable night of rest wherever you travel.',
  'Complete 3-piece disposable travel bedding kit — bedsheet, pillow cover & blanket.',
  TRUE
) ON CONFLICT (slug) DO NOTHING;

-- Seed variants
INSERT INTO product_variants (product_id, name, price, compare_price, pack_quantity, stock, is_active, sort_order) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Single Kit',       149,    NULL, 1,  100, TRUE, 1),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Pack of 5',        649,    745,  5,  80,  TRUE, 2),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Pack of 10',       1199,   1490, 10, 60,  TRUE, 3),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Bulk Pack (25)',   2749,   3725, 25, 40,  TRUE, 4)
ON CONFLICT DO NOTHING;

-- Seed FAQs
INSERT INTO faqs (question, answer, sort_order, is_active) VALUES
  ('What is a Butterfly Fresh Ride disposable travel bedding kit?', 'A Butterfly Fresh Ride kit is a complete 3-piece disposable bedding set consisting of a bedsheet, a pillow cover and a blanket. It is designed for single use during overnight travel on sleeper buses, trains, at hotels, or in other accommodation settings.', 1, TRUE),
  ('How many pieces are included in each kit?', 'Every kit includes three pieces: one bedsheet, one pillow cover, and one blanket. Everything you need for a comfortable night is packed in a single compact package.', 2, TRUE),
  ('What material is the bedding made from?', 'The Fresh Ride kit is made from a soft, breathable disposable fabric. Specific material details are available on the product page and can be confirmed with our team.', 3, TRUE),
  ('Is it suitable for hotels and hospitals?', 'Yes. The Butterfly Fresh Ride disposable bedding kit is suitable for hotels, guest houses, hospitals, clinics, spas and other professional accommodation environments that require quick bed preparation.', 4, TRUE),
  ('How should I dispose of the kit after use?', 'After use, fold the bedding and dispose of it in accordance with your local waste management requirements. The kit is intended for single use only and should not be re-used.', 5, TRUE),
  ('Do you offer bulk orders for businesses?', 'Yes. We supply in bulk to sleeper bus operators, hotels, hospitals, travel companies and distributors. Please use the business enquiry form or contact us directly for a customised quotation.', 6, TRUE),
  ('What sizes are available?', 'Size information is available on the product detail page. Please contact us if you require specific dimensions for your application.', 7, TRUE),
  ('What are the delivery charges?', 'Delivery is free on orders above ₹999. A standard delivery charge applies to orders below this threshold. Charges are calculated at checkout based on your delivery location.', 8, TRUE),
  ('What is the return policy?', 'Due to the hygiene nature of the product, opened kits cannot be returned. Unopened, sealed packs may be returned within 7 days of delivery. Please refer to our Returns & Refund Policy for full details.', 9, TRUE)
ON CONFLICT DO NOTHING;

-- Seed demo testimonials
INSERT INTO testimonials (name, role, content, rating, is_active, is_demo) VALUES
  ('Rajesh Kumar', 'Fleet Manager, Sunrise Travels', 'We have been supplying Fresh Ride kits to all our sleeper buses for the past three months. Passengers love the clean, fresh bedding on every journey. It has simplified our operations enormously.', 5, TRUE, TRUE),
  ('Priya Nair', 'Hotel Operations Head', 'Fresh Ride has transformed our guest room turnaround. The disposable bedding is hygienic, easy to manage and our guests appreciate the fresh, sealed presentation every time.', 5, TRUE, TRUE),
  ('Arjun Mehta', 'Frequent Traveller', 'I never travel on overnight buses without my Fresh Ride kit now. The quality is surprisingly good for a disposable product and the pack is so compact. Highly recommended!', 4, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Seed coupon
INSERT INTO coupons (code, type, value, min_order, is_active) VALUES
  ('FRESH10', 'percent', 10, 500, TRUE),
  ('WELCOME', 'fixed', 50, 300, TRUE)
ON CONFLICT (code) DO NOTHING;
