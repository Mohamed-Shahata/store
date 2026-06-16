import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getProductsCached,
  getCategoriesCached,
  getActiveDiscountsCached,
} from "@/lib/data/store-cache";
import { ProductGrid } from "@/components/store/product-grid";
import { Pagination } from "@/components/store/pagination";
import { ProductsFilters } from "@/components/store/products-filters";
import { Skeleton } from "@/components/ui/skeleton";
import type { SortOption } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: (await getTranslations({ locale, namespace: "nav" }))("products"),
    description: t("productsDescription"),
  };
}

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: SortOption;
    page?: string;
  }>;
}

function ProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return <Skeleton className="h-96 w-full rounded-xl" />;
}

async function ProductsContent({
  searchParams,
}: {
  searchParams: Awaited<ProductsPageProps["searchParams"]>;
}) {
  const page = parseInt(searchParams.page ?? "1", 10);

  const { products, totalPages, currentPage } = await getProductsCached({
    search: searchParams.search,
    category: searchParams.category,
    minPrice: searchParams.minPrice
      ? parseFloat(searchParams.minPrice)
      : undefined,
    maxPrice: searchParams.maxPrice
      ? parseFloat(searchParams.maxPrice)
      : undefined,
    sort: searchParams.sort ?? "newest",
    page,
  });

  const discounts = await getActiveDiscountsCached();

  const filterParams: Record<string, string> = {};
  if (searchParams.search) filterParams.search = searchParams.search;
  if (searchParams.category) filterParams.category = searchParams.category;
  if (searchParams.minPrice) filterParams.minPrice = searchParams.minPrice;
  if (searchParams.maxPrice) filterParams.maxPrice = searchParams.maxPrice;
  if (searchParams.sort) filterParams.sort = searchParams.sort;

  return (
    <>
      <ProductGrid products={products} discounts={discounts} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl="/products"
        searchParams={filterParams}
      />
    </>
  );
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const resolvedParams = await searchParams;
  const categories = await getCategoriesCached();
  const t = await getTranslations("products");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <Suspense fallback={<FiltersSkeleton />}>
          <ProductsFilters
            categories={categories}
            currentParams={resolvedParams}
          />
        </Suspense>
        <div>
          <Suspense fallback={<ProductsSkeleton />}>
            <ProductsContent searchParams={resolvedParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
