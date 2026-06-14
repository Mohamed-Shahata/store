"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Category } from "@/types/database";

interface CategoriesSectionProps {
  categories: Category[];
}

export function CategoriesSection({ categories }: CategoriesSectionProps) {
  const t = useTranslations("home");
  const locale = useLocale();

  if (categories.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold md:text-3xl">{t("shopByCategory")}</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            {t("viewAll")}
            <ArrowRight
              className={`h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`}
            />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/products?category=${category.id}`}
                className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50"
              >
                <span className="text-3xl">{category.icon ?? "🛍️"}</span>
                <span className="text-sm font-medium text-center">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
