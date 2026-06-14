import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { routing } from "@/i18n/routing";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticPaths = ["", "/products", "/cart"];

  const staticPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("daily" as const) : path === "/products" ? ("daily" as const) : ("monthly" as const),
      priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, `${siteUrl}/${loc}${path}`])
        ),
      },
    }))
  );

  try {
    const supabase = await createClient();
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("active", true)
      .eq("archived", false);

    const productPages: MetadataRoute.Sitemap =
      products?.flatMap((product) =>
        routing.locales.map((locale) => ({
          url: `${siteUrl}/${locale}/products/${product.slug}`,
          lastModified: new Date(product.updated_at),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((loc) => [
                loc,
                `${siteUrl}/${loc}/products/${product.slug}`,
              ])
            ),
          },
        }))
      ) ?? [];

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
