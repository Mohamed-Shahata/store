import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";
import { serializeFirestoreData } from "@/lib/firebase/serialize";
import type { Category, Product, ProductWithRelations } from "@/types/firestore";
import type { Locale } from "@/i18n/routing";

interface EditProductPageProps {
  params: Promise<{ id: string; locale: Locale }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id, locale } = await params;

  const [snap, categories, t] = await Promise.all([
    getAdminDb().collection("products").doc(id).get(),
    getAllCategoriesAdmin(),
    getTranslations({ locale, namespace: "admin" }),
  ]);

  if (!snap.exists) {
    notFound();
  }

  const rawProduct = { id: snap.id, ...snap.data() } as Product;
  let rawCategory: Category | null = null;
  if (rawProduct.categoryId) {
    const catSnap = await getAdminDb()
      .collection("categories")
      .doc(rawProduct.categoryId)
      .get();
    rawCategory = catSnap.exists
      ? ({ id: catSnap.id, ...catSnap.data() } as Category)
      : null;
  }

  const product = serializeFirestoreData({
    ...rawProduct,
    category: rawCategory,
  }) as ProductWithRelations;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{t("editProduct")}</h1>
      <ProductForm
        categories={categories}
        product={product}
      />
    </div>
  );
}
