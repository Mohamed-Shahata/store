"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, SortOption } from "@/types/database";

interface ProductsFiltersProps {
  categories: Category[];
  currentParams: {
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: SortOption;
  };
}

export function ProductsFilters({
  categories,
  currentParams,
}: ProductsFiltersProps) {
  const t = useTranslations("products");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState(currentParams.search ?? "");
  const [minPrice, setMinPrice] = useState(currentParams.minPrice ?? "");
  const [maxPrice, setMaxPrice] = useState(currentParams.maxPrice ?? "");

  const updateFilters = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: search || undefined });
  };

  const filterContent = (
    <div className="space-y-6">
      <form onSubmit={handleSearch}>
        <Label htmlFor="search" className="mb-2 block">
          {t("search")}
        </Label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-9"
          />
        </div>
      </form>

      <div>
        <Label className="mb-2 block">{t("category")}</Label>
        <Select
          value={currentParams.category ?? "all"}
          onValueChange={(value) =>
            updateFilters({ category: value === "all" ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder={t("allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block">{t("priceRange")}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder={t("min")}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min={0}
          />
          <Input
            type="number"
            placeholder={t("max")}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min={0}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 w-full"
          onClick={() =>
            updateFilters({
              minPrice: minPrice || undefined,
              maxPrice: maxPrice || undefined,
            })
          }
        >
          {t("applyPrice")}
        </Button>
      </div>

      <div>
        <Label className="mb-2 block">{t("sortBy")}</Label>
        <Select
          value={currentParams.sort ?? "newest"}
          onValueChange={(value) => updateFilters({ sort: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t("sortNewest")}</SelectItem>
            <SelectItem value="oldest">{t("sortOldest")}</SelectItem>
            <SelectItem value="price_asc">{t("sortPriceAsc")}</SelectItem>
            <SelectItem value="price_desc">{t("sortPriceDesc")}</SelectItem>
            <SelectItem value="popular">{t("sortPopular")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setSearch("");
          setMinPrice("");
          setMaxPrice("");
          router.push("/products");
        }}
      >
        {t("clearFilters")}
      </Button>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        className="lg:hidden w-full mb-4"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <SlidersHorizontal className="h-4 w-4 me-2" />
        {t("filters")}
      </Button>

      <div className={`${mobileOpen ? "block" : "hidden"} lg:block`}>
        <div className="rounded-xl border bg-card p-6 sticky top-24">
          <h2 className="font-semibold mb-4 hidden lg:block">{t("filters")}</h2>
          {filterContent}
        </div>
      </div>
    </>
  );
}
