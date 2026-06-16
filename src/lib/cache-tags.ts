/**
 * Cache tags used with `unstable_cache` / `revalidateTag` across the store.
 *
 * Whenever an admin mutation changes data behind one of these tags, call
 * `revalidateStoreCache([...])` (see `@/lib/actions/revalidate`) with the
 * relevant tag(s) so the public storefront picks up the change.
 */
export const CACHE_TAGS = {
  products: "products",
  categories: "categories",
  discounts: "discounts",
  settings: "store-settings",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];
