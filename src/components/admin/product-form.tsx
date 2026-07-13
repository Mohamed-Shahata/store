"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { productSchema, type ProductFormData } from "@/lib/validations/schemas";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";
import { revalidateStoreCache } from "@/lib/actions/revalidate";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, ProductWithRelations } from "@/types/firestore";

interface ProductFormProps {
  categories: Category[];
  product?: ProductWithRelations;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    product?.images
      ?.slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((img) => img.imageUrl) ?? [],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: product.price,
          discount_price: product.discountPrice,
          stock_quantity: product.stockQuantity,
          category_id: product.categoryId ?? undefined,
          images: product.images?.map((img) => img.imageUrl) ?? [],
          featured: product.featured,
          best_seller: product.best_seller,
          new_arrival: product.new_arrival,
          active: product.active,
          archived: product.archived,
        }
      : {
          featured: false,
          best_seller: false,
          new_arrival: false,
          active: true,
          archived: false,
          stock_quantity: 0,
          images: [],
        },
  });

  const name = useWatch({ control, name: "name" });
  const categoryId = useWatch({ control, name: "category_id" });
  const flagValues = useWatch({
    control,
    name: ["featured", "best_seller", "new_arrival", "active", "archived"],
  });

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!data.category_id) {
      setError("category_id", { message: "Category is required" });
      return;
    }
    setLoading(true);
    const db = getFirebaseDb();

    const imageDocs = images.map((url, index) => ({
      imageUrl: url,
      sortOrder: index,
    }));

    const productData = {
      name: data.name,
      slug: data.slug || slugify(data.name),
      description: data.description,
      price: data.price,
      discountPrice:
        data.discount_price && !isNaN(data.discount_price)
          ? data.discount_price
          : null,
      stockQuantity: data.stock_quantity,
      categoryId: data.category_id,
      featured: data.featured,
      bestSeller: data.best_seller,
      newArrival: data.new_arrival,
      active: data.active,
      archived: data.archived,
      images: imageDocs,
    };

    try {
      if (product) {
        await updateDoc(doc(db, "products", product.id), {
          ...productData,
          updatedAt: serverTimestamp(),
        });
        toast.success(t("toast.productUpdated"));
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          viewCount: 0,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast.success(t("toast.productCreated"));
      }

      await revalidateStoreCache([CACHE_TAGS.products]);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("toast.genericError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        console.log("❌ VALIDATION FAILED:", validationErrors);
      })}
      className="space-y-6 max-w-3xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>{t("basicInformation")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">{t("fields.name")} *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="slug">{t("fields.slug")}</Label>
            <Input
              id="slug"
              placeholder={name ? slugify(name) : "product-slug"}
              {...register("slug")}
            />
            {errors.slug && (
              <p className="text-sm text-destructive mt-1">
                {errors.slug.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">{t("fields.description")} *</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label>{t("category")} *</Label>
            <Select
              value={categoryId ?? ""}
              onValueChange={(v) => {
                setValue("category_id", v, {
                  shouldValidate: true,
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
            >
              <SelectTrigger
                className={errors.category_id ? "border-destructive" : ""}
              >
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-sm text-destructive mt-1">
                {t("validation.categoryRequired")}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("pricingStock")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">{t("priceEgp")} *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="discount_price">{t("discountPrice")}</Label>
            <Input
              id="discount_price"
              type="number"
              step="0.01"
              {...register("discount_price", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="stock_quantity">{t("stockQuantity")} *</Label>
            <Input
              id="stock_quantity"
              type="number"
              {...register("stock_quantity", { valueAsNumber: true })}
            />
            {errors.stock_quantity && (
              <p className="text-sm text-destructive mt-1">
                {errors.stock_quantity.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("images")} *</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload
            images={images}
            onChange={handleImagesChange}
            maxImages={8}
          />
          {errors.images && (
            <p className="text-sm text-destructive mt-2">
              {t("validation.imageRequired")}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("flagsStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "featured" as const, label: t("featured") },
            { key: "best_seller" as const, label: t("bestSeller") },
            { key: "new_arrival" as const, label: t("newArrival") },
            { key: "active" as const, label: t("active") },
            { key: "archived" as const, label: t("archived") },
          ].map(({ key, label }, index) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={Boolean(flagValues[index])}
                onCheckedChange={(checked) => setValue(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? t("updateProduct") : t("createProduct")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {t("cancel")}
        </Button>
      </div>
    </form>
  );
}
