"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  categorySchema,
  type CategoryFormData,
} from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/client";
import { revalidateStoreCache, CACHE_TAGS } from "@/lib/actions/revalidate";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import type { Category } from "@/types/database";

interface CategoriesManagerProps {
  categories: Category[];
}

export function CategoriesManager({
  categories: initial,
}: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initial);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations("admin");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  });

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", slug: "", description: "", icon: "" });
    setOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    reset({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      icon: category.icon ?? "",
    });
    setOpen(true);
  };

  const onSubmit = async (data: CategoryFormData) => {
    const supabase = createClient();
    const payload = { ...data, slug: data.slug || slugify(data.name) };

    if (editing) {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editing.id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCategories(
        categories.map((c) => (c.id === editing.id ? { ...c, ...payload } : c)),
      );
      toast.success(t("toast.categoryUpdated"));
    } else {
      const { data: newCat, error } = await supabase
        .from("categories")
        .insert(payload)
        .select()
        .single();
      if (error) {
        toast.error(error.message);
        return;
      }
      setCategories([...categories, newCat]);
      toast.success(t("toast.categoryCreated"));
    }

    setOpen(false);
    await revalidateStoreCache([CACHE_TAGS.categories, CACHE_TAGS.products]);
    router.refresh();
  };

  const deleteCategory = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      setCategories(categories.filter((c) => c.id !== id));
      toast.success(t("toast.categoryDeleted"));
      await revalidateStoreCache([CACHE_TAGS.categories, CACHE_TAGS.products]);
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">{t("categories")}</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("addCategory")}
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="text-muted-foreground">{t("empty.noCategories")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="rounded-xl border bg-card p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                {category.icon && (
                  <span className="text-2xl">{category.icon}</span>
                )}
                <h3 className="font-semibold mt-2 break-words">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground break-all">
                  {category.slug}
                </p>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingId === category.id}
                    >
                      {deletingId === category.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-destructive" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t("deleteCategory")}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t("deleteCategoryDescription", {
                          name: category.name,
                        })}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteCategory(category.id)}
                        disabled={deletingId === category.id}
                      >
                        {deletingId === category.id && (
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
              {editing ? t("editCategory") : t("addCategory")}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">{t("fields.name")}</Label>
              <Input
                id="name"
                {...register("name")}
                onChange={(e) => {
                  register("name").onChange(e);
                  if (!editing) setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="slug">{t("fields.slug")}</Label>
              <Input id="slug" {...register("slug")} />
            </div>
            <div>
              <Label htmlFor="icon">{t("fields.icon")}</Label>
              <Input
                id="icon"
                {...register("icon")}
                placeholder={t("fields.iconPlaceholder")}
              />
            </div>
            <div>
              <Label htmlFor="description">{t("fields.description")}</Label>
              <Textarea id="description" {...register("description")} />
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
