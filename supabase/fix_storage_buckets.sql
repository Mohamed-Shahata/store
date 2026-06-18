-- Restore Supabase Storage buckets and policies for product/store images.
--
-- Run this in Supabase SQL Editor if image upload returns 400 after
-- recreating or dropping the site's public tables.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-assets',
  'store-assets',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
) ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('product-images', 'store-assets'));

DROP POLICY IF EXISTS "Admins upload images" ON storage.objects;
CREATE POLICY "Admins upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('product-images', 'store-assets') AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins update images" ON storage.objects;
CREATE POLICY "Admins update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('product-images', 'store-assets') AND public.is_admin()
  );

DROP POLICY IF EXISTS "Admins delete images" ON storage.objects;
CREATE POLICY "Admins delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('product-images', 'store-assets') AND public.is_admin()
  );
