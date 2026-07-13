import { getAllCategoriesAdmin } from "@/lib/data/products";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategoriesAdmin();
  return <CategoriesManager categories={categories} />;
}
