import { NextResponse, type NextRequest } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/server";

/**
 * Equivalent of the old `updateSession()` from `@/lib/supabase/middleware`.
 *
 * IMPORTANT: Next.js Middleware runs on the Edge runtime, which does not
 * support the Node.js APIs `firebase-admin` needs (no `crypto`, no
 * `net`/`tls`). So this can only check whether the session cookie is
 * *present* — it cannot cryptographically verify it here.
 *
 * The real verification (`getCurrentUser()` in `@/lib/firebase/server`,
 * via `verifySessionCookie`) MUST also run in the admin layout / pages
 * themselves (which run on the Node.js runtime). Treat this middleware
 * check as a fast UX redirect only, never as the actual auth boundary.
 */
export function updateSession(
  request: NextRequest,
  locale: Locale = routing.defaultLocale
) {
  const response = NextResponse.next({ request });

  const hasSession = Boolean(
    request.cookies.get(SESSION_COOKIE_NAME)?.value
  );

  const adminBase = `/${locale}/admin`;
  const loginPath = `${adminBase}/login`;
  const isAdminRoute =
    request.nextUrl.pathname.startsWith(adminBase) &&
    !request.nextUrl.pathname.startsWith(loginPath);

  if (isAdminRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === loginPath && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = adminBase;
    return NextResponse.redirect(url);
  }

  return response;
}
