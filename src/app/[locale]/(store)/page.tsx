import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getStoreSettings,
  getCategories,
  getFeaturedProducts,
  getNewArrivals,
  getBestSellers,
  getActiveDiscounts,
} from "@/lib/data/products";
import { HeroSection } from "@/components/store/hero-section";
import { CategoriesSection } from "@/components/store/categories-section";
import {
  ProductSection,
  PromoBanners,
} from "@/components/store/product-section";
import { routing } from "@/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const nav = await getTranslations("nav");

  const [settings, categories, featured, newArrivals, bestSellers, discounts] =
    await Promise.all([
      getStoreSettings(),
      getCategories(),
      getFeaturedProducts(),
      getNewArrivals(),
      getBestSellers(),
      getActiveDiscounts(),
    ]);

  const banners = Array.isArray(settings?.banner_images)
    ? (settings.banner_images as string[])
    : [];

  return (
    <>
      <HeroSection
        storeName={settings?.store_name ?? nav("premiumStore")}
        description={settings?.store_description}
      />
      <PromoBanners banners={banners} />
      <CategoriesSection categories={categories} />
      <ProductSection
        title={t("featuredProducts")}
        products={featured}
        discounts={discounts}
        viewAllHref="/products?featured=true"
      />
      <ProductSection
        title={t("newArrivals")}
        products={newArrivals}
        discounts={discounts}
        viewAllHref="/products?sort=newest"
      />
      <ProductSection
        title={t("bestSellers")}
        products={bestSellers}
        discounts={discounts}
        viewAllHref="/products?sort=popular"
      />
    </>
  );
}
