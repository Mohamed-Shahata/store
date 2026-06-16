import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { PRODUCTS_PER_PAGE, type ProductFilters } from "@/lib/data/products";
import type {
  Category,
  Discount,
  ProductWithRelations,
  StoreSettings,
} from "@/types/database";

/**
 * Cached, public-read data fetchers for the storefront.
 *
 * These use the anonymous Supabase client (no cookies) and are wrapped in
 * `unstable_cache` so repeat visits don't all hit the database. Each entry
 * is tagged so admin mutations can call `revalidateTag` to bust it
 * immediately — `REVALIDATE_SECONDS` is just a safety net.
 *
 * Do NOT use these for admin pages: admin pages need to see their own
 * writes immediately and should keep using the cookie-based `*Admin`
 * functions in `@/lib/data/products`.
 */
const REVALIDATE_SECONDS = 300;

export const getStoreSettingsCached = unstable_cache(
  async (): Promise<StoreSettings | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("store_settings")
      .select("*")
      .limit(1)
      .single();
    return data;
  },
  ["store-settings"],
  { tags: [CACHE_TAGS.settings], revalidate: REVALIDATE_SECONDS }
);

export const getCategoriesCached = unstable_cache(
  async (): Promise<Category[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    const { data } = await supabase.from("categories").select("*").order("name");
    return data ?? [];
  },
  ["categories"],
  { tags: [CACHE_TAGS.categories], revalidate: REVALIDATE_SECONDS }
);

export const getActiveDiscountsCached = unstable_cache(
  async (): Promise<Discount[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    const { data } = await supabase.from("discounts").select("*").eq("active", true);
    return data ?? [];
  },
  ["active-discounts"],
  { tags: [CACHE_TAGS.discounts], revalidate: REVALIDATE_SECONDS }
);

export const getFeaturedProductsCached = unstable_cache(
  async (limit = 8): Promise<ProductWithRelations[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("featured", true)
      .eq("active", true)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as ProductWithRelations[]) ?? [];
  },
  ["featured-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

export const getNewArrivalsCached = unstable_cache(
  async (limit = 8): Promise<ProductWithRelations[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("new_arrival", true)
      .eq("active", true)
      .eq("archived", false)
      .order("created_at", { ascending: false })
      .limit(limit);
    return (data as ProductWithRelations[]) ?? [];
  },
  ["new-arrivals"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

export const getBestSellersCached = unstable_cache(
  async (limit = 8): Promise<ProductWithRelations[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("best_seller", true)
      .eq("active", true)
      .eq("archived", false)
      .order("view_count", { ascending: false })
      .limit(limit);
    return (data as ProductWithRelations[]) ?? [];
  },
  ["best-sellers"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

export const getProductsCached = unstable_cache(
  async (filters: ProductFilters = {}) => {
    if (!isSupabaseConfigured()) {
      return { products: [], totalCount: 0, totalPages: 0, currentPage: 1 };
    }

    const supabase = createPublicClient();
    const page = filters.page ?? 1;
    const from = (page - 1) * PRODUCTS_PER_PAGE;
    const to = from + PRODUCTS_PER_PAGE - 1;

    let query = supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)", { count: "exact" })
      .eq("active", true)
      .eq("archived", false);

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    if (filters.category) {
      query = query.eq("category_id", filters.category);
    }

    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    switch (filters.sort) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      case "popular":
        query = query.order("view_count", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, count } = await query.range(from, to);

    return {
      products: (data as ProductWithRelations[]) ?? [],
      totalCount: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / PRODUCTS_PER_PAGE),
      currentPage: page,
    };
  },
  ["products-list"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

export const getProductBySlugCached = unstable_cache(
  async (slug: string): Promise<ProductWithRelations | null> => {
    if (!isSupabaseConfigured()) return null;
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("slug", slug)
      .eq("active", true)
      .eq("archived", false)
      .single();
    return data as ProductWithRelations | null;
  },
  ["product-by-slug"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

export const getRelatedProductsCached = unstable_cache(
  async (
    productId: string,
    categoryId: string | null,
    limit = 4
  ): Promise<ProductWithRelations[]> => {
    if (!isSupabaseConfigured()) return [];
    const supabase = createPublicClient();
    let query = supabase
      .from("products")
      .select("*, category:categories(*), product_images(*)")
      .eq("active", true)
      .eq("archived", false)
      .neq("id", productId)
      .limit(limit);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    }

    const { data } = await query.order("created_at", { ascending: false });
    return (data as ProductWithRelations[]) ?? [];
  },
  ["related-products"],
  { tags: [CACHE_TAGS.products], revalidate: REVALIDATE_SECONDS }
);

/**
 * Fire-and-forget view counter. Uses a SECURITY DEFINER RPC (see migration
 * 002) so anonymous visitors can bump `view_count` without needing write
 * access to the `products` table. Never throws — a failed view count
 * should never break a product page.
 */
export async function incrementProductViewCount(slug: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = createPublicClient();
    await supabase.rpc("increment_product_view_count", { product_slug: slug });
  } catch {
    // Non-critical — ignore failures.
  }
}
