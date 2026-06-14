import { getTranslations } from "next-intl/server";
import { getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";
import type { Locale } from "@/i18n/routing";

interface NewProductPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const { locale } = await params;
  const [categories, t] = await Promise.all([
    getAllCategoriesAdmin(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("addProduct")}</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
