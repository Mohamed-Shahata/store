import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/server";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "en" && locale !== "ar") {
    notFound();
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
