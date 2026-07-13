import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/firebase/server";

// ---------------------------------------------------------------------------
// Origin guard
// ---------------------------------------------------------------------------

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const requestOrigin = new URL(request.url).origin;
  if (siteUrl && origin === siteUrl) return true;
  if (origin === requestOrigin) return true;
  if (
    process.env.NODE_ENV === "development" &&
    /^https?:\/\/(localhost|127\.0\.0\.1)/.test(origin)
  )
    return true;

  return false;
}

export function originDeniedResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ---------------------------------------------------------------------------
// Admin auth guard
// ---------------------------------------------------------------------------

type AuthResult =
  | { ok: true; userId: string; isSuperAdmin: boolean }
  | { ok: false; response: NextResponse };

/**
 * Verifies the incoming request is from a logged-in admin, by reading the
 * `__session` cookie set at login (see /api/auth/session) and checking the
 * matching `admins/{uid}` Firestore doc. Equivalent to the old
 * `requireAdminAuth` that checked Supabase's `admins` table.
 */
export async function requireAdminAuth(request: Request): Promise<AuthResult> {
  if (!isAllowedOrigin(request)) {
    return { ok: false, response: originDeniedResponse() };
  }

  // Route Handlers don't get `cookies()` from `next/headers` writable in
  // every context, but they can always read the request's own cookie header.
  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`))
    ?.split("=")[1];

  if (!sessionCookie) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  let uid: string;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    uid = decoded.uid;
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const adminSnap = await getAdminDb().collection("admins").doc(uid).get();

  if (!adminSnap.exists) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "Forbidden: this logged-in user is not registered in the admins collection.",
        },
        { status: 403 }
      ),
    };
  }

  const admin = adminSnap.data() as { isSuperAdmin: boolean };
  return { ok: true, userId: uid, isSuperAdmin: admin.isSuperAdmin };
}

// ---------------------------------------------------------------------------
// Input helpers
// ---------------------------------------------------------------------------

export async function safeJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// In-process rate limiter (per IP, in-memory)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

export function rateLimitResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}

export function getClientIp(request: Request): string {
  const headers = (request as Request & { headers: Headers }).headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export { getAdminDb as createServiceClient };
