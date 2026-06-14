import { getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const categories = await getAllCategoriesAdmin();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
