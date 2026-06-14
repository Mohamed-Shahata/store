import { getAllProductsAdmin, getAllCategoriesAdmin } from "@/lib/data/products";
import { ProductsTable } from "@/components/admin/products-table";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return <ProductsTable products={products} />;
}
