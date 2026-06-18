-- Drop the site's public tables while keeping public.admins intact.
--
-- This removes storefront/order/settings tables. The app will need the
-- migrations run again before those parts work.
--
-- Kept:
--   public.admins
--   auth.users

DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.discounts CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;
