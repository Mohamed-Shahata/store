import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Origin guard
// ---------------------------------------------------------------------------

/**
 * Returns true when the request comes from an allowed origin.
 * In production the origin must match NEXT_PUBLIC_SITE_URL.
 * In development any localhost origin is allowed.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Non-browser requests (curl, server-to-server) have no Origin header —
  // allow them through; the admin auth check will still protect the route.
  if (!origin) return true;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (siteUrl && origin === siteUrl) return true;
  if (process.env.NODE_ENV === "development" && /^https?:\/\/localhost/.test(origin))
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
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/**
 * Verifies the incoming request is from a logged-in admin.
 * Returns the admin's userId on success, or a ready-to-return error response.
 */
export async function requireAdminAuth(request: Request): Promise<AuthResult> {
  if (!isAllowedOrigin(request)) {
    return { ok: false, response: originDeniedResponse() };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, userId: user.id };
}

// ---------------------------------------------------------------------------
// Input helpers
// ---------------------------------------------------------------------------

/** Safely parse JSON body. Returns null on failure. */
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

/**
 * Simple sliding-window rate limiter backed by an in-process Map.
 * Resets on every server restart / cold start.
 *
 * @param key      Usually the requester's IP address.
 * @param limit    Max requests per window (default 20).
 * @param windowMs Window length in ms (default 60 s).
 */
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

/** Extract the best available IP from Next.js request headers. */
export function getClientIp(request: Request): string {
  const headers = (request as Request & { headers: Headers }).headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}

export { createServiceClient };
