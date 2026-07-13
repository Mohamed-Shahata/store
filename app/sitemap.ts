import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase/admin";
import { routing } from "@/i18n/routing";

function toSafeDate(value: unknown): Date {
  if (!value) return new Date();
  // Firestore Admin SDK Timestamp has a `.toDate()` method
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: unknown }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }
  const d = new Date(value as string);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const staticPaths = ["", "/products", "/cart"];

  const staticPages: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency:
        path === ""
          ? ("daily" as const)
          : path === "/products"
            ? ("daily" as const)
            : ("monthly" as const),
      priority: path === "" ? 1 : path === "/products" ? 0.9 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [loc, `${siteUrl}/${loc}${path}`]),
        ),
      },
    })),
  );

  try {
    const snap = await getAdminDb()
      .collection("products")
      .where("active", "==", true)
      .where("archived", "==", false)
      .get();

    const products = snap.docs.map(
      (d) =>
        d.data() as {
          slug: string;
          updatedAt?: { toDate?: () => Date } | string | null;
        },
    );

    const productPages: MetadataRoute.Sitemap =
      products.flatMap((product) =>
        routing.locales.map((locale) => ({
          url: `${siteUrl}/${locale}/products/${product.slug}`,
          lastModified: toSafeDate(product.updatedAt),
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates: {
            languages: Object.fromEntries(
              routing.locales.map((loc) => [
                loc,
                `${siteUrl}/${loc}/products/${product.slug}`,
              ]),
            ),
          },
        })),
      ) ?? [];

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
