export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          email: string;
          is_super_admin: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          is_super_admin?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          is_super_admin?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          price: number;
          discount_price: number | null;
          stock_quantity: number;
          category_id: string | null;
          featured: boolean;
          best_seller: boolean;
          new_arrival: boolean;
          active: boolean;
          archived: boolean;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          price: number;
          discount_price?: number | null;
          stock_quantity?: number;
          category_id?: string | null;
          featured?: boolean;
          best_seller?: boolean;
          new_arrival?: boolean;
          active?: boolean;
          archived?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          price?: number;
          discount_price?: number | null;
          stock_quantity?: number;
          category_id?: string | null;
          featured?: boolean;
          best_seller?: boolean;
          new_arrival?: boolean;
          active?: boolean;
          archived?: boolean;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      discounts: {
        Row: {
          id: string;
          title: string;
          type: "percentage" | "fixed";
          value: number;
          badge_text: string | null;
          start_date: string | null;
          end_date: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: "percentage" | "fixed";
          value: number;
          badge_text?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          type?: "percentage" | "fixed";
          value?: number;
          badge_text?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: string;
          store_name: string;
          store_description: string | null;
          logo: string | null;
          whatsapp_number: string;
          facebook_url: string | null;
          instagram_url: string | null;
          tiktok_url: string | null;
          banner_images: Json;
          seo_title: string | null;
          seo_description: string | null;
          seo_keywords: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_name?: string;
          store_description?: string | null;
          logo?: string | null;
          whatsapp_number?: string;
          facebook_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          banner_images?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          store_name?: string;
          store_description?: string | null;
          logo?: string | null;
          whatsapp_number?: string;
          facebook_url?: string | null;
          instagram_url?: string | null;
          tiktok_url?: string | null;
          banner_images?: Json;
          seo_title?: string | null;
          seo_description?: string | null;
          seo_keywords?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_address: string;
          customer_phone: string;
          customer_phone_2: string | null;
          items: Json;
          total_price: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_address: string;
          customer_phone: string;
          customer_phone_2?: string | null;
          items: Json;
          total_price: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_address?: string;
          customer_phone?: string;
          customer_phone_2?: string | null;
          items?: Json;
          total_price?: number;
          status?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_product_view_count: {
        Args: { product_slug: string };
        Returns: void;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductImage =
  Database["public"]["Tables"]["product_images"]["Row"];
export type Discount = Database["public"]["Tables"]["discounts"]["Row"];
export type StoreSettings =
  Database["public"]["Tables"]["store_settings"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];

export type ProductWithRelations = Product & {
  category?: Category | null;
  product_images?: ProductImage[];
};

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
