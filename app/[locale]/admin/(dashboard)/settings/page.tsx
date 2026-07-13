import { getTranslations } from "next-intl/server";
import { getStoreSettings } from "@/lib/data/products";
import { getAllAdmins, getCurrentAdmin } from "@/lib/data/admins";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";
import { AccountSettingsForm } from "@/components/admin/account-settings-form";
import { AdminsManager } from "@/components/admin/admins-manager";
import { Separator } from "@/components/ui/separator";
import type { Locale } from "@/i18n/routing";

interface AdminSettingsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function AdminSettingsPage({
  params,
}: AdminSettingsPageProps) {
  const { locale } = await params;
  const [settings, admins, currentUser, t] = await Promise.all([
    getStoreSettings(),
    getAllAdmins(),
    getCurrentAdmin(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-8">{t("storeSettings")}</h1>
        {settings ? (
          <StoreSettingsForm settings={settings} />
        ) : (
          <p className="text-muted-foreground">{t("settingsNotFound")}</p>
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-2">{t("accountSettings")}</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {t("accountSettingsDescription")}
        </p>
        {currentUser?.email && (
          <AccountSettingsForm currentEmail={currentUser.email} />
        )}
      </div>

      <Separator />

      <div>
        <h2 className="text-2xl font-bold mb-6">{t("adminAccounts")}</h2>
        <AdminsManager admins={admins} currentAdminId={currentUser?.id ?? ""} />
      </div>
    </div>
  );
}
