"use client";

import { useTranslations } from "next-intl";
import { ProductCard } from "@/components/store/product-card";
import { applyGlobalDiscount } from "@/lib/utils";
import type { Discount, ProductWithRelations } from "@/types/database";

interface ProductGridProps {
  products: ProductWithRelations[];
  discounts?: Discount[];
}

export function ProductGrid({ products, discounts = [] }: ProductGridProps) {
  const t = useTranslations("products");

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">{t("noProducts")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("noProductsHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, index) => {
        const { finalPrice, badgeText } = applyGlobalDiscount(
          product.price,
          product.discount_price,
          discounts
        );
        return (
          <ProductCard
            key={product.id}
            product={product}
            finalPrice={finalPrice}
            badgeText={badgeText}
            index={index}
          />
        );
      })}
    </div>
  );
}
