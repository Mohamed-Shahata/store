# Run this SQL in Supabase SQL Editor after creating your first admin user via Authentication

-- Create admin user manually in Supabase Dashboard > Authentication > Users
-- Then run this (replace with your admin user's UUID and email):

-- INSERT INTO admins (id, email)
-- VALUES ('YOUR_USER_UUID', 'admin@yourstore.com');

-- Or use this trigger to auto-add admins based on email domain:
-- CREATE OR REPLACE FUNCTION handle_new_user()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.email LIKE '%@yourstore.com' THEN
--     INSERT INTO admins (id, email) VALUES (NEW.id, NEW.email);
--   END IF;
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION handle_new_user();
