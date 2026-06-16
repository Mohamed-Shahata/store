-- ============================================================
-- FULL SEED: clear old data & insert fresh realistic demo data
-- Run this in Supabase SQL Editor
-- ============================================================

-- 0. Wipe old data
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM discounts;
DELETE FROM orders;

UPDATE store_settings SET
  store_name        = 'Lumina Store',
  store_description = 'Premium fashion, electronics, and lifestyle products — curated for the modern shopper.',
  whatsapp_number   = '+201001234567',
  facebook_url      = 'https://facebook.com/luminastore',
  instagram_url     = 'https://instagram.com/luminastore',
  seo_title         = 'Lumina Store — Premium Products Online',
  seo_description   = 'Shop premium fashion, electronics, and lifestyle items at Lumina Store.',
  seo_keywords      = 'online store, fashion, electronics, lifestyle, egypt'
WHERE id = (SELECT id FROM store_settings LIMIT 1);

INSERT INTO store_settings (
  store_name, store_description, whatsapp_number,
  facebook_url, instagram_url,
  seo_title, seo_description, seo_keywords
)
SELECT
  'Lumina Store',
  'Premium fashion, electronics, and lifestyle products — curated for the modern shopper.',
  '+201001234567',
  'https://facebook.com/luminastore',
  'https://instagram.com/luminastore',
  'Lumina Store — Premium Products Online',
  'Shop premium fashion, electronics, and lifestyle items at Lumina Store.',
  'online store, fashion, electronics, lifestyle, egypt'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- 1. Categories
INSERT INTO categories (id, name, slug, description, icon) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Fashion',      'fashion',      'Clothing, shoes & accessories for every style', '👗'),
  ('c1000000-0000-0000-0000-000000000002', 'Electronics',  'electronics',  'Smartphones, laptops & smart gadgets',          '📱'),
  ('c1000000-0000-0000-0000-000000000003', 'Home & Living','home-living',  'Furniture, decor & kitchen essentials',         '🏠'),
  ('c1000000-0000-0000-0000-000000000004', 'Beauty',       'beauty',       'Skincare, fragrances & cosmetics',              '💄'),
  ('c1000000-0000-0000-0000-000000000005', 'Sports',       'sports',       'Fitness gear, activewear & outdoor equipment',  '🏋️'),
  ('c1000000-0000-0000-0000-000000000006', 'Books',        'books',        'Bestsellers, education & self-development',     '📚');

-- 2. Discounts
INSERT INTO discounts (id, title, type, value, badge_text, active, start_date, end_date) VALUES
  ('d1000000-0000-0000-0000-000000000001','Summer Sale 2025','percentage',20,'SUMMER',TRUE, NOW()-INTERVAL '1 day',  NOW()+INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000002','Flash Deal',      'percentage',30,'FLASH', TRUE, NOW(),                   NOW()+INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000003','Welcome Discount','fixed',      50,'NEW50', TRUE, NOW()-INTERVAL '7 days', NOW()+INTERVAL '60 days'),
  ('d1000000-0000-0000-0000-000000000004','Weekend Mega Sale','percentage',40,'MEGA40',TRUE, NOW(),                   NOW()+INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000005','Clearance',       'percentage',15,'CLEARANCE',FALSE,NOW()-INTERVAL '30 days',NOW()-INTERVAL '1 day');

-- 3. Products
INSERT INTO products (id,name,slug,description,price,discount_price,stock_quantity,active,archived,featured,new_arrival,best_seller,category_id,view_count) VALUES
-- FASHION
('p100','Classic Oxford Shirt','classic-oxford-shirt','Premium cotton Oxford shirt with a relaxed fit, perfect for both casual and smart occasions.',899,699,45,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000001',312),
('p101','Slim Fit Chinos','slim-fit-chinos','Stretch cotton chinos with a modern slim fit. Wrinkle-resistant fabric keeps you looking sharp all day.',699,NULL,60,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000001',189),
('p102','Leather Weekend Bag','leather-weekend-bag','Full-grain vegetable-tanned leather duffle. Spacious enough for a 3-day trip, sturdy enough to last a lifetime.',2499,1999,15,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000001',421),
('p103','Oversized Linen Blazer','oversized-linen-blazer','Breathable Belgian linen blazer in an effortless oversized cut. The go-to layering piece for warm weather.',1299,NULL,30,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000001',95),
('p104','Running Sneakers Pro','running-sneakers-pro','Lightweight mesh upper with responsive foam midsole. Engineered for long-distance comfort and daily performance.',1499,1199,50,TRUE,FALSE,TRUE,TRUE,TRUE,'c1000000-0000-0000-0000-000000000001',678),
('p105','Cashmere Crew-Neck Sweater','cashmere-crew-neck-sweater','100% Grade-A Mongolian cashmere. Exceptionally soft, naturally temperature-regulating.',1899,NULL,20,TRUE,FALSE,FALSE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000001',203),
-- ELECTRONICS
('p200','Wireless NC Headphones','wireless-nc-headphones','40-hour battery, hybrid ANC, and studio-grade sound. Folds flat for easy travel.',2999,2499,35,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000002',892),
('p201','Mechanical Gaming Keyboard','mechanical-gaming-keyboard','TKL layout, hot-swappable switches, per-key RGB and N-key rollover. Built for competitive play.',1599,NULL,40,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000002',334),
('p202','27" 4K Monitor','monitor-27-4k','IPS panel, 144Hz, 1ms GTG, HDR400. Supports USB-C PD 65W.',7499,6499,12,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000002',1024),
('p203','Smart Watch Series X','smart-watch-series-x','AMOLED always-on display, GPS, SpO2, ECG, 7-day battery. IP68 rated.',3499,2999,28,TRUE,FALSE,TRUE,TRUE,TRUE,'c1000000-0000-0000-0000-000000000002',756),
('p204','Portable Bluetooth Speaker','portable-bt-speaker','360° sound, 24h playback, IPX7 waterproof. Pairs two for stereo.',999,799,55,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000002',445),
('p205','USB-C 4-Port Hub Pro','usbc-hub-pro','4K HDMI, 3× USB-A 3.2, SD/microSD, 100W pass-through. Aluminium shell.',549,NULL,80,TRUE,FALSE,FALSE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000002',287),
-- HOME & LIVING
('p300','Ceramic Pour-Over Coffee Set','ceramic-pour-over-set','Hand-thrown stoneware dripper and server. Includes reusable cotton filter. Brews 600 ml.',799,649,25,TRUE,FALSE,TRUE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000003',198),
('p301','Linen Duvet Cover — King','linen-duvet-cover-king','Stone-washed 100% French linen. Breathable, hypoallergenic, softer every wash.',1199,NULL,18,TRUE,FALSE,FALSE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000003',142),
('p302','Modular Bookshelf Oak','modular-bookshelf-oak','Solid oak modular system — stack freely. Each module holds 25 kg.',2999,2499,8,TRUE,FALSE,TRUE,FALSE,FALSE,'c1000000-0000-0000-0000-000000000003',312),
('p303','Scented Soy Candle Set ×3','scented-soy-candle-set','Cedar & Vetiver, Oud & Rose, Sea Salt & Driftwood. 50h burn each. Hand-poured.',449,NULL,60,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000003',389),
-- BEAUTY
('p400','Vitamin C Brightening Serum','vitamin-c-brightening-serum','20% stabilised Vitamin C + Ferulic Acid + Vitamin E. Fades dark spots in 4 weeks.',699,549,70,TRUE,FALSE,TRUE,TRUE,TRUE,'c1000000-0000-0000-0000-000000000004',634),
('p401','Midnight Oud Eau de Parfum','midnight-oud-edp','Warm oriental. Top: saffron & pepper. Heart: oud & rose. Base: amber & musk. 100 ml.',1299,NULL,22,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000004',512),
('p402','Hyaluronic Acid Moisturiser','hyaluronic-acid-moisturiser','5-weight HA complex + ceramides. 72h hydration. All skin types.',499,399,90,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000004',278),
('p403','Professional Hair Dryer 2400W','professional-hair-dryer','Ionic, 2400W DC motor, 3 heat + 2 speed settings, cold-shot button.',1199,999,30,TRUE,FALSE,FALSE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000004',367),
-- SPORTS
('p500','Yoga Mat Premium 6mm','yoga-mat-premium-6mm','Natural rubber, non-slip, alignment lines, carry strap. 183×61 cm.',549,NULL,45,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000005',189),
('p501','Adjustable Dumbbell Set','adjustable-dumbbell-set','Quick-lock dial, 5–25 kg per dumbbell, replaces 15 sets. Home-gym ready.',3499,2999,10,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000005',567),
('p502','Compression Running Tights','compression-running-tights','78% recycled polyester / 22% elastane. 4-way stretch, hidden back pocket.',649,499,55,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000005',134),
-- BOOKS
('p600','Atomic Habits — James Clear','atomic-habits-james-clear','Proven framework for building good habits. #1 bestseller, 12 million copies sold.',299,NULL,100,TRUE,FALSE,FALSE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000006',823),
('p601','Deep Work — Cal Newport','deep-work-cal-newport','Rules for focused success in a distracted world. Essential for knowledge workers.',279,NULL,80,TRUE,FALSE,FALSE,TRUE,FALSE,'c1000000-0000-0000-0000-000000000006',412),
('p602','The Psychology of Money','psychology-of-money','Morgan Housel on timeless lessons about wealth, greed, and happiness.',289,NULL,90,TRUE,FALSE,TRUE,FALSE,TRUE,'c1000000-0000-0000-0000-000000000006',654);

-- 4. Product images (picsum.photos)
INSERT INTO product_images (product_id, image_url, display_order) VALUES
('p100','https://picsum.photos/seed/shirt1/800/800',1),('p100','https://picsum.photos/seed/shirt2/800/800',2),
('p101','https://picsum.photos/seed/chino1/800/800',1),('p101','https://picsum.photos/seed/chino2/800/800',2),
('p102','https://picsum.photos/seed/bag001/800/800',1),('p102','https://picsum.photos/seed/bag002/800/800',2),
('p103','https://picsum.photos/seed/blaz01/800/800',1),
('p104','https://picsum.photos/seed/sneak1/800/800',1),('p104','https://picsum.photos/seed/sneak2/800/800',2),
('p105','https://picsum.photos/seed/sweat1/800/800',1),
('p200','https://picsum.photos/seed/headp1/800/800',1),('p200','https://picsum.photos/seed/headp2/800/800',2),
('p201','https://picsum.photos/seed/keybd1/800/800',1),
('p202','https://picsum.photos/seed/monit1/800/800',1),('p202','https://picsum.photos/seed/monit2/800/800',2),
('p203','https://picsum.photos/seed/watch1/800/800',1),('p203','https://picsum.photos/seed/watch2/800/800',2),
('p204','https://picsum.photos/seed/speak1/800/800',1),
('p205','https://picsum.photos/seed/hub001/800/800',1),
('p300','https://picsum.photos/seed/coffe1/800/800',1),('p300','https://picsum.photos/seed/coffe2/800/800',2),
('p301','https://picsum.photos/seed/duvet1/800/800',1),
('p302','https://picsum.photos/seed/shelf1/800/800',1),
('p303','https://picsum.photos/seed/candl1/800/800',1),
('p400','https://picsum.photos/seed/serum1/800/800',1),('p400','https://picsum.photos/seed/serum2/800/800',2),
('p401','https://picsum.photos/seed/perfu1/800/800',1),
('p402','https://picsum.photos/seed/cream1/800/800',1),
('p403','https://picsum.photos/seed/dryer1/800/800',1),
('p500','https://picsum.photos/seed/yoga01/800/800',1),
('p501','https://picsum.photos/seed/dumbb1/800/800',1),('p501','https://picsum.photos/seed/dumbb2/800/800',2),
('p502','https://picsum.photos/seed/tight1/800/800',1),
('p600','https://picsum.photos/seed/book01/800/800',1),
('p601','https://picsum.photos/seed/book02/800/800',1),
('p602','https://picsum.photos/seed/book03/800/800',1);

-- 5. Sample orders
INSERT INTO orders (customer_name,customer_phone,items,total_price,status) VALUES
('Ahmed Hassan','+201112345678','[{"id":"p200","name":"Wireless NC Headphones","quantity":1,"price":2499},{"id":"p104","name":"Running Sneakers Pro","quantity":1,"price":1199}]',3698,'sent'),
('Sara Mahmoud','+201234567890','[{"id":"p400","name":"Vitamin C Brightening Serum","quantity":2,"price":549},{"id":"p401","name":"Midnight Oud Eau de Parfum","quantity":1,"price":1299}]',2397,'sent'),
('Mohamed Ali','+201098765432','[{"id":"p600","name":"Atomic Habits","quantity":1,"price":299},{"id":"p601","name":"Deep Work","quantity":1,"price":279},{"id":"p602","name":"The Psychology of Money","quantity":1,"price":289}]',867,'sent'),
('Nour Khaled','+201512345678','[{"id":"p203","name":"Smart Watch Series X","quantity":1,"price":2999}]',2999,'sent'),
('Youssef Tarek','+201312345678','[{"id":"p302","name":"Modular Bookshelf Oak","quantity":1,"price":2499},{"id":"p303","name":"Scented Soy Candle Set","quantity":2,"price":449}]',3397,'sent');

-- 6. Add extra admins (CREATE users in Auth dashboard first, then uncomment):
-- INSERT INTO admins (id, email) VALUES
--   ('REPLACE-WITH-UUID-1', 'manager@luminastore.com'),
--   ('REPLACE-WITH-UUID-2', 'support@luminastore.com')
-- ON CONFLICT DO NOTHING;
