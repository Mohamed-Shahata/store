import "server-only";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

export const SESSION_COOKIE_NAME = "__session";

/**
 * Reads the `__session` httpOnly cookie (set at login by
 * /api/auth/session) and verifies it against Firebase Auth.
 * Equivalent to `supabase.auth.getUser()` in the old server.ts.
 *
 * Returns null if there's no session or it's invalid/expired/revoked.
 */
export async function getCurrentUser(): Promise<DecodedIdToken | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    // `checkRevoked: true` makes logout-everywhere / disabled accounts work.
    return await getAdminAuth().verifySessionCookie(sessionCookie, true);
  } catch {
    return null;
  }
}
