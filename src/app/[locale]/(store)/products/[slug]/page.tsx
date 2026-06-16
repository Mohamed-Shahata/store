import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  getProductBySlugCached,
  getRelatedProductsCached,
  getActiveDiscountsCached,
  getStoreSettingsCached,
  incrementProductViewCount,
} from "@/lib/data/store-cache";
import { applyGlobalDiscount } from "@/lib/utils";
import { ProductDetails } from "@/components/store/product-details";
import { ProductSection } from "@/components/store/product-section";

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlugCached(slug);
  const t = await getTranslations({ locale, namespace: "metadata" });

  if (!product) {
    return { title: t("productNotFound") };
  }

  const images = product.product_images ?? [];
  const mainImage = images[0]?.image_url;

  return {
    title: product.name,
    description: product.description ?? `Buy ${product.name} at our store.`,
    openGraph: {
      title: product.name,
      description: product.description ?? undefined,
      images: mainImage ? [{ url: mainImage }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description ?? undefined,
      images: mainImage ? [mainImage] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const nav = await getTranslations("nav");

  const [product, discounts, settings] = await Promise.all([
    getProductBySlugCached(slug),
    getActiveDiscountsCached(),
    getStoreSettingsCached(),
  ]);

  if (!product) {
    notFound();
  }

  // Fire-and-forget: don't block the page render on this.
  void incrementProductViewCount(slug);

  const { finalPrice, badgeText } = applyGlobalDiscount(
    product.price,
    product.discount_price,
    discounts,
  );

  const relatedProducts = await getRelatedProductsCached(
    product.id,
    product.category_id,
  );

  const images = (product.product_images ?? [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => img.image_url);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images,
    offers: {
      "@type": "Offer",
      price: finalPrice,
      priceCurrency: "EGP",
      availability:
        product.stock_quantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `${siteUrl}/${locale}/products/${product.slug}`,
    },
    brand: {
      "@type": "Brand",
      name: settings?.store_name ?? nav("premiumStore"),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetails
        product={product}
        finalPrice={finalPrice}
        badgeText={badgeText}
        images={images}
      />
      <ProductSection
        title={t("relatedProducts")}
        products={relatedProducts}
        discounts={discounts}
      />
    </>
  );
}
