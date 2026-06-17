import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  discount_price: z.number().min(0).nullable().optional(),
  stock_quantity: z.number().int().min(0, "Stock must be non-negative"),
  category_id: z.string().uuid().optional().nullable(),
  featured: z.boolean(),
  best_seller: z.boolean(),
  new_arrival: z.boolean(),
  active: z.boolean(),
  archived: z.boolean(),
});

export const discountSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive("Value must be positive"),
  badge_text: z.string().optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  active: z.boolean(),
});

export const addAdminSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const changeEmailSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email address"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const storeSettingsSchema = z.object({
  store_name: z.string().min(2, "Store name is required"),
  store_description: z.string().optional(),
  logo: z.string().optional().nullable(),
  whatsapp_number: z.string().min(10, "WhatsApp number is required"),
  facebook_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal("")),
  tiktok_url: z.string().url().optional().or(z.literal("")),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
});

export const getCheckoutSchema = (messages: {
  nameRequired: string;
  nameInvalid: string;
  addressRequired: string;
  phoneRequired: string;
  phoneInvalid: string;
  phone2Invalid: string;
}) =>
  z.object({
    customer_name: z
      .string()
      .min(2, messages.nameRequired)
      .refine(
        (value) => value.trim().split(/\s+/).filter(Boolean).length >= 3,
        messages.nameInvalid,
      ),
    customer_address: z.string().min(5, messages.addressRequired),
    customer_phone: z
      .string()
      .min(10, messages.phoneRequired)
      .regex(/^[0-9+\-\s()]+$/, messages.phoneInvalid),
    customer_phone_2: z
      .string()
      .optional()
      .or(z.literal(""))
      .refine(
        (value) => !value || /^[0-9+\-\s()]+$/.test(value),
        messages.phone2Invalid,
      ),
  });

export type CheckoutFormData = z.infer<ReturnType<typeof getCheckoutSchema>>;

export type LoginFormData = z.infer<typeof loginSchema>;
export type CategoryFormData = z.infer<typeof categorySchema>;
export type ProductFormData = z.infer<typeof productSchema>;
export type DiscountFormData = z.infer<typeof discountSchema>;
export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;
export type AddAdminFormData = z.infer<typeof addAdminSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
