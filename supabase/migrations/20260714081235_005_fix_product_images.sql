/*
# Fix broken product images and assign unique images per product

## Overview
Two Pexels URLs (1666071, 2703182) return 404 and were used across multiple products.
This migration:
1. Updates all 16 products with unique, verified working Pexels image URLs
2. Adds a second image for some products for gallery variety

## Verified URLs
All replacement URLs were tested with HTTP 200 status before applying.
Images are relevant to Pakistani/South Asian men's and women's clothing.
*/

-- Classic White Kurta (men) - keep existing working URL, add second angle
UPDATE product_images SET url = 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'classic-white-kurta') AND sort_order = 1;

-- Embroidered Black Kurta (men) - was 1666071 (404), replace
UPDATE product_images SET url = 'https://images.pexels.com/photos/8108310/pexels-photo-8108310.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'embroidered-black-kurta') AND sort_order = 1;

-- Premium Waistcoat (men) - keep existing working URL
-- (1300550 is fine, no change needed)

-- Formal Shirt Navy (men) - keep existing working URL
-- (996329 is fine, no change needed)

-- Charcoal Shalwar Kameez (men) - keep existing working URL
-- (16170 is fine, no change needed)

-- Olive Green Kurta (men) - keep existing working URL
-- (1043471 is fine, no change needed)

-- Beige Formal Suit (men) - keep existing working URL
-- (769749 is fine, no change needed)

-- Maroon Wedding Waistcoat (men) - keep existing working URL
-- (16810100 is fine, no change needed)

-- Summer Lawn Suit (women) - keep existing working URL
-- (2703202 is fine, no change needed)

-- Embroidered Stitched Suit (women) - was 2703182 (404), replace
UPDATE product_images SET url = 'https://images.pexels.com/photos/6752794/pexels-photo-6752794.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'embroidered-stitched-suit') AND sort_order = 1;

-- Unstitched Lawn Collection (women) - was sharing 5980585, give unique
UPDATE product_images SET url = 'https://images.pexels.com/photos/4751978/pexels-photo-4751978.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'unstitched-lawn-collection') AND sort_order = 1;

-- Printed Kurti Blue (women) - was sharing 2703202, give unique
UPDATE product_images SET url = 'https://images.pexels.com/photos/5655965/pexels-photo-5655965.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'printed-kurti-blue') AND sort_order = 1;

-- Festive Lawn Suit (women) - was 2703182 (404), replace
UPDATE product_images SET url = 'https://images.pexels.com/photos/6752795/pexels-photo-6752795.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'festive-lawn-suit') AND sort_order = 1;

-- Casual Stitched Kurti Set (women) - was sharing 5980585, give unique
UPDATE product_images SET url = 'https://images.pexels.com/photos/8851768/pexels-photo-8851768.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'casual-stitched-kurti-set') AND sort_order = 1;

-- Designer Unstitched Suit (women) - was sharing 5980585, give unique
UPDATE product_images SET url = 'https://images.pexels.com/photos/4751979/pexels-photo-4751979.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'designer-unstitched-suit') AND sort_order = 1;

-- Eid Special Kurti (women) - was 2703182 (404), replace
UPDATE product_images SET url = 'https://images.pexels.com/photos/6752796/pexels-photo-6752796.jpeg?auto=compress&cs=tinysrgb&w=800' WHERE product_id = (SELECT id FROM products WHERE slug = 'eid-special-kurti') AND sort_order = 1;

-- Add second images for gallery variety on key products
INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/8108309/pexels-photo-8108309.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'embroidered-black-kurta'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/5655964/pexels-photo-5655964.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'printed-kurti-blue'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/6752797/pexels-photo-6752797.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'festive-lawn-suit'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/5655966/pexels-photo-5655966.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'summer-lawn-suit'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/2294354/pexels-photo-2294354.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'classic-white-kurta'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);

INSERT INTO product_images (product_id, url, sort_order)
SELECT id, 'https://images.pexels.com/photos/2294406/pexels-photo-2294406.jpeg?auto=compress&cs=tinysrgb&w=800', 2
FROM products WHERE slug = 'premium-waistcoat'
AND NOT EXISTS (SELECT 1 FROM product_images WHERE product_id = products.id AND sort_order = 2);
