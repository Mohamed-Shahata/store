"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Archive,
  ArchiveRestore,
  Loader2,
} from "lucide-react";
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
import { revalidateStoreCache } from "@/lib/actions/revalidate";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { toast } from "sonner";
import type { ProductWithRelations } from "@/types/database";

interface ProductsTableProps {
  products: ProductWithRelations[];
}

function ProductStatusBadge({
  product,
  t,
}: {
  product: ProductWithRelations;
  t: ReturnType<typeof useTranslations>;
}) {
  if (product.archived)
    return <Badge variant="secondary">{t("archived")}</Badge>;
  if (product.active) return <Badge>{t("active")}</Badge>;
  return <Badge variant="outline">{t("inactive")}</Badge>;
}

function ProductFlags({
  product,
  t,
}: {
  product: ProductWithRelations;
  t: ReturnType<typeof useTranslations>;
}) {
  if (!product.featured && !product.best_seller && !product.new_arrival)
    return null;
  return (
    <div className="flex gap-1 flex-wrap">
      {product.featured && <Badge variant="sale">{t("featured")}</Badge>}
      {product.best_seller && <Badge variant="sale">{t("bestSeller")}</Badge>}
      {product.new_arrival && <Badge variant="sale">{t("newArrival")}</Badge>}
    </div>
  );
}

function DeleteProductDialog({
  product,
  onDelete,
  pending,
  t,
}: {
  product: ProductWithRelations;
  onDelete: (id: string) => void;
  pending: boolean;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-destructive" />
          )}
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
          <AlertDialogAction
            onClick={() => onDelete(product.id)}
            disabled={pending}
          >
            {pending && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
            {t("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ProductActions({
  product,
  pendingAction,
  onToggleArchive,
  onDelete,
  t,
}: {
  product: ProductWithRelations;
  pendingAction: { id: string; action: "archive" | "delete" } | null;
  onToggleArchive: (id: string, archived: boolean) => void;
  onDelete: (id: string) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const isArchivePending =
    pendingAction?.id === product.id && pendingAction.action === "archive";
  const isDeletePending =
    pendingAction?.id === product.id && pendingAction.action === "delete";

  return (
    <>
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/admin/products/${product.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isArchivePending}
        onClick={() => onToggleArchive(product.id, product.archived)}
      >
        {isArchivePending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : product.archived ? (
          <ArchiveRestore className="h-4 w-4" />
        ) : (
          <Archive className="h-4 w-4" />
        )}
      </Button>
      <DeleteProductDialog
        product={product}
        onDelete={onDelete}
        pending={isDeletePending}
        t={t}
      />
    </>
  );
}

export function ProductsTable({
  products: initialProducts,
}: ProductsTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [pendingAction, setPendingAction] = useState<{
    id: string;
    action: "archive" | "delete";
  } | null>(null);
  const router = useRouter();
  const t = useTranslations("admin");

  const deleteProduct = async (id: string) => {
    setPendingAction({ id, action: "delete" });
    try {
      const supabase = createClient();
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setProducts(products.filter((p) => p.id !== id));
      toast.success(t("toast.productDeleted"));
      await revalidateStoreCache([CACHE_TAGS.products]);
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  };

  const toggleArchive = async (id: string, archived: boolean) => {
    setPendingAction({ id, action: "archive" });
    try {
      const supabase = createClient();
      const { data: updated, error } = await supabase
        .from("products")
        .update({ archived: !archived })
        .eq("id", id)
        .select();
      if (error) {
        toast.error(error.message);
        return;
      }
      if (!updated || updated.length === 0) {
        toast.error(t("toast.permissionDenied"));
        return;
      }
      setProducts(
        products.map((p) => (p.id === id ? { ...p, archived: !archived } : p)),
      );
      toast.success(
        archived ? t("toast.productRestored") : t("toast.productArchived"),
      );
      await revalidateStoreCache([CACHE_TAGS.products]);
      router.refresh();
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
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
        <>
          {/* Table view (md and up) */}
          <div className="hidden md:block rounded-xl border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-start font-medium">
                    {t("fields.name")}
                  </th>
                  <th className="p-4 text-start font-medium">
                    {t("category")}
                  </th>
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
                    <td className="p-4 max-w-[220px]">
                      <div className="font-medium break-words">
                        {product.name}
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {product.slug}
                      </div>
                    </td>
                    <td className="p-4">{product.category?.name ?? "-"}</td>
                    <td className="p-4 whitespace-nowrap">
                      {formatPrice(product.price)}
                    </td>
                    <td className="p-4">{product.stock_quantity}</td>
                    <td className="p-4">
                      <ProductStatusBadge product={product} t={t} />
                    </td>
                    <td className="p-4">
                      <ProductFlags product={product} t={t} />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-1">
                        <ProductActions
                          product={product}
                          pendingAction={pendingAction}
                          onToggleArchive={toggleArchive}
                          onDelete={deleteProduct}
                          t={t}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card view (mobile) */}
          <div className="md:hidden space-y-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium break-words">
                      {product.name}
                    </div>
                    <div className="text-xs text-muted-foreground break-all">
                      {product.slug}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {product.category?.name ?? t("uncategorized")}
                    </div>
                  </div>
                  <ProductStatusBadge product={product} t={t} />
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className="font-medium">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-muted-foreground">
                    {t("stock")}: {product.stock_quantity}
                  </span>
                </div>

                <div className="mt-2">
                  <ProductFlags product={product} t={t} />
                </div>

                <div className="flex justify-end gap-1 mt-3 border-t pt-3">
                  <ProductActions
                    product={product}
                    pendingAction={pendingAction}
                    onToggleArchive={toggleArchive}
                    onDelete={deleteProduct}
                    t={t}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
