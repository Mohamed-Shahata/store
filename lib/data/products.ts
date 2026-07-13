import "server-only";
import { getAdminDb } from "@/lib/firebase/admin";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import type {
  Category,
  Discount,
  Product,
  ProductWithRelations,
  SortOption,
  StoreSettings,
} from "@/types/firestore";
import { serializeFirestoreData } from "../firebase/serialize";

const PRODUCTS_PER_PAGE = 12;

async function attachCategory(product: Product): Promise<ProductWithRelations> {
  if (!product.categoryId)
    return serializeFirestoreData({ ...product, category: null });
  const snap = await getAdminDb()
    .collection("categories")
    .doc(product.categoryId)
    .get();
  return serializeFirestoreData({
    ...product,
    category: snap.exists
      ? ({ id: snap.id, ...snap.data() } as Category)
      : null,
  });
}

async function attachCategories(
  products: Product[],
): Promise<ProductWithRelations[]> {
  return Promise.all(products.map(attachCategory));
}

export async function getStoreSettings(): Promise<StoreSettings | null> {
  if (!isFirebaseConfigured()) return null;
  const snap = await getAdminDb().collection("storeSettings").doc("main").get();
  if (!snap.exists) return null;
  return serializeFirestoreData({
    id: snap.id,
    ...snap.data(),
  } as StoreSettings);
}

export async function getCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured()) return [];
  const snap = await getAdminDb()
    .collection("categories")
    .orderBy("name")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function getActiveDiscounts(): Promise<Discount[]> {
  const snap = await getAdminDb()
    .collection("discounts")
    .where("active", "==", true)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Discount);
}

export async function getFeaturedProducts(
  limit = 8,
): Promise<ProductWithRelations[]> {
  const snap = await getAdminDb()
    .collection("products")
    .where("featured", "==", true)
    .where("active", "==", true)
    .where("archived", "==", false)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return attachCategories(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );
}

export async function getNewArrivals(
  limit = 8,
): Promise<ProductWithRelations[]> {
  const snap = await getAdminDb()
    .collection("products")
    .where("newArrival", "==", true)
    .where("active", "==", true)
    .where("archived", "==", false)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return attachCategories(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );
}

export async function getBestSellers(
  limit = 8,
): Promise<ProductWithRelations[]> {
  const snap = await getAdminDb()
    .collection("products")
    .where("bestSeller", "==", true)
    .where("active", "==", true)
    .where("archived", "==", false)
    .orderBy("viewCount", "desc")
    .limit(limit)
    .get();
  return attachCategories(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );
}

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOption;
  page?: number;
}

/**
 * NOTE on `search`: Firestore has no full-text `ilike` operator. This does
 * a prefix match on `name` (via a `>=`/`<=` range). For real substring/
 * fuzzy search across name+description, wire up Algolia or Typesense
 * (common Firebase pairing) via a Cloud Function sync.
 */
export async function getProducts(filters: ProductFilters = {}) {
  const page = filters.page ?? 1;
  let query = getAdminDb()
    .collection("products")
    .where("active", "==", true)
    .where("archived", "==", false) as FirebaseFirestore.Query;

  if (filters.category) {
    query = query.where("categoryId", "==", filters.category);
  }
  if (filters.minPrice !== undefined) {
    query = query.where("price", ">=", filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    query = query.where("price", "<=", filters.maxPrice);
  }

  if (filters.search) {
    const term = filters.search;
    query = query
      .orderBy("name")
      .startAt(term)
      .endAt(term + "\uf8ff");
  } else {
    switch (filters.sort) {
      case "oldest":
        query = query.orderBy("createdAt", "asc");
        break;
      case "price_asc":
        query = query.orderBy("price", "asc");
        break;
      case "price_desc":
        query = query.orderBy("price", "desc");
        break;
      case "popular":
        query = query.orderBy("viewCount", "desc");
        break;
      default:
        query = query.orderBy("createdAt", "desc");
    }
  }

  const countSnap = await query.count().get();
  const totalCount = countSnap.data().count;

  const from = (page - 1) * PRODUCTS_PER_PAGE;
  const pageSnap = await query.limit(from + PRODUCTS_PER_PAGE).get();
  const pageDocs = pageSnap.docs.slice(from);

  const products = await attachCategories(
    pageDocs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / PRODUCTS_PER_PAGE),
    currentPage: page,
  };
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductWithRelations | null> {
  const snap = await getAdminDb()
    .collection("products")
    .where("slug", "==", slug)
    .where("active", "==", true)
    .where("archived", "==", false)
    .limit(1)
    .get();

  if (snap.empty) return null;
  const doc = snap.docs[0];
  const product = { id: doc.id, ...doc.data() } as Product;

  await doc.ref.update({
    viewCount: (product.viewCount ?? 0) + 1,
  });

  return attachCategory(product);
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string | null,
  limit = 4,
): Promise<ProductWithRelations[]> {
  let query = getAdminDb()
    .collection("products")
    .where("active", "==", true)
    .where("archived", "==", false) as FirebaseFirestore.Query;

  if (categoryId) {
    query = query.where("categoryId", "==", categoryId);
  }

  const snap = await query
    .orderBy("createdAt", "desc")
    .limit(limit + 1)
    .get();

  const products = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Product)
    .filter((p) => p.id !== productId)
    .slice(0, limit);

  return attachCategories(products);
}

export async function getDashboardStats() {
  const db = getAdminDb();
  const [products, categories, orders, discounts] = await Promise.all([
    db.collection("products").count().get(),
    db.collection("categories").count().get(),
    db.collection("orders").count().get(),
    db.collection("discounts").where("active", "==", true).count().get(),
  ]);

  return {
    totalProducts: products.data().count,
    totalCategories: categories.data().count,
    totalOrders: orders.data().count,
    activeDiscounts: discounts.data().count,
  };
}

export async function getRecentProducts(limit = 5) {
  const snap = await getAdminDb()
    .collection("products")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return attachCategories(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );
}

export async function getAllProductsAdmin() {
  const snap = await getAdminDb()
    .collection("products")
    .orderBy("createdAt", "desc")
    .get();
  return attachCategories(
    snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Product),
  );
}

export async function getAllCategoriesAdmin() {
  const snap = await getAdminDb()
    .collection("categories")
    .orderBy("name")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

export async function getAllDiscountsAdmin() {
  const snap = await getAdminDb()
    .collection("discounts")
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Discount);
}

export { PRODUCTS_PER_PAGE };
