import { getStoreSettings } from "@/lib/data/products";
import { StoreSettingsForm } from "@/components/admin/store-settings-form";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  if (!settings) {
    return <p className="text-muted-foreground">Store settings not found.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Store Settings</h1>
      <StoreSettingsForm settings={settings} />
    </div>
  );
}
