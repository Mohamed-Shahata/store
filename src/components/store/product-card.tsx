"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, getEffectivePrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";
import type { ProductWithRelations } from "@/types/database";

interface ProductCardProps {
  product: ProductWithRelations;
  finalPrice?: number;
  badgeText?: string | null;
  index?: number;
}

export function ProductCard({
  product,
  finalPrice,
  badgeText,
  index = 0,
}: ProductCardProps) {
  const t = useTranslations("products");
  const tCart = useTranslations("cart");
  const addItem = useCartStore((s) => s.addItem);
  const images = product.product_images ?? [];
  const mainImage = images.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url;
  const effectiveFinalPrice =
    finalPrice ?? getEffectivePrice(product.price, product.discount_price);
  const hasDiscount = effectiveFinalPrice < product.price;
  const discountPercent = hasDiscount
    ? calculateDiscountPercentage(product.price, effectiveFinalPrice)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (product.stock_quantity <= 0) {
      toast.error(t("outOfStock"));
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      discountPrice: product.discount_price,
      finalPrice: effectiveFinalPrice,
      image: mainImage ?? "/placeholder-product.svg",
      stockQuantity: product.stock_quantity,
    });
    toast.success(tCart("addedToCart"));
  };

  return (
    <motion.div
      className="h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/products/${product.slug}`} className="group block h-full">
        <div className="relative flex h-full min-h-[360px] flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg sm:min-h-[390px]">
          <div className="relative aspect-square overflow-hidden bg-muted">
            {mainImage ? (
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                {t("noImage")}
              </div>
            )}
            {(badgeText || hasDiscount) && (
              <Badge variant="sale" className="absolute top-3 start-3">
                {badgeText ?? `${discountPercent}% OFF`}
              </Badge>
            )}
            {product.stock_quantity <= 0 && (
              <Badge variant="secondary" className="absolute top-3 end-3">
                {t("outOfStock")}
              </Badge>
            )}
            <Button
              size="icon"
              className="absolute bottom-3 end-3 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleAddToCart}
              disabled={product.stock_quantity <= 0}
              aria-label={t("addToCart")}
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-1 flex-col p-4">
            {product.category && (
              <p className="mb-1 min-h-4 truncate text-xs text-muted-foreground">
                {product.category.name}
              </p>
            )}
            {!product.category && <div className="mb-1 min-h-4" />}
            <h3 className="min-h-12 font-medium line-clamp-2 group-hover:underline">
              {product.name}
            </h3>
            <div className="mt-auto flex items-center gap-2 pt-3">
              <span className="font-bold">{formatPrice(effectiveFinalPrice)}</span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
