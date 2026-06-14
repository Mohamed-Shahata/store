"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { ProductWithRelations } from "@/types/database";

interface ProductDetailsProps {
  product: ProductWithRelations;
  finalPrice: number;
  badgeText: string | null;
  images: string[];
}

export function ProductDetails({
  product,
  finalPrice,
  badgeText,
  images,
}: ProductDetailsProps) {
  const t = useTranslations("product");
  const tProducts = useTranslations("products");
  const tCart = useTranslations("cart");
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const hasDiscount = finalPrice < product.price;
  const discountPercent = hasDiscount
    ? calculateDiscountPercentage(product.price, finalPrice)
    : 0;
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error(tProducts("outOfStock"));
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discount_price,
      finalPrice,
      image: images[0] ?? "/placeholder-product.svg",
      stockQuantity: product.stock_quantity,
      quantity,
    });
    toast.success(tCart("addedToCart"));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="relative aspect-square overflow-hidden rounded-2xl border bg-muted">
            {images.length > 0 ? (
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {tProducts("noImage")}
              </div>
            )}
            {(badgeText || hasDiscount) && (
              <Badge variant="sale" className="absolute top-4 start-4 text-sm">
                {badgeText ?? `${discountPercent}% OFF`}
              </Badge>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {product.category && (
            <p className="text-sm text-muted-foreground">{product.category.name}</p>
          )}
          <h1 className="text-3xl font-bold md:text-4xl">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400">
                  {t("inStock", { count: product.stock_quantity })}
                </span>
              </>
            ) : (
              <span className="text-sm text-destructive font-medium">
                {t("outOfStock")}
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          {inStock && (
            <div className="flex items-center gap-4">
              <div className="flex items-center rounded-lg border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stock_quantity, quantity + 1))
                  }
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <ShoppingBag className="me-2 h-5 w-5" />
            {t("addToCart")}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
