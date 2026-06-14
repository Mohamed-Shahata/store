import { getAllDiscountsAdmin } from "@/lib/data/products";
import { DiscountsManager } from "@/components/admin/discounts-manager";

export default async function AdminDiscountsPage() {
  const discounts = await getAllDiscountsAdmin();
  return <DiscountsManager discounts={discounts} />;
}
