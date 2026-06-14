"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { createClient } from "@/lib/supabase/client";
import { isDiscountActive } from "@/lib/utils";
import { toast } from "sonner";
import type { Discount } from "@/types/database";

interface DiscountsManagerProps {
  discounts: Discount[];
}

export function DiscountsManager({
  discounts: initial,
}: DiscountsManagerProps) {
  const [discounts, setDiscounts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
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
      badge_text: discount.badge_text ?? "SALE",
      start_date: discount.start_date?.slice(0, 16) ?? null,
      end_date: discount.end_date?.slice(0, 16) ?? null,
      active: discount.active,
    });
    setOpen(true);
  };

  const onSubmit = async (data: DiscountFormData) => {
    const supabase = createClient();
    const payload = {
      ...data,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
    };

    if (editing) {
      const { error } = await supabase
        .from("discounts")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setDiscounts(
        discounts.map((d) => (d.id === editing.id ? { ...d, ...payload } : d)),
      );
      toast.success(t("toast.discountUpdated"));
    } else {
      const { data: newDiscount, error } = await supabase
        .from("discounts")
        .insert(payload)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setDiscounts([newDiscount, ...discounts]);
      toast.success(t("toast.discountCreated"));
    }

    setOpen(false);
    router.refresh();
  };

  const deleteDiscount = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("discounts").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDiscounts(discounts.filter((d) => d.id !== id));
    toast.success(t("toast.discountDeleted"));
    router.refresh();
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
                  <Badge variant="sale">{discount.badge_text ?? "SALE"}</Badge>
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
                  {discount.start_date &&
                    ` ${t("from")} ${format(new Date(discount.start_date), "MMM d, yyyy")}`}
                  {discount.end_date &&
                    ` ${t("until")} ${format(new Date(discount.end_date), "MMM d, yyyy")}`}
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
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
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
                      >
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
              {editing ? t("update") : t("create")}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
