import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";
import type { ProductWithRelations } from "@/types/database";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, categories] = await Promise.all([
    supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("id", id)
      .single(),
    getAllCategoriesAdmin(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Product</h1>
      <ProductForm
        categories={categories}
        product={product as ProductWithRelations}
      />
    </div>
  );
}
