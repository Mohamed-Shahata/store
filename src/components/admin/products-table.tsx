"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { Plus, Pencil, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import type { ProductWithRelations } from "@/types/database";

interface ProductsTableProps {
  products: ProductWithRelations[];
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const router = useRouter();
  const t = useTranslations("admin");

  const deleteProduct = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProducts(products.filter((p) => p.id !== id));
    toast.success(t("toast.productDeleted"));
    router.refresh();
  };

  const toggleArchive = async (id: string, archived: boolean) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("products")
      .update({ archived: !archived })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProducts(
      products.map((p) =>
        p.id === id ? { ...p, archived: !archived } : p
      )
    );
    toast.success(
      archived ? t("toast.productRestored") : t("toast.productArchived")
    );
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{t("products")}</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 h-4 w-4" />
            {t("addProduct")}
          </Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">{t("empty.noProducts")}</p>
      ) : (
        <div className="rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-start font-medium">{t("fields.name")}</th>
                <th className="p-4 text-start font-medium">{t("category")}</th>
                <th className="p-4 text-start font-medium">{t("price")}</th>
                <th className="p-4 text-start font-medium">{t("stock")}</th>
                <th className="p-4 text-start font-medium">{t("status")}</th>
                <th className="p-4 text-start font-medium">{t("flags")}</th>
                <th className="p-4 text-end font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b last:border-0">
                  <td className="p-4">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-xs text-muted-foreground">{product.slug}</div>
                  </td>
                  <td className="p-4">{product.category?.name ?? "-"}</td>
                  <td className="p-4">{formatPrice(product.price)}</td>
                  <td className="p-4">{product.stock_quantity}</td>
                  <td className="p-4">
                    {product.archived ? (
                      <Badge variant="secondary">{t("archived")}</Badge>
                    ) : product.active ? (
                      <Badge>{t("active")}</Badge>
                    ) : (
                      <Badge variant="outline">{t("inactive")}</Badge>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {product.featured && <Badge variant="sale">{t("featured")}</Badge>}
                      {product.best_seller && <Badge variant="sale">{t("bestSeller")}</Badge>}
                      {product.new_arrival && <Badge variant="sale">{t("newArrival")}</Badge>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/products/${product.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleArchive(product.id, product.archived)}
                      >
                        {product.archived ? (
                          <ArchiveRestore className="h-4 w-4" />
                        ) : (
                          <Archive className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("deleteProduct")}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("deleteProductDescription", { name: product.name })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteProduct(product.id)}>
                              {t("delete")}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
