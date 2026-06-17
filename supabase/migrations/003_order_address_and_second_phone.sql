-- Add customer address (required) and a second phone number (optional) to orders

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS customer_address TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS customer_phone_2 TEXT;

-- Remove the temporary default now that existing rows have a value;
-- new inserts must always provide an address going forward.
ALTER TABLE orders
  ALTER COLUMN customer_address DROP DEFAULT;