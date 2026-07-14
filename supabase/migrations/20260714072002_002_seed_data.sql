/*
# Seed Data — Categories, Products, Variants, Images, Settings

## Overview
Populates the database with initial seed data for a Pakistani men's & women's clothing brand.
- Top-level categories: Men, Women
- Subcategories for each
- 16 sample products with variants and images
- Default store settings and promo codes

## Tables Populated
- categories, products, product_variants, product_images, settings, promo_codes
*/

-- ============ CATEGORIES ============
INSERT INTO categories (name, slug, gender, sort_order) VALUES
  ('Men', 'men', 'men', 1),
  ('Women', 'women', 'women', 2)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Kurta', 'men-kurta', 'men', c.id, 1 FROM categories c WHERE c.slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Waistcoat', 'men-waistcoat', 'men', c.id, 2 FROM categories c WHERE c.slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Formal', 'men-formal', 'men', c.id, 3 FROM categories c WHERE c.slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Shalwar Kameez', 'men-shalwar-kameez', 'men', c.id, 4 FROM categories c WHERE c.slug = 'men'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Lawn', 'women-lawn', 'women', c.id, 1 FROM categories c WHERE c.slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Stitched', 'women-stitched', 'women', c.id, 2 FROM categories c WHERE c.slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Unstitched', 'women-unstitched', 'women', c.id, 3 FROM categories c WHERE c.slug = 'women'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug, gender, parent_id, sort_order)
SELECT 'Kurtis', 'women-kurtis', 'women', c.id, 4 FROM categories c WHERE c.slug = 'women'
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCTS ============
INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Classic White Kurta', 'classic-white-kurta', 'Timeless elegance in this pristine white kurta, crafted from premium cotton for everyday comfort and style.', 'Premium Cotton', 'Machine wash cold, hang dry', '3-5 business days', c.id, 4500, 3800, 'MK-001', true, true, 1
FROM categories c WHERE c.slug = 'men-kurta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Embroidered Black Kurta', 'embroidered-black-kurta', 'Sophisticated black kurta with subtle thread embroidery on the collar and cuffs.', 'Cotton Blend', 'Dry clean recommended', '3-5 business days', c.id, 6500, null, 'MK-002', true, false, 2
FROM categories c WHERE c.slug = 'men-kurta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Premium Waistcoat', 'premium-waistcoat', 'Elevate your look with this tailored waistcoat, perfect for formal occasions and weddings.', 'Wool Blend', 'Dry clean only', '5-7 business days', c.id, 8500, 7200, 'MW-001', false, true, 1
FROM categories c WHERE c.slug = 'men-waistcoat'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Formal Shirt Navy', 'formal-shirt-navy', 'Crisp navy formal shirt in breathable fabric, designed for a sharp office look.', 'Cotton Poly Blend', 'Machine wash cold, iron medium', '2-4 business days', c.id, 3500, null, 'MF-001', false, false, 1
FROM categories c WHERE c.slug = 'men-formal'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Charcoal Shalwar Kameez', 'charcoal-shalwar-kameez', 'A modern take on the classic shalwar kameez in a versatile charcoal shade.', 'Linen Cotton', 'Machine wash cold, hang dry', '3-5 business days', c.id, 5500, 4900, 'MS-001', true, false, 1
FROM categories c WHERE c.slug = 'men-shalwar-kameez'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Olive Green Kurta', 'olive-green-kurta', 'Contemporary olive green kurta with a relaxed fit, perfect for casual gatherings.', 'Cotton', 'Machine wash cold', '3-5 business days', c.id, 4200, null, 'MK-003', false, true, 3
FROM categories c WHERE c.slug = 'men-kurta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Beige Formal Suit', 'beige-formal-suit', 'Two-piece beige formal suit with a slim fit silhouette for the modern gentleman.', 'Poly Wool', 'Dry clean only', '5-7 business days', c.id, 12500, 10500, 'MF-002', true, false, 2
FROM categories c WHERE c.slug = 'men-formal'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Maroon Wedding Waistcoat', 'maroon-wedding-waistcoat', 'Statement maroon waistcoat with intricate button detailing for wedding season.', 'Jacquard', 'Dry clean only', '5-7 business days', c.id, 9500, null, 'MW-002', false, false, 2
FROM categories c WHERE c.slug = 'men-waistcoat'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Summer Lawn Suit', 'summer-lawn-suit', 'Breathable 3-piece lawn suit with vibrant floral print, perfect for the Pakistani summer.', 'Lawn Cotton', 'Machine wash cold, hang dry', '3-5 business days', c.id, 5500, 4500, 'WL-001', true, true, 1
FROM categories c WHERE c.slug = 'women-lawn'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Embroidered Stitched Suit', 'embroidered-stitched-suit', 'Elegant stitched suit with delicate embroidery on the neckline and sleeves.', 'Cotton Silk', 'Dry clean recommended', '5-7 business days', c.id, 7500, null, 'WS-001', true, false, 1
FROM categories c WHERE c.slug = 'women-stitched'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Unstitched Lawn Collection', 'unstitched-lawn-collection', 'Premium unstitched lawn fabric with dupatta, ready to be tailored to your style.', 'Lawn', 'Machine wash cold', '2-4 business days', c.id, 3500, 2900, 'WU-001', false, true, 1
FROM categories c WHERE c.slug = 'women-unstitched'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Printed Kurti Blue', 'printed-kurti-blue', 'Versatile blue kurti with all-over print, suitable for both casual and semi-formal wear.', 'Viscose', 'Machine wash cold, hang dry', '2-4 business days', c.id, 2800, null, 'WK-001', true, true, 1
FROM categories c WHERE c.slug = 'women-kurtis'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Festive Lawn Suit', 'festive-lawn-suit', 'Rich festive lawn suit with gold foil prints and matching dupatta for Eid celebrations.', 'Lawn Cotton', 'Dry clean recommended', '5-7 business days', c.id, 8900, 7500, 'WL-002', true, false, 2
FROM categories c WHERE c.slug = 'women-lawn'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Casual Stitched Kurti Set', 'casual-stitched-kurti-set', 'Comfortable everyday kurti set with straight pants and a lightweight dupatta.', 'Cotton', 'Machine wash cold', '2-4 business days', c.id, 4500, null, 'WS-002', false, true, 2
FROM categories c WHERE c.slug = 'women-stitched'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Designer Unstitched Suit', 'designer-unstitched-suit', 'Luxurious unstitched suit piece with embroidered border and chiffon dupatta.', 'Chiffon', 'Dry clean only', '5-7 business days', c.id, 6500, 5500, 'WU-002', true, false, 2
FROM categories c WHERE c.slug = 'women-unstitched'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, description, fabric, care_instructions, delivery_time, category_id, base_price, discount_price, sku, is_featured, is_bestseller, sort_order)
SELECT 'Eid Special Kurti', 'eid-special-kurti', 'Festive kurti with intricate detailing and rich colors, designed for Eid celebrations.', 'Silk Cotton', 'Dry clean recommended', '5-7 business days', c.id, 5200, 4400, 'WK-002', false, true, 2
FROM categories c WHERE c.slug = 'women-kurtis'
ON CONFLICT (slug) DO NOTHING;

-- ============ PRODUCT VARIANTS ============
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'White', p.sku || '-S-WHT', 10 FROM products p WHERE p.slug = 'classic-white-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'White', p.sku || '-M-WHT', 15 FROM products p WHERE p.slug = 'classic-white-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'White', p.sku || '-L-WHT', 12 FROM products p WHERE p.slug = 'classic-white-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'White', p.sku || '-XL-WHT', 8 FROM products p WHERE p.slug = 'classic-white-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Black', p.sku || '-M-BLK', 12 FROM products p WHERE p.slug = 'embroidered-black-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Black', p.sku || '-L-BLK', 10 FROM products p WHERE p.slug = 'embroidered-black-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Black', p.sku || '-XL-BLK', 6 FROM products p WHERE p.slug = 'embroidered-black-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Brown', p.sku || '-M-BRN', 8 FROM products p WHERE p.slug = 'premium-waistcoat'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Brown', p.sku || '-L-BRN', 6 FROM products p WHERE p.slug = 'premium-waistcoat'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Brown', p.sku || '-XL-BRN', 4 FROM products p WHERE p.slug = 'premium-waistcoat'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Navy', p.sku || '-M-NAV', 20 FROM products p WHERE p.slug = 'formal-shirt-navy'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Navy', p.sku || '-L-NAV', 15 FROM products p WHERE p.slug = 'formal-shirt-navy'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Navy', p.sku || '-XL-NAV', 10 FROM products p WHERE p.slug = 'formal-shirt-navy'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Charcoal', p.sku || '-M-CHR', 10 FROM products p WHERE p.slug = 'charcoal-shalwar-kameez'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Charcoal', p.sku || '-L-CHR', 12 FROM products p WHERE p.slug = 'charcoal-shalwar-kameez'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Charcoal', p.sku || '-XL-CHR', 8 FROM products p WHERE p.slug = 'charcoal-shalwar-kameez'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Olive', p.sku || '-S-OLV', 8 FROM products p WHERE p.slug = 'olive-green-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Olive', p.sku || '-M-OLV', 12 FROM products p WHERE p.slug = 'olive-green-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Olive', p.sku || '-L-OLV', 10 FROM products p WHERE p.slug = 'olive-green-kurta'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Olive', p.sku || '-XL-OLV', 5 FROM products p WHERE p.slug = 'olive-green-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Beige', p.sku || '-M-BGE', 5 FROM products p WHERE p.slug = 'beige-formal-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Beige', p.sku || '-L-BGE', 5 FROM products p WHERE p.slug = 'beige-formal-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Beige', p.sku || '-XL-BGE', 3 FROM products p WHERE p.slug = 'beige-formal-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Maroon', p.sku || '-M-MRN', 6 FROM products p WHERE p.slug = 'maroon-wedding-waistcoat'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Maroon', p.sku || '-L-MRN', 5 FROM products p WHERE p.slug = 'maroon-wedding-waistcoat'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Maroon', p.sku || '-XL-MRN', 3 FROM products p WHERE p.slug = 'maroon-wedding-waistcoat'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Floral', p.sku || '-S-FLR', 12 FROM products p WHERE p.slug = 'summer-lawn-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Floral', p.sku || '-M-FLR', 15 FROM products p WHERE p.slug = 'summer-lawn-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Floral', p.sku || '-L-FLR', 10 FROM products p WHERE p.slug = 'summer-lawn-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Floral', p.sku || '-XL-FLR', 6 FROM products p WHERE p.slug = 'summer-lawn-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Cream', p.sku || '-S-CRM', 8 FROM products p WHERE p.slug = 'embroidered-stitched-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Cream', p.sku || '-M-CRM', 10 FROM products p WHERE p.slug = 'embroidered-stitched-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Cream', p.sku || '-L-CRM', 8 FROM products p WHERE p.slug = 'embroidered-stitched-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'Free Size', 'Multi', p.sku || '-FS-MLT', 25 FROM products p WHERE p.slug = 'unstitched-lawn-collection'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Blue', p.sku || '-S-BLU', 15 FROM products p WHERE p.slug = 'printed-kurti-blue'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Blue', p.sku || '-M-BLU', 20 FROM products p WHERE p.slug = 'printed-kurti-blue'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Blue', p.sku || '-L-BLU', 12 FROM products p WHERE p.slug = 'printed-kurti-blue'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'XL', 'Blue', p.sku || '-XL-BLU', 8 FROM products p WHERE p.slug = 'printed-kurti-blue'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Gold', p.sku || '-S-GLD', 8 FROM products p WHERE p.slug = 'festive-lawn-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Gold', p.sku || '-M-GLD', 10 FROM products p WHERE p.slug = 'festive-lawn-suit'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Gold', p.sku || '-L-GLD', 6 FROM products p WHERE p.slug = 'festive-lawn-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Peach', p.sku || '-S-PCH', 12 FROM products p WHERE p.slug = 'casual-stitched-kurti-set'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Peach', p.sku || '-M-PCH', 15 FROM products p WHERE p.slug = 'casual-stitched-kurti-set'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Peach', p.sku || '-L-PCH', 10 FROM products p WHERE p.slug = 'casual-stitched-kurti-set'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'Free Size', 'Teal', p.sku || '-FS-TEAL', 15 FROM products p WHERE p.slug = 'designer-unstitched-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'S', 'Maroon', p.sku || '-S-MRN', 10 FROM products p WHERE p.slug = 'eid-special-kurti'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'M', 'Maroon', p.sku || '-M-MRN', 12 FROM products p WHERE p.slug = 'eid-special-kurti'
ON CONFLICT DO NOTHING;
INSERT INTO product_variants (product_id, size, color, sku, stock_qty)
SELECT p.id, 'L', 'Maroon', p.sku || '-L-MRN', 8 FROM products p WHERE p.slug = 'eid-special-kurti'
ON CONFLICT DO NOTHING;

-- ============ PRODUCT IMAGES ============
INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'classic-white-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/1666071/pexels-photo-1666071.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'embroidered-black-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'premium-waistcoat'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'formal-shirt-navy'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/16170/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'charcoal-shalwar-kameez'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'olive-green-kurta'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/769749/pexels-photo-769749.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'beige-formal-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/16810100/pexels-photo-16810100.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'maroon-wedding-waistcoat'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'summer-lawn-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/2703182/pexels-photo-2703182.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'embroidered-stitched-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/5980585/pexels-photo-5980585.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'unstitched-lawn-collection'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'printed-kurti-blue'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/2703182/pexels-photo-2703182.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'festive-lawn-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/5980585/pexels-photo-5980585.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'casual-stitched-kurti-set'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/5980585/pexels-photo-5980585.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'designer-unstitched-suit'
ON CONFLICT DO NOTHING;

INSERT INTO product_images (product_id, url, sort_order)
SELECT p.id, 'https://images.pexels.com/photos/2703182/pexels-photo-2703182.jpeg?auto=compress&cs=tinysrgb&w=800', 1
FROM products p WHERE p.slug = 'eid-special-kurti'
ON CONFLICT DO NOTHING;

-- ============ SETTINGS ============
INSERT INTO settings (key, value) VALUES
  ('store_info', '{"name": "RangJa", "tagline": "Premium Pakistani Fashion", "whatsapp_number": "+923001234567", "email": "info@rangja.pk", "phone": "+92 300 1234567", "address": "Lahore, Pakistan", "instagram": "https://instagram.com", "facebook": "https://facebook.com"}'),
  ('shipping', '{"flat_rate": 200, "free_over_threshold": 5000, "cod_fee": 100, "per_city_rates": {}}'),
  ('currency', '{"code": "PKR", "symbol": "Rs"}')
ON CONFLICT (key) DO NOTHING;

-- ============ PROMO CODES ============
INSERT INTO promo_codes (code, description, type, value, min_order, expiry_date, usage_limit, is_active)
VALUES
  ('WELCOME10', '10% off your first order', 'percentage', 10, 0, '2026-12-31', 1000, true),
  ('FLAT500', 'Rs 500 off orders above Rs 5000', 'flat', 500, 5000, '2026-12-31', 500, true),
  ('EID15', '15% off for Eid collection', 'percentage', 15, 2000, '2026-12-31', 2000, true)
ON CONFLICT (code) DO NOTHING;
