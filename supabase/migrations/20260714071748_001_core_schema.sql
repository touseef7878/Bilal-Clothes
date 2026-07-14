/*
# Core E-Commerce Schema — Pakistani Clothing Brand

## Overview
Creates the complete database schema for a single-seller Pakistani men's & women's
clothing e-commerce platform. Includes product catalog with variants, cart, orders
with a professional status workflow, customer addresses, promo codes, reviews,
wishlist, and admin-managed settings.

## New Tables
1. **profiles** — extends auth.users with name, phone, role (customer/admin/staff)
2. **addresses** — saved shipping addresses with Pakistan-specific fields
3. **categories** — hierarchical (parent_id) with gender (men/women/unisex)
4. **products** — catalog items with base_price, discount_price, fabric, status
5. **product_variants** — size/color combinations with individual stock
6. **product_images** — multiple images per product, drag-reorder via sort_order
7. **carts** — per-user or per-session shopping carts
8. **cart_items** — items in a cart, linked to a specific variant
9. **orders** — orders with status workflow, payment method/status enums
10. **order_items** — snapshot of items at purchase time
11. **promo_codes** — discount codes (% , flat, min order, expiry, usage limits)
12. **reviews** — product reviews with rating 1-5, optional images
13. **wishlist** — saved products per user
14. **settings** — key-value store for store config (shipping rates, store info)

## Enums
- order_status: placed, payment_check, confirmed, packed, shipped, out_for_delivery, delivered, returned, cancelled
- payment_method: cod, bank_transfer, jazzcash, easypaisa, card
- payment_status: pending, paid, failed, refunded
- product_status: active, draft, archived
- user_role: customer, admin, staff

## Security (RLS)
- **Public read** on categories, products, product_variants, product_images, active promo_codes, approved reviews, settings.
- **Customer-scoped** on addresses, carts, cart_items, orders, order_items, wishlist.
- All tables have RLS enabled.
*/

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('placed', 'payment_check', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('cod', 'bank_transfer', 'jazzcash', 'easypaisa', 'card');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'admin', 'staff');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'customer',
  is_flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ ADDRESSES ============
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  recipient_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  area text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addresses_select_own" ON addresses;
CREATE POLICY "addresses_select_own" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_insert_own" ON addresses;
CREATE POLICY "addresses_insert_own" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_update_own" ON addresses;
CREATE POLICY "addresses_update_own" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addresses_delete_own" ON addresses;
CREATE POLICY "addresses_delete_own" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  gender text NOT NULL DEFAULT 'unisex',
  parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_read_public" ON categories;
CREATE POLICY "categories_read_public" ON categories FOR SELECT
  TO anon, authenticated USING (true);

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  fabric text,
  care_instructions text,
  delivery_time text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  base_price numeric(10,2) NOT NULL DEFAULT 0,
  discount_price numeric(10,2),
  sku text,
  status product_status NOT NULL DEFAULT 'active',
  is_featured boolean NOT NULL DEFAULT false,
  is_bestseller boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_read_public" ON products;
CREATE POLICY "products_read_public" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- ============ PRODUCT VARIANTS ============
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text,
  color text,
  sku text,
  stock_qty int NOT NULL DEFAULT 0,
  price_override numeric(10,2),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "variants_read_public" ON product_variants;
CREATE POLICY "variants_read_public" ON product_variants FOR SELECT
  TO anon, authenticated USING (true);

-- ============ PRODUCT IMAGES ============
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "images_read_public" ON product_images;
CREATE POLICY "images_read_public" ON product_images FOR SELECT
  TO anon, authenticated USING (true);

-- ============ CARTS ============
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "carts_select_own" ON carts;
CREATE POLICY "carts_select_own" ON carts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_insert_own" ON carts;
CREATE POLICY "carts_insert_own" ON carts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_update_own" ON carts;
CREATE POLICY "carts_update_own" ON carts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "carts_delete_own" ON carts;
CREATE POLICY "carts_delete_own" ON carts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ CART ITEMS ============
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cart_items_select_own" ON cart_items;
CREATE POLICY "cart_items_select_own" ON cart_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_insert_own" ON cart_items;
CREATE POLICY "cart_items_insert_own" ON cart_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_update_own" ON cart_items;
CREATE POLICY "cart_items_update_own" ON cart_items FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "cart_items_delete_own" ON cart_items;
CREATE POLICY "cart_items_delete_own" ON cart_items FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
  );

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_email text,
  guest_phone text,
  guest_name text,
  status order_status NOT NULL DEFAULT 'placed',
  payment_method payment_method NOT NULL DEFAULT 'cod',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  shipping_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  promo_code text,
  shipping_address jsonb,
  courier_tracking_id text,
  payment_proof_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_own" ON orders;
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "orders_insert_own" ON orders;
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_info text,
  quantity int NOT NULL DEFAULT 1,
  price_at_purchase numeric(10,2) NOT NULL DEFAULT 0,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
CREATE POLICY "order_items_select_own" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- ============ PROMO CODES ============
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text,
  type text NOT NULL DEFAULT 'percentage',
  value numeric(10,2) NOT NULL DEFAULT 0,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  max_discount numeric(10,2),
  expiry_date timestamptz,
  usage_limit int,
  usage_count int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "promo_read_public" ON promo_codes;
CREATE POLICY "promo_read_public" ON promo_codes FOR SELECT
  TO anon, authenticated USING (is_active = true);

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  comment text,
  images text[],
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_read_public" ON reviews;
CREATE POLICY "reviews_read_public" ON reviews FOR SELECT
  TO anon, authenticated USING (is_approved = true);

DROP POLICY IF EXISTS "reviews_insert_own" ON reviews;
CREATE POLICY "reviews_insert_own" ON reviews FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ WISHLIST ============
CREATE TABLE IF NOT EXISTS wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wishlist_select_own" ON wishlist;
CREATE POLICY "wishlist_select_own" ON wishlist FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_insert_own" ON wishlist;
CREATE POLICY "wishlist_insert_own" ON wishlist FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wishlist_delete_own" ON wishlist;
CREATE POLICY "wishlist_delete_own" ON wishlist FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_public" ON settings;
CREATE POLICY "settings_read_public" ON settings FOR SELECT
  TO anon, authenticated USING (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- ============ TRIGGER: auto-create profile on signup ============
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
