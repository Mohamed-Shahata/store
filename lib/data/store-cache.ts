import "server-only";
import { unstable_cache } from "next/cache";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { CACHE_TAGS } from "@/lib/cache-tags";
import * as products from "@/lib/data/products";
import type { ProductFilters } from "@/lib/data/products";

/**
 * Cached wrappers around the Firestore reads in `@/lib/data/products`.
 * Tagged so admin mutations can `revalidateTag` to bust them immediately —
 * `REVALIDATE_SECONDS` is just a safety net.
 */
const REVALIDATE_SECONDS = 300;

export const getStoreSettingsCached = unstable_cache(
  async () => (isFirebaseConfigured() ? products.getStoreSettings() : null),
  ["store-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: REVALIDATE_SECONDS },
);

export const getCategoriesCached = unstable_cache(
  async () => (isFirebaseConfigured() ? products.getCategories() : []),
  ["categories"],
  { tags: [CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS },
);

export const getActiveDiscountsCached = unstable_cache(
  async () => (isFirebaseConfigured() ? products.getActiveDiscounts() : []),
  ["active-discounts"],
  { tags: [CACHE_TAGS.discounts], revalidate: REVALIDATE_SECONDS },
);

export const getFeaturedProductsCached = unstable_cache(
  async (limit = 8) =>
    isFirebaseConfigured() ? products.getFeaturedProducts(limit) : [],
  ["featured-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getNewArrivalsCached = unstable_cache(
  async (limit = 8) =>
    isFirebaseConfigured() ? products.getNewArrivals(limit) : [],
  ["new-arrivals"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getBestSellersCached = unstable_cache(
  async (limit = 8) =>
    isFirebaseConfigured() ? products.getBestSellers(limit) : [],
  ["best-sellers"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getProductsCached = unstable_cache(
  async (filters: ProductFilters = {}) =>
    isFirebaseConfigured()
      ? products.getProducts(filters)
      : { products: [], totalCount: 0, totalPages: 0, currentPage: 1 },
  ["products-list"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getProductBySlugCached = unstable_cache(
  async (slug: string) =>
    isFirebaseConfigured() ? products.getProductBySlug(slug) : null,
  ["product-by-slug"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);

export const getRelatedProductsCached = unstable_cache(
  async (productId: string, categoryId: string | null, limit = 4) =>
    isFirebaseConfigured()
      ? products.getRelatedProducts(productId, categoryId, limit)
      : [],
  ["related-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS },
);
