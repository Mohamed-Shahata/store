-- ============================================================
-- SEED عربي كامل — لومينا ستور
-- شغّله في Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 0. تأكيد حذف كل البيانات القديمة (بالترتيب الصح للـ FK)
-- ============================================================
DELETE FROM product_images;
DELETE FROM orders;
DELETE FROM products;
DELETE FROM categories;
DELETE FROM discounts;
DELETE FROM store_settings;

-- حذف أكونت الأدمن القديم لو موجود
DELETE FROM auth.users WHERE email = 'admin@luminastore.com';

-- ============================================================
-- 1. إنشاء حساب الأدمن
-- ============================================================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@luminastore.com',
  crypt('Admin@12345', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"],"role":"admin"}',
  '{"name":"Super Admin","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Register the seeded Auth user as an application admin.
INSERT INTO admins (id, email, is_super_admin)
SELECT id, email, TRUE
FROM auth.users
WHERE email = 'admin@luminastore.com'
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  is_super_admin = TRUE;

-- ============================================================
-- 2. إعدادات المتجر
-- ============================================================
INSERT INTO store_settings (
  store_name, store_description, whatsapp_number,
  facebook_url, instagram_url,
  seo_title, seo_description, seo_keywords
) VALUES (
  'لومينا ستور',
  'منتجات مميزة في الموضة والإلكترونيات وأسلوب الحياة — مختارة بعناية للمتسوق العصري.',
  '+201001234567',
  'https://facebook.com/luminastore',
  'https://instagram.com/luminastore',
  'لومينا ستور — منتجات مميزة أونلاين',
  'تسوّق أفضل منتجات الموضة والإلكترونيات وأسلوب الحياة في لومينا ستور.',
  'متجر إلكتروني، موضة، إلكترونيات، مصر، تسوق أونلاين'
);

-- ============================================================
-- 3. الفئات
-- ============================================================
INSERT INTO categories (id, name, slug, description, icon) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'الموضة',          'fashion',      'ملابس وأحذية وإكسسوارات لكل الأذواق',            '👗'),
  ('c1000000-0000-0000-0000-000000000002', 'الإلكترونيات',    'electronics',  'هواتف ولابتوبات وأجهزة ذكية',                    '📱'),
  ('c1000000-0000-0000-0000-000000000003', 'المنزل والديكور', 'home-living',  'أثاث وديكور ومستلزمات المطبخ',                   '🏠'),
  ('c1000000-0000-0000-0000-000000000004', 'الجمال والعناية', 'beauty',       'روتين العناية بالبشرة والعطور ومستحضرات التجميل', '💄'),
  ('c1000000-0000-0000-0000-000000000005', 'الرياضة',         'sports',       'معدات لياقة وملابس رياضية وأدوات خارجية',         '🏋️'),
  ('c1000000-0000-0000-0000-000000000006', 'الكتب',           'books',        'أفضل الكتب التعليمية والتطوير الذاتي',            '📚');

-- ============================================================
-- 4. الخصومات
-- ============================================================
INSERT INTO discounts (id, title, type, value, badge_text, active, start_date, end_date) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'تخفيضات الصيف 2025',    'percentage', 20, 'صيف',    TRUE,  NOW()-INTERVAL '1 day',   NOW()+INTERVAL '30 days'),
  ('d1000000-0000-0000-0000-000000000002', 'عرض خاطف',              'percentage', 30, 'فلاش',   TRUE,  NOW(),                    NOW()+INTERVAL '7 days'),
  ('d1000000-0000-0000-0000-000000000003', 'خصم الترحيب',           'fixed',      50, 'جديد50', TRUE,  NOW()-INTERVAL '7 days',  NOW()+INTERVAL '60 days'),
  ('d1000000-0000-0000-0000-000000000004', 'تخفيضات نهاية الأسبوع', 'percentage', 40, 'ميجا40', TRUE,  NOW(),                    NOW()+INTERVAL '2 days'),
  ('d1000000-0000-0000-0000-000000000005', 'تصفية المخزون',         'percentage', 15, 'تصفية',  FALSE, NOW()-INTERVAL '30 days', NOW()-INTERVAL '1 day');

-- ============================================================
-- 5. المنتجات
-- الصور: Unsplash CDN مباشرة بـ photo ID حقيقية
-- ============================================================
INSERT INTO products (id, name, slug, description, price, discount_price, stock_quantity, active, archived, featured, new_arrival, best_seller, category_id, view_count) VALUES

-- ─── الموضة ───────────────────────────────────────────────
('p100',
 'قميص أوكسفورد أبيض كلاسيك',
 'classic-oxford-shirt',
 'قميص أوكسفورد من القطن المصري 100٪ بقصة ريجولار مريحة. أزرار صدف طبيعية وياقة مقواة. مثالي للمناسبات الرسمية والكاجوال الراقي على حدٍّ سواء.',
 549, 429, 45, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 312),

('p101',
 'بنطال تشينو كاكي سليم فيت',
 'slim-fit-chinos',
 'بنطال تشينو من قماش الغابردين المطاطي بقصة سليم عصرية. مقاوم للتجعد بالكامل ويحافظ على شكله بعد الغسيل. متوفر بـ 5 ألوان محايدة.',
 399, NULL, 60, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000001', 189),

('p102',
 'شنطة دافل جلد بني للسفر',
 'leather-weekend-bag',
 'حقيبة سفر من الجلد البقري المدبوغ بالنباتات (Full Grain). مساحة داخلية 42 لتر مع جيوب منظمة. المقابض خشب البلوط والحزام قابل للإزالة.',
 1899, 1499, 15, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 421),

('p103',
 'بليزر بيج أوفرسايز كتان',
 'oversized-linen-blazer',
 'بليزر مفرد الزر من كتان أيرلندي ناعم بقصة أوفرسايز مريحة. بطانة جزئية وجيوب باتش مخيطة. الإطار المثالي لإطلالة صيفية راقية.',
 799, NULL, 30, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000001', 95),

('p104',
 'حذاء رياضي أبيض لايت ران',
 'running-sneakers-pro',
 'جزء علوي من شبك متنفس ثلاثي الطبقات ونعل متوسط EVA مرن. وزن 230 جرام فقط. مناسب للجري اليومي والاستخدام الكاجوال في نفس الوقت.',
 899, 699, 50, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000001', 678),

('p105',
 'سويتر كشمير رمادي كرو نيك',
 'cashmere-crew-neck-sweater',
 'مصنوع من كشمير منغولي 100٪ من الدرجة A بتركيب 2-ply مضغوط. ناعم بشكل استثنائي ومضاد للتحبب. يُنظّم درجة الحرارة الجسم بشكل طبيعي.',
 1299, NULL, 20, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000001', 203),

-- ─── الإلكترونيات ─────────────────────────────────────────
('p200',
 'سماعات لاسلكية بإلغاء الضوضاء XB55',
 'wireless-nc-headphones',
 'إلغاء ضوضاء هجين بـ 6 ميكروفونات، بطارية 40 ساعة، دريفر 40mm نيوديميوم. تتصل بجهازين في آن واحد وتُطوى بسهولة للسفر.',
 1999, 1599, 35, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 892),

('p201',
 'كيبورد ميكانيكي جيمنج TKL RGB',
 'mechanical-gaming-keyboard',
 'مفاتيح هوتسواب قابلة للتبديل بدون لحام، إضاءة RGB Per-Key، N-Key Rollover كامل. هيكل ألومنيوم CNC مع حشو صوتي لتجربة كتابة صامتة.',
 1099, NULL, 40, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000002', 334),

('p202',
 'شاشة 27 بوصة 4K IPS 144Hz',
 'monitor-27-4k',
 'لوحة IPS نانو بدقة 4K UHD، معدل تحديث 144Hz، زمن استجابة 1ms GTG، تغطية 95٪ DCI-P3، HDR400 معتمد، شحن USB-C 65W وذراع VESA جاهزة.',
 5499, 4799, 12, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 1024),

('p203',
 'ساعة ذكية ألتيميت X7 AMOLED',
 'smart-watch-series-x',
 'شاشة AMOLED Always-On بحواف منحنية، GPS مزدوج، مقياس الأكسجين وتخطيط القلب بالليزر، بطارية 7 أيام. مقاومة للماء 5ATM وإطار تيتانيوم.',
 2499, 1999, 28, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000002', 756),

('p204',
 'سبيكر بلوتوث محمول 360° BoomBox',
 'portable-bt-speaker',
 'صوت 360 درجة بقدرة 30W، بطارية 24 ساعة، مقاوم للماء والغبار IP67. يدعم ربط اثنين معًا للستيريو الحقيقي وشحن الجوال طارئ USB.',
 749, 599, 55, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000002', 445),

('p205',
 'هاب USB-C برو 7 في 1',
 'usbc-hub-pro',
 'HDMI 4K@60Hz، 3 USB-A 3.2 Gen1، قارئ SD/microSD، شحن مرور 100W PD، هيكل ألومنيوم مع تبريد سلبي. يتصل بـ MacBook وأي لابتوب USB-C.',
 399, NULL, 80, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000002', 287),

-- ─── المنزل والديكور ──────────────────────────────────────
('p300',
 'طقم قهوة سيراميك بور أوفر يدوي',
 'ceramic-pour-over-set',
 'قمع وإبريق من الفخار المصنوع يدويًا بطلاء زجاجي غير سام، مع فلتر قماش قابل لإعادة الاستخدام. يُحضّر 600 مل بنكهة نقية ومتوازنة.',
 599, 479, 25, TRUE, FALSE, TRUE,  TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000003', 198),

('p301',
 'غطاء لحاف كتان مغسول - كينج',
 'linen-duvet-cover-king',
 'كتان فرنسي 100٪ مغسول بالحجر لنعومة فورية من أول استخدام. يسمح بالتهوية ومضاد للحساسية ومضاد للبكتيريا. يزداد نعومةً مع كل غسيل.',
 899, NULL, 18, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000003', 142),

('p302',
 'رف كتب موديولار خشب بلوط صلب',
 'modular-bookshelf-oak',
 'نظام رف موديولار من خشب البلوط الطبيعي المعالج. كل وحدة 80×30×30 سم وتتحمل 30 كجم. يمكن تركيبها أفقياً أو عمودياً بحرية كاملة.',
 2199, 1799, 8,  TRUE, FALSE, TRUE,  FALSE, FALSE, 'c1000000-0000-0000-0000-000000000003', 312),

('p303',
 'طقم شموع صويا معطرة — 3 روائح',
 'scented-soy-candle-set',
 'ثلاث روائح: أرز ومسك، عود وعنبر، نارجيل وفانيليا. شمع صويا 100٪ بفتيل قطني خالٍ من الرصاص. مدة احتراق 55 ساعة لكل شمعة.',
 329, NULL, 60, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000003', 389),

-- ─── الجمال والعناية ──────────────────────────────────────
('p400',
 'سيروم فيتامين C 20٪ للإشراق',
 'vitamin-c-brightening-serum',
 'فيتامين C مستقر (Ascorbic Acid) بتركيز 20٪ مع حمض الفيروليك وفيتامين E. يُوحّد لون البشرة ويُخفّف البقع الداكنة في 4 أسابيع. pH 3.2.',
 499, 389, 70, TRUE, FALSE, TRUE,  TRUE,  TRUE,  'c1000000-0000-0000-0000-000000000004', 634),

('p401',
 'عطر ميدنايت عود أو دو بارفان 100مل',
 'midnight-oud-edp',
 'تركيبة شرقية دافئة مستوحاة من الليل العربي. رأس: زعفران وهيل. قلب: عود كمبودي وورد طائفي. قاعدة: عنبر رمادي ومسك أبيض. ثبات 10+ ساعات.',
 999, NULL, 22, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000004', 512),

('p402',
 'كريم مرطب هيالورونيك 5 أوزان',
 'hyaluronic-acid-moisturiser',
 'مزيج من 5 أوزان جزيئية مختلفة من حمض الهيالورونيك مع السيراميد ونياسيناميد 2٪. ترطيب عميق 72 ساعة لجميع أنواع البشرة بدون دهون.',
 369, 289, 90, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000004', 278),

('p403',
 'مجفف شعر احترافي آيوني 2200 واط',
 'professional-hair-dryer',
 'تقنية آيونية تُقلّل التجعد وتُضيف اللمعان. محرك AC بقدرة 2200W مع 3 درجات حرارة و2 سرعة. يصل للحرارة الكاملة في 1.5 ثانية.',
 899, 749, 30, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000004', 367),

-- ─── الرياضة ──────────────────────────────────────────────
('p500',
 'مات يوغا مطاط طبيعي 6مم ضد الانزلاق',
 'yoga-mat-premium-6mm',
 'مطاط طبيعي من جذور شجر الهيفيا مع سطح بالستيك ميكروفايبر ضد الانزلاق. خطوط محاذاة مطبوعة بحبر مائي. مقاس 183×61 سم.',
 399, NULL, 45, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000005', 189),

('p501',
 'دمبل قابلة للضبط 5-25 كجم',
 'adjustable-dumbbell-set',
 'نظام ضبط سريع بقرص دوار يغير الوزن في ثانية واحدة، من 5 إلى 25 كجم لكل دمبل. يحل محل 15 طقم منفصل. قاعدة تخزين مدمجة.',
 2699, 2199, 10, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000005', 567),

('p502',
 'تايتس جري ضاغطة للسيدات',
 'compression-running-tights',
 '78٪ بوليستر معاد تدويره و22٪ إيلاستين. مرونة رباعية الاتجاه وخصر عريض لا يتحرك. جيب خلفي مخفي بسحاب يتسع للموبايل.',
 479, 369, 55, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000005', 134),

-- ─── الكتب ────────────────────────────────────────────────
('p600',
 'العادات الذرية — جيمس كلير',
 'atomic-habits-james-clear',
 'الكتاب الأكثر مبيعًا عالميًا بأكثر من 15 مليون نسخة. إطار عملي مُثبَت علمياً لبناء العادات الجيدة والتخلص من السيئة بخطوات صغيرة متراكمة.',
 229, NULL, 100, TRUE, FALSE, FALSE, FALSE, TRUE,  'c1000000-0000-0000-0000-000000000006', 823),

('p601',
 'العمل العميق — كال نيوبورت',
 'deep-work-cal-newport',
 'كيف تُتقن التركيز العميق في عالم مشتت بالإشعارات. قواعد عملية لتعظيم إنتاجيتك المعرفية وإنجاز عمل بجودة نادرة في وقت أقل.',
 209, NULL, 80, TRUE, FALSE, FALSE, TRUE,  FALSE, 'c1000000-0000-0000-0000-000000000006', 412),

('p602',
 'سيكولوجية المال — مورغان هاوسل',
 'psychology-of-money',
 'كيف تفكر في المال بشكل أذكى. 19 درسًا خالدًا عن الثروة والجشع والسعادة بأسلوب قصصي شيّق. الكتاب المالي الأكثر تأثيرًا في العقد الأخير.',
 219, NULL, 90, TRUE, FALSE, TRUE,  FALSE, TRUE,  'c1000000-0000-0000-0000-000000000006', 654);

-- ============================================================
-- 6. صور المنتجات — Unsplash CDN مع Photo IDs حقيقية
-- ============================================================

-- ── الموضة ──
-- p100: قميص أوكسفورد
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p100', 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=800&q=80', 1),
('p100', 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', 2);

-- p101: بنطال تشينو
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p101', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80', 1),
('p101', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80', 2);

-- p102: شنطة جلد
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p102', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80', 1),
('p102', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', 2);

-- p103: بليزر كتان
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p103', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80', 1),
('p103', 'https://images.unsplash.com/photo-1594938298603-c8148c4b4468?w=800&q=80', 2);

-- p104: حذاء رياضي
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p104', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 1),
('p104', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80', 2);

-- p105: سويتر كشمير
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p105', 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&q=80', 1),
('p105', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80', 2);

-- ── الإلكترونيات ──
-- p200: سماعات
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p200', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 1),
('p200', 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80', 2);

-- p201: كيبورد
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p201', 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=800&q=80', 1),
('p201', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80', 2);

-- p202: شاشة
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p202', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80', 1),
('p202', 'https://images.unsplash.com/photo-1593640408182-31c228df4ced?w=800&q=80', 2);

-- p203: ساعة ذكية
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p203', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 1),
('p203', 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80', 2);

-- p204: سبيكر
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p204', 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 1),
('p204', 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=800&q=80', 2);

-- p205: هاب USB-C
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p205', 'https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=800&q=80', 1),
('p205', 'https://images.unsplash.com/photo-1601524909162-ae8725290836?w=800&q=80', 2);

-- ── المنزل والديكور ──
-- p300: طقم قهوة
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p300', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80', 1),
('p300', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', 2);

-- p301: غطاء لحاف
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p301', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 1),
('p301', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800&q=80', 2);

-- p302: رف كتب
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p302', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 1),
('p302', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80', 2);

-- p303: شموع
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p303', 'https://images.unsplash.com/photo-1608181831688-8e9a75e30f5b?w=800&q=80', 1),
('p303', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80', 2);

-- ── الجمال والعناية ──
-- p400: سيروم
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p400', 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', 1),
('p400', 'https://images.unsplash.com/photo-1601049541271-25cf5dc901b0?w=800&q=80', 2);

-- p401: عطر
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p401', 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=80', 1),
('p401', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80', 2);

-- p402: كريم مرطب
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p402', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', 1),
('p402', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', 2);

-- p403: مجفف شعر
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p403', 'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800&q=80', 1),
('p403', 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&q=80', 2);

-- ── الرياضة ──
-- p500: مات يوغا
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p500', 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800&q=80', 1),
('p500', 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&q=80', 2);

-- p501: دمبل
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p501', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', 1),
('p501', 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=800&q=80', 2);

-- p502: تايتس جري
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p502', 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80', 1),
('p502', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80', 2);

-- ── الكتب ──
-- p600: العادات الذرية
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p600', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80', 1),
('p600', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80', 2);

-- p601: العمل العميق
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p601', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80', 1),
('p601', 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=800&q=80', 2);

-- p602: سيكولوجية المال
INSERT INTO product_images (product_id, image_url, sort_order) VALUES
('p602', 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?w=800&q=80', 1),
('p602', 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=800&q=80', 2);

-- ============================================================
-- 7. أوردرات تجريبية
-- ============================================================
INSERT INTO orders (customer_name, customer_phone, customer_address, items, total_price, status) VALUES

('أحمد حسن',
 '+201112345678',
 'شارع التحرير، الدقي، الجيزة',
 '[{"id":"p200","name":"سماعات لاسلكية XB55","quantity":1,"price":1599},{"id":"p104","name":"حذاء رياضي لايت ران","quantity":1,"price":699}]',
 2298, 'sent'),

('سارة محمود',
 '+201234567890',
 'شارع جسر السويس، مصر الجديدة، القاهرة',
 '[{"id":"p400","name":"سيروم فيتامين C 20٪","quantity":2,"price":389},{"id":"p401","name":"عطر ميدنايت عود","quantity":1,"price":999}]',
 1777, 'sent'),

('محمد علي',
 '+201098765432',
 'شارع الهرم، فيصل، الجيزة',
 '[{"id":"p600","name":"العادات الذرية","quantity":1,"price":229},{"id":"p601","name":"العمل العميق","quantity":1,"price":209},{"id":"p602","name":"سيكولوجية المال","quantity":1,"price":219}]',
 657, 'sent'),

('نور خالد',
 '+201512345678',
 'شارع كورنيش النيل، المعادي، القاهرة',
 '[{"id":"p203","name":"ساعة ذكية ألتيميت X7","quantity":1,"price":1999}]',
 1999, 'sent'),

('يوسف طارق',
 '+201312345678',
 'شارع الإسكندرية الصحراوي، برج العرب، الإسكندرية',
 '[{"id":"p302","name":"رف كتب موديولار بلوط","quantity":1,"price":1799},{"id":"p303","name":"طقم شموع صويا","quantity":2,"price":329}]',
 2457, 'sent');

-- ============================================================
-- ✅ الملف جاهز!
-- بيانات الأدمن:
--   Email   : admin@luminastore.com
--   Password: Admin@12345
-- ============================================================
