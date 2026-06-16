import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * A Supabase client for public, read-only, anonymous access.
 *
 * Unlike `@/lib/supabase/server`, this client does NOT read cookies and
 * carries no user session, so it is safe to call from inside
 * `unstable_cache` (whose result may be shared across requests/users).
 *
 * Only use this for data that is covered by a public RLS policy
 * (categories, active products, active discounts, store settings, ...).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
