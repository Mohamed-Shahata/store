import { getTranslations } from "next-intl/server";
import { getStoreSettings } from "@/lib/data/products";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import type { Locale } from "@/i18n/routing";

interface AdminSettingsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  const [settings, t] = await Promise.all([
    getStoreSettings(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  if (!settings) {
    return <p className="text-muted-foreground">{t("settingsNotFound")}</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("storeSettings")}</h1>
      <StoreSettingsForm settings={settings} />
    </div>
  );
}
