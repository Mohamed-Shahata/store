"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Discount } from "@/types/database";

interface SliderSlide {
  id: string;
  image?: string;
  title: string;
  subtitle?: string;
  badge?: string;
  href?: string;
  gradient: string;
}

interface PromoSliderProps {
  banners: string[];
  discounts: Discount[];
}

function buildSlides(banners: string[], discounts: Discount[]): SliderSlide[] {
  const slides: SliderSlide[] = [];

  // Active discounts → rich slides
  const active = discounts.filter((d) => {
    if (!d.active) return false;
    const now = Date.now();
    if (d.start_date && new Date(d.start_date).getTime() > now) return false;
    if (d.end_date && new Date(d.end_date).getTime() < now) return false;
    return true;
  });

  const gradients = [
    "from-[#1F3A5F] to-[#0d2240]",
    "from-[#1F3A5F] via-[#2a4a70] to-[#1a3058]",
    "from-[#0d2240] to-[#1F3A5F]",
    "from-[#2a4a70] to-[#0d2240]",
  ];

  active.forEach((d, i) => {
    slides.push({
      id: `discount-${d.id}`,
      title: d.title,
      subtitle:
        d.type === "percentage"
          ? `Save ${d.value}% on your order`
          : `Save ${d.value} EGP on your order`,
      badge: d.badge_text ?? "SALE",
      href: "/products",
      gradient: gradients[i % gradients.length],
    });
  });

  // Banner images
  banners.forEach((url, i) => {
    slides.push({
      id: `banner-${i}`,
      image: url,
      title: "Special Offer",
      href: "/products",
      gradient: gradients[i % gradients.length],
    });
  });

  // Fallback if nothing
  if (slides.length === 0) {
    slides.push({
      id: "fallback",
      title: "Exclusive Deals",
      subtitle: "Shop the latest collection at unbeatable prices",
      badge: "LIMITED",
      href: "/products",
      gradient: "from-[#1F3A5F] to-[#0d2240]",
    });
  }

  return slides;
}

export function PromoSlider({ banners, discounts }: PromoSliderProps) {
  const t = useTranslations("home");
  const slides = buildSlides(banners, discounts);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const total = slides.length;

  const go = useCallback(
    (index: number) => {
      setCurrent(((index % total) + total) % total);
    },
    [total]
  );

  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Auto-advance every 4 s
  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(next, 4000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, next]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <div
          className="relative overflow-hidden rounded-2xl h-48 sm:h-64 md:h-80 select-none"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          aria-label={t("limitedOffers")}
          role="region"
        >
          {/* Slides */}
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={cn(
                "absolute inset-0 transition-all duration-700 ease-in-out",
                i === current ? "opacity-100 translate-x-0 z-10" : "opacity-0 translate-x-full z-0"
              )}
            >
              {slide.image ? (
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              ) : (
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-r flex items-center justify-center",
                    slide.gradient
                  )}
                >
                  <div className="text-center px-6">
                    {slide.badge && (
                      <span className="inline-block bg-gold text-gold-foreground text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-widest uppercase">
                        {slide.badge}
                      </span>
                    )}
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                      {slide.title}
                    </h2>
                    {slide.subtitle && (
                      <p className="text-white/75 text-sm sm:text-base">{slide.subtitle}</p>
                    )}
                    {slide.href && (
                      <Link
                        href={slide.href}
                        className="mt-4 inline-block bg-gold text-gold-foreground text-sm font-semibold px-5 py-2 rounded-full hover:opacity-90 transition-opacity"
                      >
                        {t("shopNow")}
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Prev / Next arrows */}
          {total > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full p-1.5 backdrop-blur-sm transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={cn(
                    "rounded-full transition-all duration-300",
                    i === current
                      ? "bg-gold w-5 h-2"
                      : "bg-white/50 w-2 h-2 hover:bg-white/80"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
