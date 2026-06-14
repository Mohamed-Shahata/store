"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
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
import { discountSchema, type DiscountFormData } from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/client";
import { isDiscountActive } from "@/lib/utils";
import { toast } from "sonner";
import type { Discount } from "@/types/database";

interface DiscountsManagerProps {
  discounts: Discount[];
}

export function DiscountsManager({ discounts: initial }: DiscountsManagerProps) {
  const [discounts, setDiscounts] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
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
        discounts.map((d) =>
          d.id === editing.id ? { ...d, ...payload } : d
        )
      );
      toast.success("Discount updated");
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
      toast.success("Discount created");
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
    toast.success("Discount deleted");
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Discounts</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      {discounts.length === 0 ? (
        <p className="text-muted-foreground">No discounts yet.</p>
      ) : (
        <div className="space-y-3">
          {discounts.map((discount) => (
            <div
              key={discount.id}
              className="rounded-xl border bg-card p-4 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{discount.title}</h3>
                  <Badge variant="sale">{discount.badge_text ?? "SALE"}</Badge>
                  {isDiscountActive(discount) ? (
                    <Badge>Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {discount.type === "percentage"
                    ? `${discount.value}% off`
                    : `${discount.value} EGP off`}
                  {discount.start_date &&
                    ` • From ${format(new Date(discount.start_date), "MMM d, yyyy")}`}
                  {discount.end_date &&
                    ` • Until ${format(new Date(discount.end_date), "MMM d, yyyy")}`}
                </p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(discount)}>
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
                      <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                      <AlertDialogDescription>
                        Delete &quot;{discount.title}&quot;?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteDiscount(discount.id)}>
                        Delete
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
            <DialogTitle>{editing ? "Edit Discount" : "Add Discount"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(v: "percentage" | "fixed") => setValue("type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Input id="value" type="number" step="0.01" {...register("value", { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <Label htmlFor="badge_text">Badge Text</Label>
              <Input id="badge_text" placeholder="SALE, HOT DEAL, etc." {...register("badge_text")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="datetime-local" {...register("start_date")} />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input id="end_date" type="datetime-local" {...register("end_date")} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Active</Label>
              <Switch
                id="active"
                checked={watch("active")}
                onCheckedChange={(checked) => setValue("active", checked)}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {editing ? "Update" : "Create"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
