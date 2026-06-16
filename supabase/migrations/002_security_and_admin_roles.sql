-- Migration 002: super-admin protection + view-count RPC
--
-- 1. Adds an `is_super_admin` flag to `admins`. The super admin is the
--    account that created the store (or the oldest admin row if this
--    migration runs on an existing project) and can never be removed —
--    enforced in the application layer (see /api/admin/admins).
-- 2. A trigger keeps marking the very first admin ever created as the
--    super admin on fresh installs.
-- 3. Adds a SECURITY DEFINER function so anonymous visitors can bump a
--    product's view count without needing write access to `products`.

-- 1) Add the flag
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Backfill: if no admin is marked as super admin yet, promote the oldest one.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admins WHERE is_super_admin = TRUE) THEN
    UPDATE admins
    SET is_super_admin = TRUE
    WHERE id = (SELECT id FROM admins ORDER BY created_at ASC LIMIT 1);
  END IF;
END $$;

-- 2) Auto-promote the very first admin on fresh installs
CREATE OR REPLACE FUNCTION set_first_admin_as_super()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM admins) = 1 THEN
    UPDATE admins SET is_super_admin = TRUE WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_first_admin_as_super ON admins;
CREATE TRIGGER trg_set_first_admin_as_super
  AFTER INSERT ON admins
  FOR EACH ROW
  EXECUTE FUNCTION set_first_admin_as_super();

-- 3) View-count RPC for anonymous product page visits
CREATE OR REPLACE FUNCTION increment_product_view_count(product_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET view_count = view_count + 1
  WHERE slug = product_slug AND active = TRUE AND archived = FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_product_view_count(TEXT) TO anon, authenticated;
