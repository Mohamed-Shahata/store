import { getTranslations, setRequestLocale } from "next-intl/server";
import { getStoreSettingsCached } from "@/lib/data/store-cache";
import { CartPage } from "@/components/store/cart-page";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  return {
    title: nav("cart"),
    description: t("cartDescription"),
  };
}

export default async function Cart({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const settings = await getStoreSettingsCached();
  const nav = await getTranslations("nav");

  return (
    <CartPage
      whatsappNumber={settings?.whatsapp_number ?? "01152432513"}
      storeName={settings?.store_name ?? nav("premiumStore")}
    />
  );
}
