"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  Package,
  FolderOpen,
  Percent,
  Settings,
  Store,
} from "lucide-react";
import { AdminLogoutButton } from "@/components/admin/logout-button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/admin/products", labelKey: "products", icon: Package },
  { href: "/admin/categories", labelKey: "categories", icon: FolderOpen },
  { href: "/admin/discounts", labelKey: "discounts", icon: Percent },
  { href: "/admin/settings", labelKey: "settings", icon: Settings },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <aside className="hidden md:flex w-64 flex-col border-e bg-card min-h-screen">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
        <Store className="h-6 w-6" />
        <span className="font-bold">{t("panel")}</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <AdminLogoutButton />
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();
  const t = useTranslations("admin");

  return (
    <nav className="md:hidden flex overflow-x-auto gap-2">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground bg-muted"
            )}
          >
            <item.icon className="h-3 w-3" />
            {t(item.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
