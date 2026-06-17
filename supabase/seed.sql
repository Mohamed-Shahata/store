-- ============================================================
-- SEED عربي كامل — حذف البيانات القديمة وإدراج بيانات جديدة
-- شغّله في Supabase SQL Editor
-- ============================================================

-- 0. حذف البيانات القديمة بالترتيب الصح (foreign keys)
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM discounts;
DELETE FROM orders;

-- 1. تحديث إعدادات المتجر
UPDATE store_settings SET
  store_name        = 'لومينا ستور',
  store_description = 'منتجات مميزة في الموضة والإلكترونيات وأسلوب الحياة — مختارة بعناية للمتسوق العصري.',
  whatsapp_number   = '+201001234567',
  facebook_url      = 'https://facebook.com/luminastore',
  instagram_url     = 'https://instagram.com/luminastore',
  seo_title         = 'لومينا ستور — منتجات مميزة أونلاين',
  seo_description   = 'تسوّق أفضل منتجات الموضة والإلكترونيات وأسلوب الحياة في لومينا ستور.',
  seo_keywords      = 'متجر إلكتروني، موضة، إلكترونيات، مصر، تسوق أونلاين'
WHERE id = (SELECT id FROM store_settings LIMIT 1);

INSERT INTO store_settings (
  store_name, store_description, whatsapp_number,
  facebook_url, instagram_url,
  seo_title, seo_description, seo_keywords
)
SELECT
  'لومينا ستور',
  'منتجات مميزة في الموضة والإلكترونيات وأسلوب الحياة — مختارة بعناية للمتسوق العصري.',
  '+201001234567',
  'https://facebook.com/luminastore',
  'https://instagram.com/luminastore',
  'لومينا ستور — منتجات مميزة أونلاين',
  'تسوّق أفضل منتجات الموضة والإلكترونيات وأسلوب الحياة في لومينا ستور.',
  'متجر إلكتروني، موضة، إلكترونيات، مصر، تسوق أونلاين'
WHERE NOT EXISTS (SELECT 1 FROM store_settings);

-- 2. الفئات
INSERT INTO categories (id, name, slug, description, icon) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'الموضة',          'fashion',      'ملابس وأحذية وإكسسوارات لكل الأذواق',            '👗'),
  ('c1000000-0000-0000-0000-000000000002', 'الإلكترونيات',    'electronics',  'هواتف ولابتوبات وأجهزة ذكية',                    '📱'),
  ('c1000000-0000-0000-0000-000000000003', 'المنزل والديكور', 'home-living',  'أثاث وديكور ومستلزمات المطبخ',                   '🏠'),
  ('c1000000-0000-0000-0000-000000000004', 'الجمال والعناية', 'beauty',       'روتين العناية بالبشرة والعطور ومستحضرات التجميل', '💄'),
  ('c1000000-0000-0000-0000-000000000005', 'الرياضة',         'sports',       'معدات لياقة وملابس رياضية وأدوات خارجية',         '🏋️'),
  ('c1000000-0000-0000-0000-000000000006', 'الكتب',           'books',        'أفضل الكتب التعليمية والتطوير الذاتي',            '📚');

-- 3. العروض والخصومات
INSERT INTO discounts (id, title, type, value, badge_text, active, start_date, end_date) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'تخفيضات الصيف 2025', 'percentage', 20, 'صيف',      TRUE,  NOW()-INTERVAL '1 day',   NOW()+INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000002', 'عرض خاطف',           'percentage', 30, 'فلاش',     TRUE,  NOW(),                    NOW()+INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000003', 'خصم الترحيب',        'fixed',      50, 'جديد50',   TRUE,  NOW()-INTERVAL '7 days',  NOW()+INTERVAL '60 days'),
  ('d1000000-0000-0000-0000-000000000004', 'تخفيضات نهاية الأسبوع', 'percentage', 40, 'ميجا40', TRUE, NOW(),                   NOW()+INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000005', 'تصفية المخزون',      'percentage', 15, 'تصفية',    FALSE, NOW()-INTERVAL '30 days', NOW()-INTERVAL '1 day');

-- 4. المنتجات
INSERT INTO products (id, name, slug, description, price, discount_price, stock_quantity, active, archived, featured, new_arrival, best_seller, category_id, view_count) VALUES

-- ─── الموضة ───────────────────────────────────────────────
('p100',
 'قميص أوكسفورد الكلاسيكي',
 'classic-oxford-shirt',
 'قميص أوكسفورد من القطن الفاخر بقصة مريحة، مثالي للمناسبات اليومية والرسمية على حدٍّ سواء.',
 899, 699, 45, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 312),

('p101',
 'بنطال تشينو سليم فيت',
 'slim-fit-chinos',
 'بنطال تشينو من القطن المطاطي بقصة سليم عصرية، مقاوم للتجعد ويبقيك أنيقًا طوال اليوم.',
 699, NULL, 60, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000001', 189),

('p102',
 'حقيبة جلد للرحلات القصيرة',
 'leather-weekend-bag',
 'حقيبة دافل من الجلد الطبيعي المدبوغ بالنباتات، تتسع لمستلزمات 3 أيام وتدوم لسنوات.',
 2499, 1999, 15, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 421),

('p103',
 'بليزر كتان أوفرسايز',
 'oversized-linen-blazer',
 'بليزر من كتان بلجيكي ناعم بقصة أوفرسايز مريحة، القطعة المثالية للطقس الدافئ.',
 1299, NULL, 30, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000001', 95),

('p104',
 'حذاء رياضي للجري برو',
 'running-sneakers-pro',
 'حذاء خفيف الوزن بجزء علوي من الشبك ونعل متوسط مرن، مصمم لراحة مسافات الجري الطويلة.',
 1499, 1199, 50, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000001', 678),

('p105',
 'سويتر كشمير كرو نيك',
 'cashmere-crew-neck-sweater',
 'كشمير منغولي 100٪ من الدرجة الأولى، ناعم بشكل استثنائي وينظّم درجة الحرارة بشكل طبيعي.',
 1899, NULL, 20, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 203),

-- ─── الإلكترونيات ─────────────────────────────────────────
('p200',
 'سماعات لاسلكية بإلغاء الضوضاء',
 'wireless-nc-headphones',
 'بطارية 40 ساعة وإلغاء ضوضاء هجين وجودة صوت احترافية، تُطوى بسهولة للسفر.',
 2999, 2499, 35, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 892),

('p201',
 'كيبورد جيمنج ميكانيكي',
 'mechanical-gaming-keyboard',
 'تخطيط TKL، مفاتيح قابلة للتبديل الساخن، إضاءة RGB لكل مفتاح، وN-key rollover للتنافسية.',
 1599, NULL, 40, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000002', 334),

('p202',
 'شاشة 27 بوصة 4K',
 'monitor-27-4k',
 'لوحة IPS بدقة 4K، معدل تحديث 144Hz، زمن استجابة 1ms، HDR400، وشحن USB-C بقدرة 65W.',
 7499, 6499, 12, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 1024),

('p203',
 'ساعة ذكية سيريس إكس',
 'smart-watch-series-x',
 'شاشة AMOLED دائمة التشغيل، GPS، مقياس الأكسجين، تخطيط القلب، بطارية 7 أيام، مقاومة للماء IP68.',
 3499, 2999, 28, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000002', 756),

('p204',
 'سبيكر بلوتوث محمول',
 'portable-bt-speaker',
 'صوت 360 درجة، تشغيل 24 ساعة، مقاوم للماء IPX7، يمكن إقران اثنين معًا للستيريو.',
 999, 799, 55, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000002', 445),

('p205',
 'هاب USB-C برو 4 منافذ',
 'usbc-hub-pro',
 'HDMI 4K، 3 منافذ USB-A 3.2، قارئ SD وmicroSD، شحن مرور 100W، هيكل ألومنيوم.',
 549, NULL, 80, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 287),

-- ─── المنزل والديكور ──────────────────────────────────────
('p300',
 'طقم القهوة السيراميك بور أوفر',
 'ceramic-pour-over-set',
 'قمع وإبريق من الفخار المصنوع يدويًا، مع فلتر قطني قابل لإعادة الاستخدام، يُحضّر 600 مل.',
 799, 649, 25, TRUE, FALSE, TRUE,  TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000003', 198),

('p301',
 'غطاء لحاف كتان - مقاس كينج',
 'linen-duvet-cover-king',
 'كتان فرنسي 100٪ مغسول بالحجر، يسمح بالتهوية ومضاد للحساسية ويزداد نعومةً مع كل غسيل.',
 1199, NULL, 18, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000003', 142),

('p302',
 'رف كتب موديولار خشب البلوط',
 'modular-bookshelf-oak',
 'نظام موديولار من خشب البلوط الصلب، يمكن تركيبه بحرية، كل وحدة تتحمل 25 كجم.',
 2999, 2499, 8,  TRUE, FALSE, TRUE,  FALSE, FALSE, 'c1000000-0000-0000-0000-000000000003', 312),

('p303',
 'طقم شموع صويا معطرة 3 قطع',
 'scented-soy-candle-set',
 'ثلاث روائح: أرز وفيتيفر، عود وورد، ملح البحر والخشب. مدة احتراق 50 ساعة لكل شمعة، مصنوعة يدويًا.',
 449, NULL, 60, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000003', 389),

-- ─── الجمال والعناية ──────────────────────────────────────
('p400',
 'سيروم فيتامين C للإشراق',
 'vitamin-c-brightening-serum',
 'فيتامين C مستقر بتركيز 20٪ مع حمض الفيروليك وفيتامين E. يُخفّف البقع الداكنة في 4 أسابيع.',
 699, 549, 70, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000004', 634),

('p401',
 'عطر ميدنايت عود أو دو بارفان',
 'midnight-oud-edp',
 'تركيبة شرقية دافئة. رأس: زعفران وفلفل. قلب: عود وورد. قاعدة: عنبر ومسك. 100 مل.',
 1299, NULL, 22, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000004', 512),

('p402',
 'كريم مرطب بحمض الهيالورونيك',
 'hyaluronic-acid-moisturiser',
 'مزيج من 5 أوزان جزيئية من حمض الهيالورونيك مع السيراميد. ترطيب 72 ساعة لجميع أنواع البشرة.',
 499, 399, 90, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000004', 278),

('p403',
 'مجفف شعر احترافي 2400 واط',
 'professional-hair-dryer',
 'تقنية أيونية، محرك DC بقدرة 2400W، 3 درجات حرارة و2 سرعة، مع زر هواء بارد.',
 1199, 999, 30, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000004', 367),

-- ─── الرياضة ──────────────────────────────────────────────
('p500',
 'مات يوغا بريميوم 6 مم',
 'yoga-mat-premium-6mm',
 'مطاط طبيعي بسطح مضاد للانزلاق وخطوط محاذاة مع حزام حمل. مقاس 183×61 سم.',
 549, NULL, 45, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000005', 189),

('p501',
 'طقم دمبل قابل للضبط',
 'adjustable-dumbbell-set',
 'قرص ضبط سريع، من 5 إلى 25 كجم لكل دمبل، يحل محل 15 طقمًا. مثالي لصالة المنزل.',
 3499, 2999, 10, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000005', 567),

('p502',
 'تيتس جري ضاغطة',
 'compression-running-tights',
 '78٪ بوليستر معاد تدويره و22٪ إيلاستين، مرونة رباعية الاتجاه، جيب خلفي مخفي.',
 649, 499, 55, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000005', 134),

-- ─── الكتب ────────────────────────────────────────────────
('p600',
 'العادات الذرية — جيمس كلير',
 'atomic-habits-james-clear',
 'إطار عمل مُثبَت لبناء العادات الجيدة وكسر السيئة. الأكثر مبيعًا عالميًا بأكثر من 12 مليون نسخة.',
 299, NULL, 100, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000006', 823),

('p601',
 'العمل العميق — كال نيوبورت',
 'deep-work-cal-newport',
 'قواعد للنجاح المُركَّز في عالم مشتت. ضروري لكل عامل معرفة يريد تعظيم إنتاجيته.',
 279, NULL, 80, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000006', 412),

('p602',
 'سيكولوجية المال — مورغان هاوسل',
 'psychology-of-money',
 'دروس خالدة عن الثروة والجشع والسعادة. أحد أكثر كتب المال تأثيرًا في السنوات الأخيرة.',
 289, NULL, 90, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000006', 654);

-- 5. صور المنتجات  (العمود الصح في الـ schema هو sort_order مش display_order)
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p100','https://picsum.photos/seed/shirt1/800/800',1),
('p100','https://picsum.photos/seed/shirt2/800/800',2),
('p101','https://picsum.photos/seed/chino1/800/800',1),
('p101','https://picsum.photos/seed/chino2/800/800',2),
('p102','https://picsum.photos/seed/bag001/800/800',1),
('p102','https://picsum.photos/seed/bag002/800/800',2),
('p103','https://picsum.photos/seed/blaz01/800/800',1),
('p104','https://picsum.photos/seed/sneak1/800/800',1),
('p104','https://picsum.photos/seed/sneak2/800/800',2),
('p105','https://picsum.photos/seed/sweat1/800/800',1),
('p200','https://picsum.photos/seed/headp1/800/800',1),
('p200','https://picsum.photos/seed/headp2/800/800',2),
('p201','https://picsum.photos/seed/keybd1/800/800',1),
('p202','https://picsum.photos/seed/monit1/800/800',1),
('p202','https://picsum.photos/seed/monit2/800/800',2),
('p203','https://picsum.photos/seed/watch1/800/800',1),
('p203','https://picsum.photos/seed/watch2/800/800',2),
('p204','https://picsum.photos/seed/speak1/800/800',1),
('p205','https://picsum.photos/seed/hub001/800/800',1),
('p300','https://picsum.photos/seed/coffe1/800/800',1),
('p300','https://picsum.photos/seed/coffe2/800/800',2),
('p301','https://picsum.photos/seed/duvet1/800/800',1),
('p302','https://picsum.photos/seed/shelf1/800/800',1),
('p303','https://picsum.photos/seed/candl1/800/800',1),
('p400','https://picsum.photos/seed/serum1/800/800',1),
('p400','https://picsum.photos/seed/serum2/800/800',2),
('p401','https://picsum.photos/seed/perfu1/800/800',1),
('p402','https://picsum.photos/seed/cream1/800/800',1),
('p403','https://picsum.photos/seed/dryer1/800/800',1),
('p500','https://picsum.photos/seed/yoga01/800/800',1),
('p501','https://picsum.photos/seed/dumbb1/800/800',1),
('p501','https://picsum.photos/seed/dumbb2/800/800',2),
('p502','https://picsum.photos/seed/tight1/800/800',1),
('p600','https://picsum.photos/seed/book01/800/800',1),
('p601','https://picsum.photos/seed/book02/800/800',1),
('p602','https://picsum.photos/seed/book03/800/800',1);

-- 6. أوردرات تجريبية
INSERT INTO orders (customer_name, customer_phone, customer_address, items, total_price, status) VALUES
('أحمد حسن',     '+201112345678', 'شارع التحرير، الدقي، الجيزة',
 '[{"id":"p200","name":"سماعات لاسلكية بإلغاء الضوضاء","quantity":1,"price":2499},{"id":"p104","name":"حذاء رياضي للجري برو","quantity":1,"price":1199}]',
 3698, 'sent'),

('سارة محمود',   '+201234567890', 'شارع جسر السويس، مصر الجديدة، القاهرة',
 '[{"id":"p400","name":"سيروم فيتامين C للإشراق","quantity":2,"price":549},{"id":"p401","name":"عطر ميدنايت عود","quantity":1,"price":1299}]',
 2397, 'sent'),

('محمد علي',     '+201098765432', 'شارع الهرم، فيصل، الجيزة',
 '[{"id":"p600","name":"العادات الذرية","quantity":1,"price":299},{"id":"p601","name":"العمل العميق","quantity":1,"price":279},{"id":"p602","name":"سيكولوجية المال","quantity":1,"price":289}]',
 867, 'sent'),

('نور خالد',     '+201512345678', 'شارع كورنيش النيل، المعادي، القاهرة',
 '[{"id":"p203","name":"ساعة ذكية سيريس إكس","quantity":1,"price":2999}]',
 2999, 'sent'),

('يوسف طارق',   '+201312345678', 'شارع الإسكندرية الصحراوي، برج العرب، الإسكندرية',
 '[{"id":"p302","name":"رف كتب موديولار خشب البلوط","quantity":1,"price":2499},{"id":"p303","name":"طقم شموع صويا معطرة","quantity":2,"price":449}]',
 3397, 'sent');