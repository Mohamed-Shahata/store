"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";

interface HeroSectionProps {
  storeName: string;
  description?: string | null;
  bannerImages?: string[];
}

export function HeroSection({
  storeName,
  description,
  bannerImages = [],
}: HeroSectionProps) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const ArrowIcon = ArrowRight;
  const slides = bannerImages.filter(Boolean);
  const hasSlides = slides.length > 0;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setTimeout(() => {
      setCurrent((value) => (value + 1) % slides.length);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [current, slides.length]);

  return (
    <section className="relative min-h-[calc(100svh-76px)] overflow-hidden bg-background">
      {hasSlides ? (
        <div className="absolute inset-0">
          {slides.map((image, index) => (
            <Image
              key={`${image}-${index}`}
              src={image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={cn(
                "object-cover transition-opacity duration-700",
                index === current ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,13,22,0.55),rgba(8,13,22,0.78))]" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.06),hsl(var(--background)),hsl(var(--primary)/0.12))]" />
      )}

      <div className="container relative z-10 mx-auto flex min-h-[calc(100svh-76px)] items-center px-4 py-20 md:py-28">
        <div
          className={cn(
            "mx-auto max-w-3xl text-center",
            hasSlides ? "text-white" : "text-foreground",
          )}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span
              className={cn(
                "mb-6 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm backdrop-blur",
                hasSlides
                  ? "border-white/20 bg-black/25 text-white"
                  : "border-border bg-background/75 text-foreground",
              )}
            >
              <Sparkles className="h-4 w-4" />
              {t("badge")}
            </span>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl text-balance">
              {t("welcome", { storeName })}
            </h1>
            <p
              className={cn(
                "mt-6 text-lg md:text-xl text-balance",
                hasSlides ? "text-white/80" : "text-muted-foreground",
              )}
            >
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
              <Button
                asChild
                variant="outline"
                size="lg"
                className={
                  hasSlides
                    ? "border-white/30 bg-white/10 text-white hover:bg-white hover:text-foreground"
                    : undefined
                }
              >
                <Link href="/products?sort=newest">{t("newArrivals")}</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === current
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/60 hover:bg-white",
              )}
              aria-label={`Go to hero slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
