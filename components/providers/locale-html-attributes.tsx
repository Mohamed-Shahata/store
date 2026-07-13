"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

export function LocaleHtmlAttributes() {
  const pathname = usePathname();

  useEffect(() => {
    const segment = pathname.split("/")[1];
    const locale = routing.locales.includes(
      segment as (typeof routing.locales)[number]
    )
      ? segment
      : routing.defaultLocale;

    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [pathname]);

  return null;
}
