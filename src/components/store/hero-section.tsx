"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";

interface HeroSectionProps {
  storeName: string;
  description?: string | null;
}

export function HeroSection({ storeName, description }: HeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const ArrowIcon = ArrowRight;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 py-20 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              {t("badge")}
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
              {t("welcome", { storeName })}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl text-balance">
              {description ?? t("defaultDescription")}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/products">
                  {t("shopNow")}
                  <ArrowIcon
                    className={`ms-2 h-4 w-4 ${locale === "ar" ? "rotate-180" : ""}`}
                  />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products?sort=newest">{t("newArrivals")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
    </section>
  );
}
