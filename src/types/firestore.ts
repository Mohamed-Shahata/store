/**
 * Firestore data model (NoSQL, denormalized) — replaces the relational
 * `database.ts` Supabase types.
 *
 * Collections:
 *   admins/{uid}            -> AdminDoc      (doc id === Firebase Auth uid)
 *   categories/{id}         -> CategoryDoc
 *   products/{id}           -> ProductDoc    (images embedded, no join table)
 *   discounts/{id}          -> DiscountDoc
 *   storeSettings/main      -> StoreSettingsDoc (singleton doc)
 *   orders/{id}             -> OrderDoc
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface AdminDoc {
  email: string;
  isSuperAdmin: boolean;
  createdAt: string; // ISO string
}
export type AdminUser = AdminDoc & { id: string };

export interface CategoryDoc {
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  createdAt: string;
}
export type Category = CategoryDoc & { id: string };

export interface ProductImage {
  imageUrl: string;
  sortOrder: number;
}

export interface ProductDoc {
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  stockQuantity: number;
  categoryId: string | null;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  active: boolean;
  archived: boolean;
  viewCount: number;
  images: ProductImage[]; // embedded — was the `product_images` table
  createdAt: string;
  updatedAt: string;
}
export type Product = ProductDoc & { id: string };

export type ProductWithRelations = Product & {
  category?: Category | null;
};

export interface DiscountDoc {
  title: string;
  type: "percentage" | "fixed";
  value: number;
  badgeText: string | null;
  startDate: string | null;
  endDate: string | null;
  active: boolean;
  createdAt: string;
}
export type Discount = DiscountDoc & { id: string };

export interface StoreSettingsDoc {
  storeName: string;
  storeDescription: string | null;
  logo: string | null;
  whatsappNumber: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  bannerImages: Json;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  updatedAt: string;
}
export type StoreSettings = StoreSettingsDoc & { id: string };

export interface OrderDoc {
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  customerPhone2: string | null;
  items: Json;
  totalPrice: number;
  status: string;
  createdAt: string;
}
export type Order = OrderDoc & { id: string };

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountPrice: number | null;
  finalPrice: number;
  quantity: number;
  image: string;
  stockQuantity: number;
};

export type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "popular";
