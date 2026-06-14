"use client";

import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:justify-end md:px-6">
          <AdminMobileNav />
          <LanguageSwitcher />
        </div>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
