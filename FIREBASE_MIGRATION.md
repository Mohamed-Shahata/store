# Firebase Migration — Complete

كل الباك اتحول من Supabase لـ Firebase (Auth + Firestore + Storage). مفيش أي كود Supabase متبقي في src/.

## اللي اتعمل
- **Auth**: Firebase Auth (email/password) + httpOnly session cookie (`/api/auth/session`, `/api/auth/logout`)، وتحقق حقيقي في `admin/(dashboard)/layout.tsx`
- **Database**: Firestore بدل PostgreSQL — schema جديد في `src/types/firestore.ts` (كل الحقول camelCase، صور المنتج مدمجة جوه الـ product document)
- **Storage**: Firebase Storage بدل Supabase Storage (`src/lib/firebase/storage.ts`)
- **كل الـ data layer, API routes, admin components** اتحولت بالكامل (products, categories, discounts, store settings, admins, orders, sitemap)

## قبل ما تشغل المشروع

1. `npm install` (اتحطت firebase + firebase-admin + server-only في package.json)
2. في Firebase Console:
   - فعّل **Authentication → Email/Password**
   - أنشئ **Firestore Database**
   - فعّل **Storage**
   - روح **Project settings → Service accounts → Generate new private key** واملى `.env.local` بـ:
     `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
3. أنشئ أول admin يدويًا: اعمل user في Firebase Auth، بعدين ضيف document في Firestore:
   `admins/{uid}` → `{ email, isSuperAdmin: true, createdAt: <ISO string> }`
4. أنشئ document في `storeSettings/main` بالحقول من `StoreSettingsDoc` (في `src/types/firestore.ts`)
5. **لازم تكتب Firestore Security Rules** (مش موجودة دلوقتي — الحماية حاليًا معتمدة بالكامل على إن كل الـ writes بتعدي على Admin SDK في الـ API routes، ما عدا `product-form.tsx`, `discounts-manager.tsx`, `store-settings-form.tsx`, `products-table.tsx` اللي بتكتب على Firestore مباشرة من الـ client). لازم Rule تتأكد إن `request.auth.uid` موجود في `admins` collection قبل أي write على `products`/`categories`/`discounts`/`storeSettings`.

## ملاحظات تصميم مهمة
- الـ search بقى prefix-match بس (مفيش full-text زي `ilike`) — لو محتاج بحث حقيقي هتحتاج Algolia/Typesense
- الـ pagination في `getProducts` بتجيب كل النتائج لحد الصفحة المطلوبة وتقصها (مفيش `offset` في Firestore) — تمام للحجم الحالي
