import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing, type Locale } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createMiddleware(routing);

function getLocaleFromPathname(pathname: string): Locale | null {
  const segment = pathname.split("/")[1];
  return routing.locales.includes(segment as Locale) ? (segment as Locale) : null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const pathWithoutLocale = locale
    ? pathname.replace(`/${locale}`, "") || "/"
    : pathname;

  if (pathWithoutLocale.startsWith("/admin")) {
    if (!locale) {
      const url = request.nextUrl.clone();
      url.pathname = `/${routing.defaultLocale}${pathname}`;
      return NextResponse.redirect(url);
    }

    return await updateSession(request, locale);
  }

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
