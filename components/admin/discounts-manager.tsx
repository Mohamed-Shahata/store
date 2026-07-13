"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  discountSchema,
  type DiscountFormData,
} from "@/lib/validations/schemas";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { revalidateStoreCache } from "@/lib/actions/revalidate";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isDiscountActive } from "@/lib/utils";
import { toast } from "sonner";
import type { Discount } from "@/types/firestore";

interface DiscountsManagerProps {
  discounts: Discount[];
}

export function DiscountsManager({
  discounts: initial,
}: DiscountsManagerProps) {
  const [discounts, setDiscounts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("admin");

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: { active: true, type: "percentage", badge_text: "SALE" },
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      title: "",
      type: "percentage",
      value: 10,
      badge_text: "SALE",
      start_date: null,
      end_date: null,
      active: true,
    });
    setOpen(true);
  };

  const discountType = useWatch({ control, name: "type" });
  const active = useWatch({ control, name: "active" });

  const openEdit = (discount: Discount) => {
    setEditing(discount);
    reset({
      title: discount.title,
      type: discount.type,
      value: discount.value,
      badge_text: discount.badgeText ?? "SALE",
      start_date: discount.startDate?.slice(0, 16) ?? null,
      end_date: discount.endDate?.slice(0, 16) ?? null,
      active: discount.active,
    });
    setOpen(true);
  };

  const onSubmit = async (data: DiscountFormData) => {
    const db = getFirebaseDb();
    const payload = {
      title: data.title,
      type: data.type,
      value: data.value,
      badgeText: data.badge_text || null,
      startDate: data.start_date || null,
      endDate: data.end_date || null,
      active: data.active,
    };

    try {
      if (editing) {
        await updateDoc(doc(db, "discounts", editing.id), payload);
        setDiscounts(
          discounts.map((d) => (d.id === editing.id ? { ...d, ...payload } : d)),
        );
        toast.success(t("toast.discountUpdated"));
      } else {
        const ref = await addDoc(collection(db, "discounts"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
        setDiscounts([
          { id: ref.id, ...payload, createdAt: new Date().toISOString() },
          ...discounts,
        ]);
        toast.success(t("toast.discountCreated"));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.permissionDenied"));
      return;
    }

    setOpen(false);
    await revalidateStoreCache([CACHE_TAGS.discounts, CACHE_TAGS.products]);
    router.refresh();
  };

  const deleteDiscount = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(getFirebaseDb(), "discounts", id));
      setDiscounts(discounts.filter((d) => d.id !== id));
      toast.success(t("toast.discountDeleted"));
      await revalidateStoreCache([CACHE_TAGS.discounts, CACHE_TAGS.products]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.permissionDenied"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">{t("discounts")}</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addDiscount")}
        </Button>
      </div>

      {discounts.length === 0 ? (
        <p className="text-muted-foreground">{t("empty.noDiscounts")}</p>
      ) : (
        <div className="space-y-3">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold break-words">
                    {discount.title}
                  </h3>
                  <Badge variant="sale">{discount.badgeText ?? "SALE"}</Badge>
                  {isDiscountActive(discount) ? (
                    <Badge>{t("active")}</Badge>
                  ) : (
                    <Badge variant="secondary">{t("inactive")}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1 break-words">
                  {discount.type === "percentage"
                    ? t("percentageOff", { value: discount.value })
                    : t("fixedOff", { value: discount.value })}
                  {discount.startDate &&
                    ` ${t("from")} ${format(new Date(discount.startDate), "MMM d, yyyy")}`}
                  {discount.endDate &&
                    ` ${t("until")} ${format(new Date(discount.endDate), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(discount)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === discount.id}
                    >
                      {deletingId === discount.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteDiscount")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("deleteDiscountDescription", {
                          title: discount.title,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteDiscount(discount.id)}
                        disabled={deletingId === discount.id}
                      >
                        {deletingId === discount.id && (
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        )}
                        {t("delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? t("editDiscount") : t("addDiscount")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">{t("fields.title")}</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>{t("fields.type")}</Label>
                <Select
                  value={discountType}
                  onValueChange={(v: "percentage" | "fixed") =>
                    setValue("type", v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">
                      {t("percentage")}
                    </SelectItem>
                    <SelectItem value="fixed">{t("fixedAmount")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">{t("fields.value")}</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...register("value", { valueAsNumber: true })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="badge_text">{t("fields.badgeText")}</Label>
              <Input
                id="badge_text"
                placeholder="SALE"
                {...register("badge_text")}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">{t("fields.startDate")}</Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  {...register("start_date")}
                />
              </div>
              <div>
                <Label htmlFor="end_date">{t("fields.endDate")}</Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  {...register("end_date")}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">{t("active")}</Label>
              <Switch
                id="active"
                checked={active}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && (
                <Loader2 className="me-2 h-4 w-4 animate-spin" />
              )}
              {editing ? t("update") : t("create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
