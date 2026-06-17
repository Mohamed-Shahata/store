"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import {
  AdminSidebar,
  AdminSidebarNav,
} from "@/components/admin/admin-sidebar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  const t = useTranslations("admin");

  // Close the mobile drawer whenever the route changes.
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (open) setOpen(false);
  }

  // Prevent the page from scrolling behind the open drawer.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      {/* Mobile sidebar drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setOpen(false)}
        />
        <div
          className={cn(
            "absolute inset-y-0 start-0 w-72 max-w-[80vw] bg-card border-e shadow-xl transition-transform duration-300 ease-in-out",
            open
              ? "translate-x-0"
              : "ltr:-translate-x-full rtl:translate-x-full",
          )}
        >
          <AdminSidebarNav onNavigate={() => setOpen(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 md:justify-end md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(true)}
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
