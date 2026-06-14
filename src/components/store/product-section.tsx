"use client";

import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { ProductGrid } from "@/components/store/product-grid";
import type { Discount, ProductWithRelations } from "@/types/database";

interface ProductSectionProps {
  title: string;
  products: ProductWithRelations[];
  discounts?: Discount[];
  viewAllHref?: string;
}

export function ProductSection({
  title,
  products,
  discounts = [],
  viewAllHref,
}: ProductSectionProps) {
  const locale = useLocale();

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ViewAllLabel />
              <ArrowRight
                className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`}
              />
            </Link>
          )}
        </div>
        <ProductGrid products={products} discounts={discounts} />
      </div>
    </section>
  );
}

function ViewAllLabel() {
  const t = useTranslations("home");
  return <>{t("viewAll")}</>;
}

interface PromoBannerProps {
  banners: string[];
}

export function PromoBanners({ banners }: PromoBannerProps) {
  const t = useTranslations("home");

  if (!banners.length) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-8 md:p-12 text-primary-foreground text-center"
          >
            <h2 className="text-2xl md:text-4xl font-bold">{t("limitedOffers")}</h2>
            <p className="mt-2 text-primary-foreground/80">{t("promoDescription")}</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((banner, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative aspect-[21/9] overflow-hidden rounded-2xl"
            >
              <Image
                src={banner}
                alt={`${t("limitedOffers")} ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
