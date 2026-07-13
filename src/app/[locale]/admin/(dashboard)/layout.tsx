import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/server";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import type { Locale } from "@/i18n/routing";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  // Real session verification (the Edge middleware only checks cookie
  // presence — this is the actual auth boundary for /admin routes).
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
