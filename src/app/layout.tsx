import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { LocaleHtmlAttributes } from "@/components/providers/locale-html-attributes";
import { getStoreSettings } from "@/lib/data/products";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings?.seo_title ?? settings?.store_name ?? "Premium Store",
      template: `%s | ${settings?.store_name ?? "Premium Store"}`,
    },
    description:
      settings?.seo_description ??
      settings?.store_description ??
      "Premium online store with the best products.",
    keywords: settings?.seo_keywords?.split(",").map((k) => k.trim()),
    openGraph: {
      type: "website",
      locale: "en_EG",
      alternateLocale: ["ar_EG"],
      url: siteUrl,
      siteName: settings?.store_name ?? "Premium Store",
      title: settings?.seo_title ?? settings?.store_name ?? "Premium Store",
      description:
        settings?.seo_description ??
        settings?.store_description ??
        "Premium online store",
      images: settings?.logo ? [{ url: settings.logo }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: settings?.seo_title ?? settings?.store_name ?? "Premium Store",
      description:
        settings?.seo_description ??
        settings?.store_description ??
        "Premium online store",
      images: settings?.logo ? [settings.logo] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LocaleHtmlAttributes />
          {children}
          <ToastProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}
