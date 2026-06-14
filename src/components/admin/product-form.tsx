"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { productSchema, type ProductFormData } from "@/lib/validations/schemas";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { toast } from "sonner";
import type { Category, ProductWithRelations } from "@/types/database";

interface ProductFormProps {
  categories: Category[];
  product?: ProductWithRelations;
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    product?.product_images
      ?.sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url) ?? []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: product.price,
          discount_price: product.discount_price,
          stock_quantity: product.stock_quantity,
          category_id: product.category_id,
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
        },
  });

  const name = watch("name");

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    const supabase = createClient();

    const productData = {
      ...data,
      slug: data.slug || slugify(data.name),
      category_id: data.category_id || null,
      discount_price: data.discount_price || null,
    };

    try {
      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);

        if (error) throw error;

        await supabase
          .from("product_images")
          .delete()
          .eq("product_id", product.id);

        if (images.length > 0) {
          await supabase.from("product_images").insert(
            images.map((url, index) => ({
              product_id: product.id,
              image_url: url,
              sort_order: index,
            }))
          );
        }

        toast.success("Product updated");
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();

        if (error) throw error;

        if (images.length > 0 && newProduct) {
          await supabase.from("product_images").insert(
            images.map((url, index) => ({
              product_id: newProduct.id,
              image_url: url,
              sort_order: index,
            }))
          );
        }

        toast.success("Product created");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              placeholder={name ? slugify(name) : "product-slug"}
              {...register("slug")}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} />
          </div>
          <div>
            <Label>Category</Label>
            <Select
              value={watch("category_id") ?? "none"}
              onValueChange={(v) =>
                setValue("category_id", v === "none" ? null : v)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Stock</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="price">Price (EGP)</Label>
            <Input id="price" type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
            {errors.price && (
              <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="discount_price">Discount Price</Label>
            <Input
              id="discount_price"
              type="number"
              step="0.01"
              {...register("discount_price", { valueAsNumber: true })}
            />
          </div>
          <div>
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              type="number"
              {...register("stock_quantity", { valueAsNumber: true })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent>
          <ImageUpload images={images} onChange={setImages} maxImages={8} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flags & Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "featured" as const, label: "Featured" },
            { key: "best_seller" as const, label: "Best Seller" },
            { key: "new_arrival" as const, label: "New Arrival" },
            { key: "active" as const, label: "Active" },
            { key: "archived" as const, label: "Archived" },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={watch(key)}
                onCheckedChange={(checked) => setValue(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
