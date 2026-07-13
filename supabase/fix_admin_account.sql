-- Fix an existing admin login that exists in auth.users but is missing
-- from public.admins.
--
-- Run this in Supabase SQL Editor, then sign out and sign in again.
-- Change the email if your admin account uses a different address.

INSERT INTO public.admins (id, email, is_super_admin)
SELECT id, email, TRUE
FROM auth.users
WHERE email = 'admin@luminastore.com'
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  is_super_admin = TRUE;
