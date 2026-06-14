import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductWithRelations } from "@/types/database";
import type { Locale } from "@/i18n/routing";

interface EditProductPageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id, locale } = await params;
  const supabase = await createClient();

  const [{ data: product }, categories, t] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("id", id)
      .single(),
    getAllCategoriesAdmin(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("editProduct")}</h1>
      <ProductForm
        categories={categories}
        product={product as ProductWithRelations}
      />
    </div>
  );
}
