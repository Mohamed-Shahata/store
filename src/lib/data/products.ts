import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  Category,
  Discount,
  ProductWithRelations,
  SortOption,
  StoreSettings,
} from "@/types/database";

const PRODUCTS_PER_PAGE = 12;

export async function getStoreSettings(): Promise<StoreSettings | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("*")
    .limit(1)
    .single();
  return data;
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function getActiveDiscounts(): Promise<Discount[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discounts")
    .select("*")
    .eq("active", true);
  return data ?? [];
}

export async function getFeaturedProducts(
  limit = 8
): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .eq("featured", true)
    .eq("active", true)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ProductWithRelations[]) ?? [];
}

export async function getNewArrivals(
  limit = 8
): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .eq("new_arrival", true)
    .eq("active", true)
    .eq("archived", false)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ProductWithRelations[]) ?? [];
}

export async function getBestSellers(
  limit = 8
): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .eq("best_seller", true)
    .eq("active", true)
    .eq("archived", false)
    .order("view_count", { ascending: false })
    .limit(limit);
  return (data as ProductWithRelations[]) ?? [];
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createClient();
  const page = filters.page ?? 1;
  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const to = from + PRODUCTS_PER_PAGE - 1;

  let query = supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)", {
      count: "exact",
    })
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
}

export async function getProductBySlug(
  slug: string
): Promise<ProductWithRelations | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .eq("slug", slug)
    .eq("active", true)
    .eq("archived", false)
    .single();

  if (data) {
    await supabase
      .from("products")
      .update({ view_count: (data.view_count ?? 0) + 1 })
      .eq("id", data.id);
  }

  return data as ProductWithRelations | null;
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4
): Promise<ProductWithRelations[]> {
  const supabase = await createClient();
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
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [products, categories, orders, discounts] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("discounts")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
  ]);

  return {
    totalProducts: products.count ?? 0,
    totalCategories: categories.count ?? 0,
    totalOrders: orders.count ?? 0,
    activeDiscounts: discounts.count ?? 0,
  };
}

export async function getRecentProducts(limit = 5) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as ProductWithRelations[]) ?? [];
}

export async function getAllProductsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*), product_images(*)")
    .order("created_at", { ascending: false });
  return (data as ProductWithRelations[]) ?? [];
}

export async function getAllCategoriesAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  return data ?? [];
}

export async function getAllDiscountsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export { PRODUCTS_PER_PAGE };
