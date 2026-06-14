import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { routing, type Locale } from "@/i18n/routing";

export async function updateSession(
  request: NextRequest,
  locale: Locale = routing.defaultLocale
) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminBase = `/${locale}/admin`;
  const loginPath = `${adminBase}/login`;
  const isAdminRoute =
    request.nextUrl.pathname.startsWith(adminBase) &&
    !request.nextUrl.pathname.startsWith(loginPath);

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname === loginPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = adminBase;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
